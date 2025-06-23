const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const History = require("../models/History");

// Fetch history for logged-in user
router.get("/fetchhistory", fetchuser, async (req, res) => {
  try {
    const history = await History.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(history);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Add new history entry
router.post("/addhistory", fetchuser, async (req, res) => {
  try {
    const { action, title, description } = req.body;
    const history = new History({
      action,
      title,
      description,
      user: req.user.id,
    });
    const savedHistory = await history.save();
    res.json(savedHistory);
  } catch (error) {
    console.error("Error in /addhistory:", error); // <--- Add this
    res.status(500).send("Internal Server Error");
  }
});

//test
router.get("/test", (req, res) => {
  try {
    // Send a simple response
    res.status(200).json({ message: "Test route works!" });
  } catch (error) {
    console.error("Error in /test route:", error);
    res.status(500).json({ error: "Failed to access test route" });
  }
});

module.exports = router;
