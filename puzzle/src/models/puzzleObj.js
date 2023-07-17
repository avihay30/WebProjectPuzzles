export class PuzzleObj {
  constructor(puzzleDb) {
    this.id = puzzleDb._id
    this.assembledParts = puzzleDb.assembledParts
    this.imageURL = puzzleDb.imageURL
    this.size = puzzleDb.size
    this.x = puzzleDb.x
    this.y = puzzleDb.y
    this.status = puzzleDb.status
    this.timeInSec = puzzleDb.time
  }
}
