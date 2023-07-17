const { ObjectId } = require("mongodb")

/* Function that validate and returns the given ID is in the correct format, 
   if not returns false */
function getIfIDValid(id) {
  try {
    return new ObjectId(id)
  } catch (e) {
    return false
  }
}

module.exports = getIfIDValid
