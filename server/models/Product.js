// @/models.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  releaseDate: {
    type: Date,
    required: false,
  },
  specifications: {
    type: Object,
    required: false,
  },
  reviews: {
    type: [String],
    required: false,
  },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = { Product };
