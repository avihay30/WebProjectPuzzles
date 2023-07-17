const { MongoClient, ServerApiVersion } = require("mongodb")
const uri = "<MongoDB connection string>"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

let conn
let db

async function get_db() {
  try {
    if (db) {
      return db
    }
    
    conn = await client.connect()
    db = conn.db("Puzzle")
    return db
  } catch (e) {
    console.error(e)
  }
}

module.exports = get_db
