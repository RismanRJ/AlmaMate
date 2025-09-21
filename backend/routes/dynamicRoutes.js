const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const db = mongoose.connection;
const { MongoClient, ObjectId } = require("mongodb");

//post route for saving form data
router.post("/:tableName", async (req, res) => {
  const { tableName } = req.params;
  try {
    const collection = db.collection(tableName); // Use tableName from params
    const result = await collection.insertOne(req.body);

    res
      .status(201)
      .json({ message: "Form data saved successfully!", data: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving form data", error: error.message });
  }
});
// GET route for fetching all records from a collection
// This route will be used to fetch all records from a specified collection (tableName)
// // GET route for fetching a single record by query parameters
router.get("/:tableName", async (req, res) => {
  const { tableName } = req.params;
  const query = { ...req.query };

  try {
    const collection = db.collection(tableName);

    // Handle _id conversion if present in query
    if (query._id) {
      if (!ObjectId.isValid(query._id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      query._id = new ObjectId(query._id);
    }

    const data = await collection.find(query).toArray();

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching form data",
      error: error.message,
    });
  }
});

router.put("/:tableName", async (req, res) => {
  const { tableName } = req.params;
  const { userId } = req.query;
  const updateData = { ...req.body };

  if (!userId) {
    return res.status(400).json({ message: "userId is required in query" });
  }

  delete updateData._id;

  try {
    const collection = db.collection(tableName);
    const result = await collection.updateOne(
      { userId: userId }, // Match by userId
      { $set: updateData },
      { upsert: true } // Create doc if not found
    );

    res.status(200).json({
      message: "Data updated successfully!",
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating data",
      error: error.message,
    });
  }
});

// GET route for fetching a single record by ID
router.get("/:tableName/:id", async (req, res) => {
  const { tableName, id } = req.params;

  try {
    const collection = db.collection(tableName);

    // Validate the ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const data = await collection.findOne({ _id: new ObjectId(id) });

    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.status(200).json({ data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching data", error: error.message });
  }
});

// router.get("/:tableName", async (req, res) => {
//   const { tableName } = req.params;
//   const query = req.query; // dynamically accept any query parameters

//   try {
//     const collection = db.collection(tableName);

//     // Optional: If you expect `_id` to be part of the query, validate it
//     if (query._id && !ObjectId.isValid(query._id)) {
//       return res.status(400).json({ message: "Invalid ID format" });
//     }

//     // If _id is present, convert it to ObjectId
//     if (query._id) {
//       query._id = new ObjectId(query._id);
//     }

//     const data = await collection.findOne(query);

//     if (!data) {
//       return res.status(404).json({ message: "Data not found" });
//     }

//     res.status(200).json({ data });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error fetching data",
//       error: error.message,
//     });
//   }
// });

// DELETE route for deleting a record
router.delete("/:tableName/:id", async (req, res) => {
  const { tableName, id } = req.params;

  try {
    const collection = db.collection(tableName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Record not found!" });
    }

    res.status(200).json({ message: "Record deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting record", error: error.message });
  }
});

// PUT route for updating a record
router.put("/:tableName/:id", async (req, res) => {
  const { tableName, id } = req.params;

  try {
    const collection = db.collection(tableName);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Record not found!" });
    }

    res.status(201).json({ message: "Record updated successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating record", error: error.message });
  }
});

module.exports = router;
