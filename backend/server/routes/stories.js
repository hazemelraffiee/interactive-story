import express from 'express';
import Story from '../models/Story.js';
import { auth } from '../middleware/auth.js';
import { VALID_GENRES } from '../models/Story.js';

const router = express.Router();

// GET /api/stories/genres
router.get('/genres', (req, res) => {
  res.json({
    genres: VALID_GENRES
  });
});

router.get('/public', async (req, res) => {
  try {
    const { genres, sort = 'trending' } = req.query;

    let query = {
      status: 'published',
      isPrivate: false
    };

    if (genres) {
      const genreArray = Array.isArray(genres) ? genres : [genres];
      const filteredGenres = genreArray
        .filter(g => g.toLowerCase() !== 'all')
        .map(g => new RegExp(g, 'i')); // Make it case insensitive
      if (filteredGenres.length > 0) {
        query.genres = { $in: filteredGenres };
      }
    }

    // Add sorting logic
    let sortOptions = {};
    switch (sort) {
      case 'trending':
        sortOptions = { 'stats.views': -1 };
        break;
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'top':
        sortOptions = { 'stats.likes': -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const stories = await Story.find(query)
      .sort(sortOptions)
      .populate('author', 'username avatar')
      .limit(20);  // Optional: limit results

    res.json(stories);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching stories', error: error.message });
  }
});

// Get all stories by current user
router.get('/mystories', auth, async (req, res) => {
  try {
    const stories = await Story.find({ author: req.user.userId })
      .sort({ updatedAt: -1 })
      .populate('author', 'username avatar');

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stories', error: error.message });
  }
});

// Get a single story by ID - This route should come AFTER the specific /public route
router.get('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'username avatar');

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Rest of your existing single story route logic...

    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching story', error: error.message });
  }
});

// Create a new story
router.post('/', auth, async (req, res) => {
  try {
    const { title, chapters = {}, isPrivate = true, genres = [] } = req.body;

    // Validate genres
    if (!genres.every(genre => VALID_GENRES.includes(genre))) {
      return res.status(400).json({
        message: 'Invalid genre(s) specified',
        validGenres: VALID_GENRES
      });
    }

    const newStory = new Story({
      title,
      chapters,
      isPrivate,
      genres,
      author: req.user.userId,
      status: 'draft',
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
        completionRate: 0
      }
    });

    await newStory.save();
    res.status(201).json(newStory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating story', error: error.message });
  }
});

// Update a story
router.put('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this story' });
    }

    // Update only allowed fields
    const { title, chapters, isPrivate, status, genres } = req.body;

    if (title) story.title = title;
    if (chapters) story.chapters = chapters;
    if (typeof isPrivate === 'boolean') story.isPrivate = isPrivate;
    if (genres) {
      // Validate genres
      if (!genres.every(genre => VALID_GENRES.includes(genre))) {
        return res.status(400).json({
          message: 'Invalid genre(s) specified',
          validGenres: VALID_GENRES
        });
      }
      story.genres = genres;
    }
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      story.status = status;
    }

    story.updatedAt = new Date();
    await story.save();

    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error updating story', error: error.message });
  }
});

// Duplicate a story
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalStory = await Story.findById(req.params.id);

    if (!originalStory) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (originalStory.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to duplicate this story' });
    }

    const duplicatedStory = new Story({
      title: `${originalStory.title} (Copy)`,
      chapters: originalStory.chapters,
      isPrivate: true,
      author: req.user.userId,
      status: 'draft',
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
        completionRate: 0
      }
    });

    await duplicatedStory.save();
    res.status(201).json(duplicatedStory);
  } catch (error) {
    res.status(500).json({ message: 'Error duplicating story', error: error.message });
  }
});

// Change story status (publish/unpublish/archive)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // First, validate the requested status
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Find the story and ensure it exists
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ 
        message: 'Story not found' 
      });
    }

    // Verify ownership - only the author can change status
    if (story.author.toString() !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to modify this story' 
      });
    }

    // Special handling for publishing
    if (status === 'published') {
      // When publishing, we need to validate that the story is ready
      if (!story.title) {
        return res.status(400).json({
          message: 'Cannot publish: Story must have a title'
        });
      }

      if (!story.chapters || Object.keys(story.chapters).length === 0) {
        return res.status(400).json({
          message: 'Cannot publish: Story must have at least one chapter'
        });
      }

      // Automatically make the story public when publishing
      story.isPrivate = false;
    }

    // If moving to draft or archived, we might want to make it private
    if (status === 'draft' || status === 'archived') {
      story.isPrivate = true;
    }

    // Update the story's status and timestamp
    story.status = status;
    story.updatedAt = new Date();
    
    // Save the changes
    await story.save();

    // Return comprehensive status update information
    res.json({
      message: `Story ${status === 'published' ? 'published and made public' : 
                status === 'archived' ? 'archived and made private' :
                'moved to drafts and made private'}`,
      story: {
        id: story._id,
        title: story.title,
        status: story.status,
        isPrivate: story.isPrivate,
        updatedAt: story.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating story status:', error);
    res.status(500).json({ 
      message: 'Error updating story status', 
      error: error.message 
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    // First, find the story to check ownership
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: 'Story not found'
      });
    }

    // Check if the user owns the story
    if (story.author.toString() !== req.user.userId) {
      return res.status(403).json({
        message: 'Not authorized to delete this story'
      });
    }

    // If we get here, the user is authorized to delete the story
    await Story.findByIdAndDelete(req.params.id);

    // Return a success response
    res.json({
      message: 'Story deleted successfully',
      deletedStoryId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({
      message: 'Error deleting story',
      error: error.message
    });
  }
});

export default router;