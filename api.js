const express = require("express");
// import { MongoClient } from "mongodb";
const { MongoClient } = require("mongodb");
const app = express();
require('dotenv').config();
const mongoose = require("mongoose");


//Atlas Connection
// ✅ Load env variables
const uri = process.env.MONGO_URI; // from .env or Render environment
const port = parseInt(process.env.PORT);
console.log("MONGO_URI from env:", process.env.MONGO_URI);

if (!uri) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

const client = new MongoClient(uri);

async function main() {
  try {
    // Try to connect
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("zhi");
    const Student = db.collection("Student");

    const allUsers = await Student.find({name:"Priyam Upadhyay"}).toArray(); 
    console.log(allUsers); 
    // Middleware
    app.use(express.json());

    // Routes

    // Get all students
    app.get("/students", async (req, res) => {
      try {
        const students = await Student.find().toArray();
        res.json(students);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
      }
    });

    //Get by Roll_no
    app.get("/students/roll", async (req, res) => {
      try {
        const { roll_no } = req.body;

        // Check if roll_no is provided
        if (!roll_no) {
          return res.status(400).json({ message: "Roll number is required" });
        }

        // Find student by roll number
        const student = await Student.findOne({ roll_no: roll_no });

        if (!student) {
          return res.status(404).json({ message: "Data not exist" });
        }

        res.json(student); // Return student data if found
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
      }
    });


    //Insert data
    // ✅ Add new student with duplicate check
    app.post("/add", async (req, res) => {
      try {
        const { roll } = req.body;

        // Check if student with same roll already exists
        const existingStudent = await Student.findOne({ roll: roll });
        if (existingStudent) {
          return res.status(400).json({ message: "Already admitted by this Roll Number" });
        }

        // Insert new student directly
        await Student.insertOne(req.body); // <-- native driver uses insertOne
        res.status(201).json({ message: "Student added successfully", student: req.body });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });


    //update existing data
    // ✅ Update student by roll from JSON body
    app.put("/update", async (req, res) => {
      try {
        const { roll, ...updateData } = req.body;

        if (!roll) return res.status(400).json({ message: "Roll number is required" });

        const rollNumber = parseInt(roll);

        // Check if student exists
        const existingStudent = await Student.findOne({ roll: rollNumber });
        if (!existingStudent) {
          return res.status(404).json({ message: "Student not found by this roll no" });
        }

        // Remove empty fields
        Object.keys(updateData).forEach(key => {
          if (!updateData[key]) delete updateData[key];
        });

        const updatedStudent = await Student.findOneAndUpdate(
          { roll: rollNumber },
          { $set: updateData },          // ✅ use $set here
          { returnDocument: "after" }    // returns the updated document
        );

        res.json({ message: "Student updated successfully", student: updatedStudent.value });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });



    //delete
    // ✅ Delete student by roll from JSON body
    app.delete("/delete", async (req, res) => {
      try {
        const { roll } = req.body;

        if (!roll) return res.status(400).json({ message: "Roll number is required" });

        const rollNumber = parseInt(roll);

        // Check if student exists
        const existingStudent = await Student.findOne({ roll: rollNumber });
        if (!existingStudent) {
          return res.status(404).json({ message: "Student not found" });
        }

        const deletedStudent = await Student.findOneAndDelete({ roll: rollNumber });

        res.json({ message: "Student deleted successfully", student: deletedStudent });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });



    const port = parseInt(process.env.PORT)  || 5000;
    console.log(port);
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });


    // const port = process.env.PORT;
    // console.log(port)
    // app.listen(port, () => {
    //   console.log(`Server running on port ${port}`);
    //   console.log("Started.....");
    // });

//     Start server after DB is ready
//     app.listen(port, "10.22.57.54", () => {
//         console.log(`API running at http://10.22.57.54:${port}`);
//         console.log("Started.....");
// });

  } catch (err) {
    console.error("Could not connect to MongoDB:", err.message);
  } finally {
    // optional: close connection if you don’t want to keep it open
    // await client.close();
  }
}


main();