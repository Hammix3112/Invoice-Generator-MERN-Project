const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: String, required: true },
  reference: { type: String, required: true },
  total: { type: Number, required: true },
  currency: { type: String, required: true },
  items: [
    {
      description: String,
      quantity: Number,
      price: Number
    }
  ],
  date: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
