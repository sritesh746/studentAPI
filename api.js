const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables!");
  process.exit(1);
}

// ==========================
// Connect to MongoDB Atlas
// ==========================
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// ==========================
// Define Student Schema
// ==========================
const studentSchema = new mongoose.Schema({
  roll_no: Number,
  name: String,
  course: String,
  year: String,
  contact: String,
  father: String,
  mother: String
});

const Student = mongoose.model("Student", studentSchema);

// ==========================
// Routes
// ==========================
console.log("Its is working......")

app.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/add", async (req, res) => {
  try {
    const existing = await Student.findOne({ roll_no: req.body.roll_no });
    if (existing) return res.status(400).json({ message: "Already admitted" });

    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: "Student added", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
app.put("/update", async (req, res) => {
  try {
    const { roll_no, ...data } = req.body;
    if (!roll_no) return res.status(400).json({ message: "Roll number required" });

    const updated = await Student.findOneAndUpdate({ roll_no }, data, { new: true });
    if (!updated) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Updated", student: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
app.delete("/delete", async (req, res) => {
  try {
    const { roll_no } = req.body;
    if (!roll_no) return res.status(400).json({ message: "Roll number required" });

    const deleted = await Student.findOneAndDelete({ roll_no });
    if (!deleted) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Deleted", student: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// Start server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
