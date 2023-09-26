const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  orders: [
    {
      itemName: String,
      quantity: Number,
      subtotal: Number,
    },
  ],
  tipAmount: Number,
  totalCost: Number,
  timestamp: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Bill', billSchema);
