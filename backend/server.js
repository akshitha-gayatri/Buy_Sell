const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Item = require('./models/Item');
const Order = require('./models/Order');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();
const cors = require('cors');
const app = express();
app.use(bodyParser.json());

app.use(cors());

app.use(express.json())
require('./dotenv').config();
const JWT_SECRET = 'process.env.SECRET_KEY'; 



mongoose.connect('mongodb+srv://akshithagayatriv:cG6gBe3xFfRScHpK@cluster0.jqrtm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

//################################################################################################
//  MIDDLEWARE
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};


async function verifyCaptcha(token) {
  try {
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      const response = await axios.post(
          'https://www.google.com/recaptcha/api/siteverify',
          null,
          {
              params: {
                  secret: secretKey,
                  response: token
              }
          }
      );
      console.log('CAPTCHA verification response:', response.data); // For debugging
      return response.data.success;
  } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return false;
  }
}

app.post('/api/auth/refresh-token', verifyToken, async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      const token = jwt.sign(
          { 
              id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName
          },
          JWT_SECRET,
          { expiresIn: '7d' } 
      );

      res.status(200).json({
          token,
          user: {
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
          }
      });
  } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

//################################################################################################
// Login and Registration routes
app.post('/api/auth/register', async (req, res) => {
  console.log('Registration attempt');
  const { firstName, lastName, email, age, contactNumber, password, captchaToken } = req.body;


  // console.log('Received captcha token:', captchaToken);

  if (!captchaToken) {
      return res.status(400).json({ message: 'CAPTCHA token is required.' });
  }

  try {
      const isCaptchaValid = await verifyCaptcha(captchaToken);
      console.log('CAPTCHA validation result:', isCaptchaValid);

      if (!isCaptchaValid) {
          return res.status(400).json({ message: 'CAPTCHA verification failed.' });
      }
  } catch (error) {
      console.error('CAPTCHA verification error:', error);
      return res.status(500).json({ message: 'CAPTCHA verification failed.' });
  }

  if (!firstName || !lastName || !email || !age || !contactNumber || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'Email is already registered.' });
      }

      const user = new User({
          firstName,
          lastName,
          email,
          age,
          contactNumber,
          password,
      });

      await user.save();
      console.log('User registered successfully:', email);
      
      res.status(201).json({ 
          message: 'User registered successfully. Please login.' 
      });
  } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(404).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Login successful for:', email);

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

//########################################################################################################
// Profile routes
app.get('/api/auth/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Internal server error.-3' });
    }
});


