import express from 'express';
import Story from '../models/Story.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all public stories
router.get('/', async (req, res) => {
  try {
    const { genre, search, sort = 'recent' } = req.query;
    
    let query = { status: 'published', isPrivate: false };
    if (genre && genre !== 'all') {
      query.genre = genre;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'trending':
        sortOption = { 'stats.views': -1 };
        break;
      case 'top':
        sortOption = { 'stats.likes': -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const stories = await Story.find(query)
      .sort(sortOption)
      .populate('author', 'username avatar')
      .limit(20);

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stories', error: error.message });
  }
});

// Get a single story
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'username avatar');
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Increment view count
    story.stats.views += 1;
    await story.save();

    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching story', error: error.message });
  }
});

// Create a new story
router.post('/', auth, async (req, res) => {
  try {
    const newStory = new Story({
      ...req.body,
      author: req.user.userId
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
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(story, req.body);
    await story.save();
    
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error updating story', error: error.message });
  }
});

// Delete a story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await story.remove();
    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting story', error: error.message });
  }
});

// Like/unlike a story
router.post('/:id/like', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const user = await User.findById(req.user.userId);
    const isLiked = user.favoriteStories.includes(story._id);

    if (isLiked) {
      // Unlike
      user.favoriteStories = user.favoriteStories.filter(
        id => id.toString() !== story._id.toString()
      );
      story.stats.likes -= 1;
    } else {
      // Like
      user.favoriteStories.push(story._id);
      story.stats.likes += 1;
    }

    await Promise.all([user.save(), story.save()]);
    res.json({ likes: story.stats.likes, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ message: 'Error updating like', error: error.message });
  }
});

export default router;