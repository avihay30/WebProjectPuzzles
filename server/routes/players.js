var express = require("express")
const get_db = require("../db/conn")
const getIfIDValid = require("../db/utils")
var router = express.Router()

/* GET user by id. */
router.get("/:id", async (req, res) => {
  const db = await get_db()
  const collection = await db.collection("players")
  const id = getIfIDValid(req.params.id)
  if (!id) {
    res.status(400).send("ID is not in a vaild format")
    return
  }
  const query = { _id: id }
  const result = await collection.findOne(query)

  if (!result) res.status(404).send("User wasn't found")
  else res.send(result)
})

/* Update user data */
router.patch("/:id", async (req, res) => {
  let db = await get_db()
  let collection = await db.collection("players")
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
    res.status(502).send("Error while updating user data")
  else res.send(result)
})

/* POST to check user if exsits (expecting body={email, password}) */
router.post("/login", async (req, res) => {
  let db = await get_db()
  let collection = await db.collection("players")
  let query = {
    email: req.body.email,
    password: req.body.password,
  }
  let result = await collection.findOne(query)

  if (!result) res.status(404).send("User doesn't exists")
  else res.send(result)

})

/* POST to create new user (expecting body={name, email, password}) */
router.post("/register", async (req, res) => {
  let db = await get_db()
  let collection = await db.collection("players")
  // Validation if user already exists
  let query = { email: req.body.email }
  let result = await collection.findOne(query)

  if (result) {
    res.status(404).send("Email already exists")
    return
  }
  // Creating new empty user
  let newDocument = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    score: 0,
    puzzles: [],
  }

  result = await collection.insertOne(newDocument)
  if(!result.insertedId) res.status(500).send("Error while inserting new user")
  else res.send(newDocument)
})

module.exports = router
