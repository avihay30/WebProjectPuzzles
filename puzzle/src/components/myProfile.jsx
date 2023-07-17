import { Component } from "preact"
import {
  SERVER_URL,
  getPageLoadingSpinner,
  is_response_ok,
  parse_response,
} from "../utils/utils"
import { PuzzleObj } from "../models/puzzleObj"
import EditProfile from "./editProfile"
import NotificationAlert from "./notificationAlert"

export default class MyProfile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: props.userData,
      edit: false,
      loading: "initial",
      response: null,
      showNotification: false,
    }
  }

  loadData() {
    let response = fetch(`${SERVER_URL}/puzzles/list/${this.state.user._id}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
    return response
  }

  // Lifecycle: Called whenever our component is created
  componentDidMount() {
    this.loadData().then((response) => {
      if (is_response_ok(response)) {
        parse_response(response).then((res) => {
          const puzzles = res.map((puzzleDb) => new PuzzleObj(puzzleDb))
          this.setState({
            puzzles: puzzles,
            loading: false,
          })
        })
      }
    })
  }

  getFormmatedTimeFromSecs(sec) {
    // Conversion to days, hours, minutes, and seconds
    const days = Math.floor(sec / (24 * 60 * 60))
    const hours = Math.floor((sec % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((sec % (60 * 60)) / 60)
    const seconds = Math.floor(sec % 60)

    // Format the time as DD:HH:MM:SS
    const formattedTime = `${days}:${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`
    return formattedTime
  }

  createStar(color, isLast) {
    const className = `cursor-pointer w-4 ${
      !isLast ? "mr-1" : ""
    } ${color} icon icon-tabler icon-tabler-star`

    return (
      <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" fill="none" d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M12 17.75l-6.172 3.245 1.179-6.873-4.993-4.867 6.9-1.002L12 2l3.086 6.253 6.9 1.002-4.993 4.867 1.179 6.873z"
        />
      </svg>
    )
  }

  calculateStars(piecesAssembled, totalPieces) {
    const totalStars = 5
    const rank = Math.round(
      totalPieces > 0 ? (piecesAssembled / totalPieces) * 5 : 0
    )
    const grayStars = totalStars - rank
    let stars = []
    for (let i = 1; i <= rank; i++) {
      const isLast = i === totalStars
      stars.push(this.createStar("text-yellow-400", isLast))
    }

    for (let i = 1; i <= grayStars; i++) {
      const isLast = i + rank === totalStars
      stars.push(this.createStar("text-gray-200 dark:text-gray-400", isLast))
    }
    return stars
  }

  // Updating user data on screen and in local storage
  handleAfterUserDataEdit = (newUserData) => {
    this.setState({
      user: newUserData
    })
  }

  // Presenting Notification Alert
  handleNotification = (response) => {
    this.setState({
      response: response,
      showNotification: true
    })
  }

  alertClosed = () => {
    this.setState({
      showNotification: false
    })
  }

  toggleEditProfile() {
    this.setState({
      edit: !this.state.edit,
    })
  }

  displayEditProfile() {
    return (
      <div className="w-full lg:w-1/3 px-12 border-t border-b lg:border-t-0 lg:border-b-0 lg:border-l lg:border-r border-gray-300 flex flex-col items-center py-10">
        <div className="mb-3 w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer text-indigo-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-12 h-12"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </div>
        <button
          class="my-10 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-lg font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
          onclick={(event) => this.toggleEditProfile(event)}
        >
          <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Edit your profile
          </span>
        </button>
      </div>
    )
  }

  render() {
    if (this.state.loading != false) return getPageLoadingSpinner()
    
    const {user, puzzles, showNotification, response } = this.state

    const inProgressCount = puzzles.filter(
      (puzzle) => puzzle.status === "In Progress"
    ).length
    const completedCount = puzzles.length - inProgressCount
    const sum = puzzles
      .filter((puzzle) => puzzle.status != "In Progress")
      .reduce((total, completedPuzzle) => total + completedPuzzle.timeInSec, 0)
    const averageTimeInSec = completedCount > 0 ? sum / completedCount : 0
    const avgTime = this.getFormmatedTimeFromSecs(averageTimeInSec)
    const totalTime = this.getFormmatedTimeFromSecs(sum)
    const piecesAssembled = puzzles.reduce(
      (assembled, puzzle) => assembled + puzzle.assembledParts.length,
      0
    )
    const totalPieces = puzzles.reduce(
      (total, puzzle) => total + puzzle.size,
      0
    )
    const stars = this.calculateStars(piecesAssembled, totalPieces)
    return (
      <>
        <div className="homePage">
          {showNotification && 
            <NotificationAlert response={response} onAlertClose={this.alertClosed}></NotificationAlert>
            }
          <div className="container mx-auto px-6 flex items-start justify-center my-5">
            <div className="w-full">
              <div className="flex flex-col lg:flex-row mx-auto bg-white dark:bg-gray-800 shadow rounded">
                <div className="w-full lg:w-1/3 px-12 flex flex-col items-center py-10">
                  <div className="w-24 h-24 mb-3 p-2 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <img
                      className="w-full h-full overflow-hidden object-cover rounded-full"
                      src="https://www.getillustrations.com/photos/pack/3d-avatar-male_lg.png"
                      alt="avatar"
                    />
                  </div>
                  <h2 className="text-gray-800 dark:text-gray-100 text-xl tracking-normal font-medium mb-1">
                    {user.name}
                  </h2>
                  <p className="flex text-gray-600 dark:text-gray-100 text-sm tracking-normal font-normal mb-3 text-center">
                    <span className="cursor-pointer mr-1 text-gray-600 dark:text-gray-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                        />
                      </svg>
                    </span>
                    {user.email}
                  </p>
                  <br></br>
                  <br></br>
                  <div className="flex items-start justify-between lg:justify-center">
                    <div className="ml-6 lg:mx-3 xl:ml-0 px-8 lg:ml-0 px-4 xl:px-8">
                      <h2 className="text-gray-600 dark:text-gray-100 text-2xl leading-6 mb-2 text-center">
                        {completedCount}
                      </h2>
                      <p className="text-gray-800 dark:text-gray-100 text-sm leading-5">
                        Completed
                      </p>
                    </div>
                    <div className="mx-6 lg:mx-3 xl:ml-0 mx-6 px-8 lg:px-4 xl:px-8 border-l">
                      <h2 className="text-gray-600 dark:text-gray-100 text-2xl leading-6 mb-2 text-center">
                        {inProgressCount}
                      </h2>
                      <p className="text-gray-800 dark:text-gray-100 text-sm leading-5">
                        In Progress
                      </p>
                    </div>
                  </div>
                </div>
                <EditProfile userData={this.state.user} onUserDataChange={this.handleAfterUserDataEdit} onNotification={this.handleNotification}></EditProfile>
                <div className="w-full lg:w-1/3 flex-col flex justify-center items-center px-12 py-8">
                  <h2 className="text-center text-2xl text-gray-800 dark:text-gray-100 font-medium tracking-normal">
                    {avgTime}
                  </h2>
                  <h2 className="text-center text-sm text-gray-600 dark:text-gray-100 font-normal mt-2 mb-4 tracking-normal">
                    Avg Time Of Completion
                  </h2>
                  <h2 className="text-center text-2xl text-gray-800 dark:text-gray-100 font-medium tracking-normal">
                    {totalTime}
                  </h2>
                  <h2 className="text-center text-sm text-gray-600 dark:text-gray-100 font-normal mt-2 mb-4 tracking-normal">
                    Total Time Played
                  </h2>
                  <h2 className="text-center text-2xl text-gray-800 dark:text-gray-100 font-medium tracking-normal">
                    {piecesAssembled}
                  </h2>
                  <h2 className="text-center text-sm text-gray-600 dark:text-gray-100 font-normal mt-2 mb-4 tracking-normal">
                    Total Pieces Assembled
                  </h2>
                  <h2 className="text-center text-2xl text-gray-800 dark:text-gray-100 font-medium tracking-normal">
                    {user.score}
                  </h2>
                  <h2 className="text-center text-sm text-gray-600 dark:text-gray-100 font-normal mt-2 mb-4 tracking-normal">
                    Current Score
                  </h2>
                  <div className="flex items-center">{stars}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}
