const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer: { type: String, required: true },
  reference: { type: String, required: true },
  total: { type: Number, required: true },
  currency: { type: String, required: true },

  from: { type: String },
  shipTo: { type: String },
  poNumber: { type: String },
  paymentTerms: { type: String },
  notes: { type: String },
  terms: { type: String },

  amountPaid: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  isTaxPercentage: { type: Boolean, default: true },
  isDiscountPercentage: { type: Boolean, default: true },

  customLabels: { type: Object },

  items: [
    {
      description: String,
      quantity: Number,
      rate: Number, // 🔄 Replacing "price" to match your frontend
    },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: String,
  },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