app.put('/api/auth/profile', verifyToken, async (req, res) => {
    const { firstName, lastName, age, contactNumber, password } = req.body;

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (age) updates.age = age;
    if (contactNumber) updates.contactNumber = contactNumber;

    if (password) {
        // Hash the password before saving
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    try {
        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.password = undefined;

        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

//########################################################################################################
// Items routes
app.get('/api/items', async (req, res) => {
    try {
      const { search, categories } = req.query;
      
      let query = {};
  
      if (search && search.trim() !== '') {
        query.name = { $regex: search.trim(), $options: 'i' };
      }
  
      // Category filtering
      if (categories && categories.trim() !== '') {
        const categoryArray = categories.split(',').filter(cat => cat.trim());
        if (categoryArray.length > 0) {
          query.category = { $in: categoryArray };
        }
      }
  
      const items = await Item.find(query)
        .populate({
          path: 'seller',
          select: 'firstName lastName'
        });
  
      const transformedItems = items.map(item => ({
        ...item.toObject(),
        sellerName: `${item.seller.firstName} ${item.seller.lastName}`
      }));
  
      res.json(transformedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.get('/api/item/:id', async (req, res) => {
    try {
      const item = await Item.findById(req.params.id)
        .populate({
          path: 'seller',
          select: 'firstName lastName email contactNumber'
        });
  
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      res.json(item);
    } catch (error) {
      console.error('Error fetching item details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

//########################################################################################################
// Cart Routes

app.post('/cart', verifyToken, async (req, res) => {
    const { itemId } = req.body;
    const userId = req.user.id; 

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Add item to cart if not already present
        if (!user.cart.includes(itemId)) {
            user.cart.push(itemId);
            await user.save();
        }

        res.status(200).json({ message: 'Item added to cart!', cart: user.cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/cart', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'cart',
      populate: {
        path: 'seller',
        select: '_id firstName lastName'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // console.log('Cart items:', JSON.stringify(user.cart, null, 2));

    res.json({ 
      cart: user.cart,
      totalItems: user.cart.length
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

app.delete('/cart/:itemId', verifyToken, async (req, res) => {
  try {
      const userId = req.user.id;
      const itemId = req.params.itemId;
  
      const user = await User.findById(userId);
      if (!user) {
      return res.status(404).json({ message: 'User not found' });
      }
  
      user.cart = user.cart.filter(id => id.toString() !== itemId);
      await user.save();
  
      res.status(200).json({ 
      message: 'Item removed from cart', 
      cart: user.cart 
      });
  } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({ message: 'Failed to remove item from cart' });
  }
  });

//########################################################################################################
// Sell items routes
  app.post('/api/sell-items', verifyToken, async (req, res) => {
    try {
      const { name, description, price, category } = req.body;
      
      // Validate input
      if (!name || !price || !category) {
        return res.status(400).json({ message: 'Name, Price, and Category are required' });
      }
      const newItem = new Item({
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        seller: req.user.id
      });
  
      await newItem.save();
  
      res.status(201).json({ 
        message: 'Item listed successfully', 
        item: newItem 
      });
    } catch (error) {
      console.error('Error listing item:', error);
      res.status(500).json({ message: 'Failed to list item' });
    }
  });

//########################################################################################################
// Orders history routes 
app.get('/order-history', verifyToken, async (req, res) => {
  const currentUserEmail = req.user.email;
  
  try {
    const orders = await Order.find()
      .populate({
        path: 'items.item',
        populate: {
          path: 'seller',
          model: 'User',
          select: 'email'
        }
      })
      .exec();

    const pendingItems = [];
    const completedItems = [];
    const soldItems = [];


    orders.forEach(order => {
      order.items.forEach(orderItem => {
        if (!orderItem.item || !orderItem.item.seller) return;

        const processedItem = {
          orderId: order._id,
          transactionId: order.transactionId,
          itemId: orderItem.item._id,
          name: orderItem.item.name,
          price: orderItem.item.price,
          category: orderItem.item.category,
          description: orderItem.item.description,
          quantity: orderItem.quantity,
          status: orderItem.status,
          hashedOTP: orderItem.hashedOTP,
          seller: {
            _id: orderItem.item.seller._id,
            email: orderItem.item.seller.email
          },
          orderAmount: order.amount,
          orderDate: order._id.getTimestamp() 
        };

        if (orderItem.status === 'pending' && 
            order.buyerId.toString() === req.user.id.toString()) {
          pendingItems.push(processedItem);
        }
        
        if (orderItem.status === 'completed' && 
            order.buyerId.toString() === req.user.id.toString()) {
          completedItems.push(processedItem);
        }
        
        if (orderItem.status === 'completed' && 
            orderItem.item.seller.email === currentUserEmail) {
          soldItems.push(processedItem);
        }
      });
    });

    // console.log('Pending Items:', pendingItems.length);
    // console.log('Completed Items:', completedItems.length);
    // console.log('Sold Items:', soldItems.length);

    res.status(200).json({
      pendingItems,
      completedItems,
      soldItems
    });

  } catch (error) {
    console.error('Error in order history:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

//########################################################################################################
// Delivery routes
app.get('/deliver-items', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ 'items.status': 'pending' })
      .populate({
        path: 'items.item',
        populate: { path: 'seller', select: 'firstName lastName _id' }
      })
      .populate({
        path: 'buyerId',
        select: 'firstName lastName' // Populate buyer details
      });

    const deliveryItems = [];
    orders.forEach(order => {
      order.items.forEach(orderItem => {
        if (
          orderItem.status === 'pending' && // Ensure only pending items are included
          orderItem.item.seller &&
          orderItem.item.seller._id.toString() === req.user.id
        ) {
          deliveryItems.push({
            orderId: order._id,
            itemId: orderItem.item._id,
            itemName: orderItem.item.name,
            quantity: orderItem.quantity,
            status: orderItem.status,
            transactionId: order.transactionId,
            otpHash: orderItem.hashedOTP,
            buyerName: `${order.buyerId.firstName} ${order.buyerId.lastName}` // Include buyer name
          });
        }
      });
    });

    res.json(deliveryItems);
  } catch (error) {
    console.error('Error fetching delivery items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}


function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return {
    rawOTP: otp,
    hashedOTP: hashOTP(otp)
  };
}

//########################################################################################################

app.post('/place-order', async (req, res) => {
  const { transactionId, buyerId, items, amount } = req.body;

  if (!transactionId || !buyerId || !items || items.length === 0 || !amount) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    const orderItems = [];
    const rawOTPs = []; 
    for (const item of items) {
      const itemDetails = await Item.findById(item.itemId).populate('seller');
      
      if (!itemDetails) {
        return res.status(400).json({ message: `Item with ID ${item.itemId} not found` });
      }

   
      const { rawOTP, hashedOTP } = generateOTP();
      
      orderItems.push({
        item: itemDetails._id,
        quantity: item.quantity || 1,
        sellerId: itemDetails.seller._id,
        hashedOTP: hashedOTP,
        status: 'pending'
      });

      rawOTPs.push({
        itemId: item.itemId,
        itemName: itemDetails.name,
        rawOTP: rawOTP
      });
    }

    const order = new Order({
      transactionId,
      buyerId,
      amount,
      items: orderItems,
    });

    await order.save();
    await User.findByIdAndUpdate(buyerId, { $set: { cart: [] } });

    res.status(201).json({
      message: 'Order placed successfully!',
      order,
      rawOTPs 
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate transactionId. Please try again.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/deliver-items/complete', verifyToken, async (req, res) => {
  const { itemId, orderId, otp } = req.body;

  try {
    if (!itemId || !orderId || !otp) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const orderItem = order.items.find(item => item.item.toString() === itemId);
    if (!orderItem) return res.status(404).json({ message: "Item not found in order" });

    const hashedEnteredOTP = hashOTP(otp);
    const isOtpValid = hashedEnteredOTP === orderItem.hashedOTP;

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    orderItem.status = 'completed';
    await order.save();

    res.json({ message: "Delivery completed successfully" });
  } catch (error) {
    console.error("Error completing delivery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/regenerate-otp', verifyToken, async (req, res) => {
  const { orderId, itemId } = req.body;

  try {

    if (!orderId || !itemId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderItem = order.items.find(item => item.item.toString() === itemId);
    if (!orderItem) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    const { rawOTP, hashedOTP } = generateOTP();

    console.log('hashedotp',hashedOTP);
    console.log('rawotp',rawOTP);
    orderItem.hashedOTP = hashedOTP;
    await order.save();

    return res.status(200).json({ 
      rawOTP: rawOTP,
      message: "New OTP generated successfully" 
    });

  } catch (error) {
    console.error("Error regenerating OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//########################################################################################################
// Chatbot Routes

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const ChatMessage = require('./models/ChatMessage');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


app.post('/api/chat/start', verifyToken, async (req, res) => {
  try {
    const sessionId = uuidv4();
    res.json({ sessionId });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ message: 'Failed to start chat session' });
  }
});


app.post('/api/chat/message', verifyToken, async (req, res) => {
  const { sessionId, message } = req.body;
  const userId = req.user.id;

  try {
    await ChatMessage.createMessage({
      sessionId,
      userId,
      role: 'user',
      content: message
    });

    const history = await ChatMessage.find({
      sessionId: sessionId,
      userId: userId
    }).sort({ timestamp: 1 });

    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-pro"
    });

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 500,  
        temperature: 0.7
      }
    });

    const result = await chat.sendMessage(message);
    const botResponse = result.response.text();

    await ChatMessage.createMessage({
      sessionId,
      userId,
      role: 'assistant',
      content: botResponse
    });

    res.json({
      message: botResponse,
      sessionId
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({
      message: error.message || 'Failed to process message'
    });
  }
});

app.get('/api/chat/history/:sessionId', verifyToken, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      sessionId: req.params.sessionId,
      userId: req.user.id
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

const PORT = 4345;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

