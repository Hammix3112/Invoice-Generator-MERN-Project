const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Invoice = require("../models/Invoices");

// POST: Create a new invoice
router.post("/", fetchuser, async (req, res) => {
  try {
    const {
      customer,
      reference,
      total,
      currency,
      dueDate,
      date,
      items,
      poNumber,
      paymentTerms,
      from,
      shipTo,
      notes,
      terms,
      amountPaid,
      tax,
      discount,
      shipping,
      isTaxPercentage,
      isDiscountPercentage,
      customLabels
    } = req.body;

    const newInvoice = new Invoice({
      customer,
      reference,
      total,
      currency,
      dueDate,
      date,
      items,
      poNumber,
      paymentTerms,
      from,
      shipTo,
      notes,
      terms,
      amountPaid,
      tax,
      discount,
      shipping,
      isTaxPercentage,
      isDiscountPercentage,
      customLabels,
      user: req.user.id
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (err) {
    res.status(500).json({ message: "Error saving invoice", error: err });
  }
});


// GET: Fetch invoices for the logged-in user
router.get("/", fetchuser, async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id }); // Filter invoices by user
    res.status(200).json(invoices); // Respond with the invoices for the logged-in user
  } catch (err) {
    res.status(500).json({ message: "Error fetching invoices", error: err });
  }
});

// GET: Fetch a single invoice by its ID
router.get("/:id", fetchuser, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id); // Fetch a single invoice by its ID
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(invoice); // Respond with the found invoice
  } catch (err) {
    res.status(500).json({ message: "Error fetching invoice", error: err });
  }
});

// DELETE: Delete an invoice by its ID
router.delete("/:id", fetchuser, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("Error deleting invoice:", err);
    res.status(500).json({ message: "Error deleting invoice", error: err });
  }
});

// DELETE: Delete all invoices for the logged-in user
router.delete("/", fetchuser, async (req, res) => {
  try {
    const result = await Invoice.deleteMany({ user: req.user.id });
    res
      .status(200)
      .json({
        message: "All invoices deleted",
        deletedCount: result.deletedCount,
      });
  } catch (err) {
    console.error("Error deleting all invoices:", err);
    res
      .status(500)
      .json({ message: "Error deleting all invoices", error: err });
  }
});

// PUT: Update an existing invoice by ID
router.put("/:id", fetchuser, async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Check if the invoice exists and belongs to the logged-in user
    const existingInvoice = await Invoice.findOne({
      _id: invoiceId,
      user: req.user.id,
    });
    if (!existingInvoice) {
      return res
        .status(404)
        .json({ message: "Invoice not found or unauthorized" });
    }

    // Update the invoice with the request body
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedInvoice);
  } catch (err) {
    console.error("Error updating invoice:", err);
    res.status(500).json({ message: "Error updating invoice", error: err });
  }
});

module.exports = router;
