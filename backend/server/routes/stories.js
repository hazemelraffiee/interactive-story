import express from 'express';
import Story from '../models/Story.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', async (req, res) => {
  try {
    const { genre, sort = 'trending' } = req.query;
    
    // Base query for published, non-private stories
    let query = {
      status: 'published',
      isPrivate: false
    };
    
    // Add genre filter if specified
    if (genre && genre !== 'all') {
      query.genre = genre.toLowerCase();
    }
    
    // Determine sort order
    let sortOptions = {};
    switch (sort) {
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'top':
        sortOptions = { 'stats.likes': -1 };
        break;
      default: // trending
        sortOptions = { 'stats.views': -1, createdAt: -1 };
    }

    const stories = await Story.find(query)
      .sort(sortOptions)
      .populate('author', 'username avatar')
      .limit(20);
    
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
    const { title, chapters = {}, isPrivate = true } = req.body;

    const newStory = new Story({
      title,
      chapters,
      isPrivate,
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
    const { title, chapters, isPrivate, status } = req.body;
    
    if (title) story.title = title;
    if (chapters) story.chapters = chapters;
    if (typeof isPrivate === 'boolean') story.isPrivate = isPrivate;
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
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    story.status = status;
    story.updatedAt = new Date();
    await story.save();
    
    res.json({ message: 'Story status updated', status });
  } catch (error) {
    res.status(500).json({ message: 'Error updating story status', error: error.message });
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