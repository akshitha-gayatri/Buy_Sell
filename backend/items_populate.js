const mongoose = require('mongoose');
const Item = require('./models/Item'); // Adjust the path to where your Item model is defined

// Connect to your MongoDB Atlas
mongoose.connect('mongodb+srv://akshithagayatriv:cG6gBe3xFfRScHpK@cluster0.jqrtm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect to MongoDB Atlas', err));

// Sample data for the Items collection
const items = [
  {
    name: 'Laptop',
    price: 55000,
    category: 'Electronics',
    seller: '678fc274a6a430cd02f5250f', // Replace with valid User ID
    description: 'A high-performance laptop with 16GB RAM and 512GB SSD.',
  },
  {
    name: 'Headphones',
    price: 2000,
    category: 'Accessories',
    seller: '678fc887d4017073700b86a0', // Replace with valid User ID
    description: 'Noise-cancelling headphones with superior sound quality.',
  },
  {
    name: 'Desk Chair',
    price: 4500,
    category: 'Furniture',
    seller: '678fc887d4017073700b86a0', // Replace with valid User ID
    description: 'Ergonomic chair with adjustable height and lumbar support.',
  },
  {
    name: 'Electric Kettle',
    price: 1200,
    category: 'Kitchen Appliances',
    seller: '678fc941d4017073700b86ac', // Replace with valid User ID
    description: '1.5L electric kettle with auto shut-off and boil-dry protection.',
  },
  {
    name: 'Physics Textbook',
    price: 800,
    category: 'Books',
    seller: '678fc941d4017073700b86ac', // Replace with valid User ID
    description: 'Comprehensive guide to modern physics principles.',
  },
  {
    name: 'Running Shoes',
    price: 3000,
    category: 'Clothing',
    seller: '678fc941d4017073700b86ac', // Replace with valid User ID
    description: 'Comfortable and durable running shoes for daily use.',
  },
  {
    name: 'Smartphone',
    price: 30000,
    category: 'Electronics',
    seller: '678fc941d4017073700b86ac', // Replace with valid User ID
    description: 'Latest smartphone with cutting-edge features and design.',
  },
  {
    name: 'Backpack',
    price: 1500,
    category: 'Accessories',
    seller: '678fc941d4017073700b86ac', // Replace with valid User ID
    description: 'Lightweight and durable backpack with multiple compartments.',
  },
  {
    name: 'Guitar',
    price: 10000,
    category: 'Musical Instruments',
    seller: '678fc941d4017073700b86ac', // Replace with valid User ID
    description: 'Acoustic guitar with great sound quality and craftsmanship.',
  },
  {
    name: 'Microwave Oven',
    price: 8000,
    category: 'Home Appliances',
    seller: '6790c9c58bf2f34d9e1ece67', // Replace with valid User ID
    description: 'Compact microwave oven with multiple cooking modes.',
  },
];

// Insert sample items into the database
Item.insertMany(items)
  .then(() => {
    console.log('Items added successfully');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error adding items', err);
    mongoose.disconnect();
  });
