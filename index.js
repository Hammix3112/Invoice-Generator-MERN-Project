const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
const path = require("path");

const historyRoutes = require("./routes/history");
const invoicesRoutes = require("./routes/invoices"); // <-- Correct route
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

connectToMongo(); // Connect to MongoDB

app.use(cors()); // Allow cross-origin requests
app.use(express.json());

app.use(express.static(path.resolve(__dirname, "dist")));

// app.get("*" , (req , res) => res.sendFile(path.resolve("dist" , "index.html")))

app.get("/", (req, res) => {
  res.send("Hello Hammad Ali!");
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Notes Routes (maybe you want a 'notes' route instead of history again? double-check this)
app.use("/api/history", historyRoutes);

// Invoice Routes (MongoDB connected version)
app.use("/api/invoices", invoicesRoutes); // <-- this handles POST, GET, etc.

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
