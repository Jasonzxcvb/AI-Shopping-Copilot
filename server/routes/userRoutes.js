const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Define routes
// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role, userId: user.userId }, 'your_secret_key', { expiresIn: '1h' });
    res.json({ username: user.username, role: user.role, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Find the maximum userId in the collection
    const lastUser = await User.findOne().sort({ userId: -1 }); // Sort by descending userId
    const nextUserId = lastUser ? lastUser.userId + 1 : 1; // Increment userId or start at 1

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the role "user"
    const newUser = new User({
      userId: nextUserId,
      username,
      password: hashedPassword,
      role: 'user', // Default role
      email,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Check if username exists
router.get('/exists/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    res.json({ exists: !!user }); // Return true if user exists, otherwise false
  } catch (err) {
    console.error('Error checking username:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get user by userId
router.get('/userId/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }); // Query by userId
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by userId:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new user (Registration)
router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user by ID
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password, profile } = req.body;
    const updatedFields = {};

    if (name) updatedFields.username = name; // Match the schema field
    if (email) updatedFields.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(password, salt);
    } // Ensure password hashing if needed
    if (profile) {
      if (profile.addresses) updatedFields['profile.addresses'] = profile.addresses;
      if (profile.paymentMethods) updatedFields['profile.paymentMethods'] = profile.paymentMethods;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ message: 'Invalid data format' });
  }
});


// Delete user by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ userId: req.params.id });
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



