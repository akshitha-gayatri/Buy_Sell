const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },

  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    },
    hashedOTP: {
      type: String,
      required: true
    },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}],
});

module.exports = mongoose.model('Order', orderSchema);
