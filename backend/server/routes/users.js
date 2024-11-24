import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('favoriteStories');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, bio, avatar } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username or email is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      user.email = email;
    }

    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get user's favorite stories
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'favoriteStories',
        select: 'title author excerpt thumbnail tags stats',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.favoriteStories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
});

// Get user's reading history
router.get('/reading-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'readingHistory',
        populate: {
          path: 'story',
          select: 'title author thumbnail'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.readingHistory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reading history', error: error.message });
  }
});

// Update reading progress
router.post('/reading-progress', auth, async (req, res) => {
  try {
    const { storyId, chapterId, sceneId, progress } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create reading progress entry
    const progressEntry = user.readingHistory.find(
      entry => entry.story.toString() === storyId
    );

    if (progressEntry) {
      progressEntry.currentChapter = chapterId;
      progressEntry.currentScene = sceneId;
      progressEntry.progress = progress;
      progressEntry.lastRead = new Date();
    } else {
      user.readingHistory.push({
        story: storyId,
        currentChapter: chapterId,
        currentScene: sceneId,
        progress,
        lastRead: new Date()
      });
    }

    await user.save();
    res.json({ message: 'Reading progress updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating reading progress', error: error.message });
  }
});

// Delete reading history entry
router.delete('/reading-history/:storyId', auth, async (req, res) => {
  try {
    const { storyId } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.readingHistory = user.readingHistory.filter(
      entry => entry.story.toString() !== storyId
    );

    await user.save();
    res.json({ message: 'Reading history entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting reading history', error: error.message });
  }
});

export default router;