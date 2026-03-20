const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const mongodbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ComputerStore';
mongoose.connect(mongodbURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB server connection error:', err));

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

const productRoutes = require('./routes/productRoutes');
app.use('/api', productRoutes);


// Launch Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
