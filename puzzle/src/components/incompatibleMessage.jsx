import { Component } from "preact"

export default class IncompatibleMessage extends Component {
  render() {
    return (
        <div className="bg-red-500 text-white p-4 flex items-center justify-center">
          <div className="max-w-md flex items-center">
            <div>
              <p className="text-lg font-bold mb-2">Oops! We are sorry, but this game is not compatible with small screens or mobile devices.</p>
              <p className="text-sm">Please use a larger screen to access the full functionality of the game.</p>
            </div>
          </div>
        </div>
      );
  }
}
