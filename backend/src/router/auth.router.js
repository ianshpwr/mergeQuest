import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const router = express.Router();

// GitHub OAuth URLs
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// GitHub OAuth login route
router.get('/login', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/callback`;
  const scope = 'user:email';

  const authUrl = `${GITHUB_AUTH_URL}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

  res.redirect(authUrl);
});

// GitHub OAuth callback route
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(GITHUB_TOKEN_URL, {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/callback`
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    // Get user information from GitHub
    const userResponse = await axios.get(GITHUB_USER_URL, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MergeQuest-App'
      }
    });

    const githubUser = userResponse.data;

    // Get user emails
    const emailsResponse = await axios.get(`${GITHUB_USER_URL}/emails`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MergeQuest-App'
      }
    });

    const primaryEmail = emailsResponse.data.find(email => email.primary)?.email || githubUser.email;

    if (!primaryEmail) {
      return res.status(400).json({ error: 'No email found in GitHub account' });
    }

    // Check if user exists
    let user = await User.findOne({
      $or: [{ github_id: githubUser.id }, { email: primaryEmail }]
    });

    if (user) {
      // Update user with latest info
      user = await User.findByIdAndUpdate(
        user._id,
        {
          name: githubUser.name || githubUser.login,
          avatar_url: githubUser.avatar_url,
          access_token: access_token,
          last_synced_at: new Date()
        },
        { new: true, runValidators: true }
      ).select('-access_token');
    } else {
      // Create new user
      user = new User({
        github_id: githubUser.id,
        email: primaryEmail,
        name: githubUser.name || githubUser.login,
        avatar_url: githubUser.avatar_url,
        access_token: access_token,
        total_points: 0
      });

      await user.save();
      user = user.toObject();
      delete user.access_token;
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set JWT as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?auth=success`);

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?auth=error`);
  }
});

// GitHub OAuth exchange endpoint
router.post('/github', async (req, res) => {
  console.log('=== GitHub OAuth Endpoint Hit ==='); // Debug log
  console.log('Request body:', req.body); // Debug log
  
  try {
    const { code } = req.body;

    console.log("OAuth exchange received code:", code ? "present" : "missing"); // Debug log
    console.log("Full code value:", code); // Debug log

    if (!code) {
      console.log('ERROR: No code provided'); // Debug log
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(GITHUB_TOKEN_URL, {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: "http://localhost:3000/oauth-callback" // Must match GitHub OAuth app exactly
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get access token from GitHub'
      });
    }

    // Get user information from GitHub
    const userResponse = await axios.get(GITHUB_USER_URL, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MergeQuest-App'
      }
    });

    const githubUser = userResponse.data;

    // Get user emails
    const emailsResponse = await axios.get(`${GITHUB_USER_URL}/emails`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MergeQuest-App'
      }
    });

    const primaryEmail = emailsResponse.data.find(email => email.primary)?.email || githubUser.email;

    if (!primaryEmail) {
      return res.status(400).json({
        success: false,
        message: 'No email found in GitHub account'
      });
    }

    // For testing without MongoDB, return user data without saving to DB
    const user = {
      github_id: githubUser.id,
      email: primaryEmail,
      name: githubUser.name || githubUser.login,
      avatar_url: githubUser.avatar_url,
      total_points: 0
    };

    // Generate JWT token (using a temporary secret for testing)
    const token = jwt.sign(
      { github_id: githubUser.id, email: primaryEmail },
      process.env.JWT_SECRET || 'temporary-secret-for-testing',
      { expiresIn: '7d' }
    );

    console.log('Generated JWT token:', token); // Debug log

    // Set JWT as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.log('Authentication successful for user:', user.email); // Debug log

    res.json({
      success: true,
      message: 'Authentication successful',
      user: user,
      token: token // Include token in response for debugging
    });

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

export default router;
