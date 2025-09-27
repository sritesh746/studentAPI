// ==========================
// IMPORTS
// ==========================
const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(express.json());

// ==========================
// ENVIRONMENT VARIABLES
// ==========================
const PORT = parseInt(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables!");
  process.exit(1);
}

console.log("✅ Using MONGO_URI:", MONGO_URI);

// ==========================
// MONGODB CONNECTION
// ==========================
const client = new MongoClient(MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("🚀 Connected to MongoDB Atlas");
    return client.db("zhi").collection("Student");
  } catch (err) {
    console.error("❌ Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
}

// ==========================
// ROUTES
// ==========================
async function startServer() {
  const Student = await connectDB();

  // Test root route
  app.get("/", (req, res) => {
    res.send("✅ API is running!");
  });

  // Get all students
  app.get("/students", async (req, res) => {
    try {
      const students = await Student.find().toArray();
      res.json(students);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  
  // ==========================
  // START SERVER
  // ==========================
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

// Start everything
startServer();
