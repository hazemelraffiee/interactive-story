import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const readingProgressSchema = new mongoose.Schema({
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  currentChapter: String,
  currentScene: String,
  progress: Number,
  lastRead: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: '' // Default avatar URL could be set here
  },
  bio: {
    type: String,
    default: ''
  },
  favoriteStories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  }],
  readingHistory: [readingProgressSchema],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLoginDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return token;
};

export default mongoose.model('User', userSchema);