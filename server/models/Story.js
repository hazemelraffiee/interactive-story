import mongoose from 'mongoose';

const decisionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  nextScene: {
    type: String,
    required: true
  }
});

const sceneSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  decisions: [decisionSchema]
});

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  scenes: {
    type: Map,
    of: sceneSchema
  }
});

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  excerpt: String,
  thumbnail: String,
  tags: [String],
  genre: String,
  isPrivate: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  chapters: {
    type: Map,
    of: chapterSchema
  },
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  achievements: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
storySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Story', storySchema);