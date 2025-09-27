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

  // Get student by roll_no
  app.get("/students/roll", async (req, res) => {
    try {
      const { roll_no } = req.body;
      if (!roll_no) return res.status(400).json({ message: "Roll number is required" });

      const student = await Student.findOne({ roll_no });
      if (!student) return res.status(404).json({ message: "Data not exist" });

      res.json(student);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add new student
  app.post("/add", async (req, res) => {
    try {
      const { roll } = req.body;
      if (!roll) return res.status(400).json({ message: "Roll number is required" });

      const existing = await Student.findOne({ roll });
      if (existing) return res.status(400).json({ message: "Already admitted by this Roll Number" });

      await Student.insertOne(req.body);
      res.status(201).json({ message: "Student added successfully", student: req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update student
  app.put("/update", async (req, res) => {
    try {
      const { roll, ...updateData } = req.body;
      if (!roll) return res.status(400).json({ message: "Roll number is required" });

      const updated = await Student.findOneAndUpdate(
        { roll: parseInt(roll) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!updated.value) return res.status(404).json({ message: "Student not found" });

      res.json({ message: "Student updated successfully", student: updated.value });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete student
  app.delete("/delete", async (req, res) => {
    try {
      const { roll } = req.body;
      if (!roll) return res.status(400).json({ message: "Roll number is required" });

      const deleted = await Student.findOneAndDelete({ roll: parseInt(roll) });
      if (!deleted.value) return res.status(404).json({ message: "Student not found" });

      res.json({ message: "Student deleted successfully", student: deleted.value });
    } catch (err) {
      res.status(500).json({ error: err.message });
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
