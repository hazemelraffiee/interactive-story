import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to generate JWT token
const generateToken = (userId, rememberMe = false) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '24h' }
  );
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login date
    user.lastLoginDate = new Date();
    await user.save();

    // Generate token with remember me option
    const token = generateToken(user._id, rememberMe);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Forgot Password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account with that email exists' });
    }

    // Generate reset token
    const token = user.generatePasswordResetToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Send email
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Password Reset Request',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6b46c1; text-align: center;">StoryLab Password Reset</h2>
          <p>Hello ${user.username},</p>
          <p>You requested a password reset for your StoryLab account.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #6b46c1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated email, please do not reply.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      message: 'Password reset instructions have been sent to your email',
      // Don't send the actual token in response for security
      emailSent: true 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});

// Reset Password route
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Password reset token is invalid or has expired' 
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: 'Your password has been changed',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6b46c1; text-align: center;">Password Changed Successfully</h2>
          <p>Hello ${user.username},</p>
          <p>This is a confirmation that the password for your StoryLab account has been changed.</p>
          <p>You can now login with your new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background-color: #6b46c1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Login to StoryLab
            </a>
          </div>
          <p>If you did not make this change, please contact support immediately.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated email, please do not reply.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      message: 'Password has been reset successfully',
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// Get current user route
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

export default router;