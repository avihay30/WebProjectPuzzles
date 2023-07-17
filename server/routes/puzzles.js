var express = require("express")
const get_db = require("../db/conn")
const getIfIDValid = require("../db/utils")
const ObjectId = require("mongodb").ObjectId
var router = express.Router()

/* Add new puzzle to the collection.
   The puzzle id is assigned by mongo will be returned in result.insertedId */
router.post("/", async (req, res) => {
  let db = await get_db()
  // Inserting new Puzzle
  newDocument = {
    status: "In Progress",
    time: 0,
    x: req.body.x,
    y: req.body.y,
    size: req.body.x * req.body.y,
    imageURL: req.body.url,
    userID: req.body.userID,
    assembledParts: [],
  }
  collection = await db.collection("puzzles")
  let result = await collection.insertOne(newDocument)
  const newPuzzleId = result.insertedId
  if (!newPuzzleId) {
    res.status(500).send("Error while inserting new puzzle")
    return
  }

  // Updating user puzzles list
  collection = await db.collection("players")
  query = { _id: new ObjectId(req.body.userID) }
  const updates = {
    $push: { puzzles: newPuzzleId.toString() },
  }
  result = await collection.updateOne(query, updates)

  if (result.modifiedCount == 0)
    res.status(502).send("Error while adding puzzle to user")
  else res.send({id: newPuzzleId})
})

/* GET returns users puzzles list by userId */
router.get("/list/:userid", async (req, res) => {
  let db = await get_db()
  let collection = await db.collection("players")
  const id = getIfIDValid(req.params.userid)
  if (!id) {
    res.status(400).send("ID is not in a vaild format")
    return
  }
  let query = { _id: id }
  let user = await collection.findOne(query)
  if (!user) {
    res.status(404).send("User doesn't exists")
    return
  }

  collection = await db.collection("puzzles")
  let puzzle_list = user.puzzles
  puzzle_list = puzzle_list.map((puzzle_id) => new ObjectId(puzzle_id))
  query = { _id: { $in: puzzle_list } }
  let results_list = await collection.find(query).toArray()

  if (!results_list) res.status(404).send("Error while finding puzzles of user")
  else res.send(results_list)
})

/* GET puzzle by id. */
router.get("/:id", async (req, res) => {
  let db = await get_db()
  let collection = await db.collection("puzzles")
  const id = getIfIDValid(req.params.id)
  if (!id) {
    res.status(400).send("ID is not in a vaild format")
    return
  }
  const query = { _id: id }
  let result = await collection.findOne(query)

  if (!result) res.sendStatus(404)
  else res.send(result)
})

/* Update puzzle (Change puzzle state) 
   param should hold the puzzleID and body the new puzzle data */
router.patch("/:id", async (req, res) => {
  let db = await get_db()
  let collection = await db.collection("puzzles")
  const id = getIfIDValid(req.params.id)
  if (!id) {
    res.status(400).send("ID is not in a vaild format")
    return
  }
  const query = { _id: id }
  const update = {
    $set: req.body,
  }
  let result = await collection.updateOne(query, update)

  if (result.modifiedCount == 0)
    res.status(502).send("Error while updating puzzle data")
  else res.send(result)
})

/* Delete a puzzle (Cascading to delete from user too) 
   param should hold the puzzleID */
router.delete("/:id", async (req, res) => {
  let db = await get_db()
  let collection = await db.collection("puzzles")
  const id = getIfIDValid(req.params.id)
  if (!id) {
    res.status(400).send("ID is not in a vaild format")
    return
  }
  let query = { _id: id }
  let puzzle_to_delete = await collection.findOne(query)
  if (!puzzle_to_delete) {
    res.status(404).send("Puzzle document to delete was not found")
    return
  }

  let delete_puzzle_result = await collection.deleteOne(query)
  if (delete_puzzle_result.deletedCount == 0)
    res.status(502).send("Error while deleting the given puzzle")

  // Deleting puzzle id from user puzzles list
  user_id = await puzzle_to_delete.userID
  collection = await db.collection("players")
  query = { _id: new ObjectId(user_id) }
  const update = {
    $pull: { puzzles: puzzle_to_delete._id.toString() },
  }
  let delete_from_user_result = await collection.updateOne(query, update)

  if (delete_from_user_result.modifiedCount == 0)
    res.status(502).send("Error while updating user puzzles")
  else res.send(delete_puzzle_result)
})

module.exports = router
