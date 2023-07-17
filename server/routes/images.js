var express = require("express")
const get_db = require("../db/conn")
const getIfIDValid = require("../db/utils")
const ObjectId = require("mongodb").ObjectId
var router = express.Router()

/* POST new image. */
router.post("/", async (req, res) => {
  let db = await get_db()
  let collection = await db.collection("images")
  let newDocument = req.body

  let result = await collection.insertOne(newDocument)

  if(!result.insertedId) res.status(500).send("Error while inserting new user")
  else res.status(204).send(result)
})

/* GET list of image ids by userID. */
router.get("/list/:id", async (req, res) => {
  let db = await get_db()
  let collection = await db.collection("images")
  let query = { userID: req.params.id }
  let image_list = await collection.find(query).toArray()
  if (!image_list) {
    res.status(404).send("Error while finding images of user")
    return
  }

  let imageUrl_list = image_list.map((image) => image.url)
  res.send(imageUrl_list)
})


/* GET image by id. */
router.get("/:id", async (req, res) => {
  let db = await get_db()
  let collection = await db.collection("images")
  const id = getIfIDValid(req.params.id)
  if (!id) {
    res.status(400).send("ID is not in a vaild format")
    return
  }
  const query = { _id: id }
  let result = await collection.findOne(query)

  if (!result) res.status(404).send("Image wasn't found")
  else res.send(result)
})

/* Delete an image param should hold the imageID */
router.delete("/:id", async (req, res) => {
  let db = await get_db()
  let collection = await db.collection("images")
  const id = getIfIDValid(req.params.id)
  if (!id) {
    res.status(400).send("ID is not in a vaild format")
    return
  }
  const query = { _id: id }
  let delete_image_result = await collection.deleteOne(query)

  if (delete_image_result.deletedCount == 0)
    res.status(502).send("Error while deleting the given image")
  else res.send(delete_image_result)
})

module.exports = router
