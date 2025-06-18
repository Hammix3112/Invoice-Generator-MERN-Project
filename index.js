const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
const path = require("path");

const historyRoutes = require("./routes/history");
const invoicesRoutes = require("./routes/invoices");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

connectToMongo();

app.use(cors());
app.use(express.json());

// ✅ API Routes — must be FIRST
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/invoices", invoicesRoutes);

// ✅ Serve frontend static files
app.use(express.static(path.resolve(__dirname, "dist")));

// ✅ Catch-all route for React (after API + static)
app.get("*", (req, res) =>
  res.sendFile(path.resolve("dist", "index.html"))
);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
