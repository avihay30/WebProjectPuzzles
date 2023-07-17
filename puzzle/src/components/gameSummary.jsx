import { getPageLoadingSpinner } from "../utils/utils"
import { useNavigate } from "react-router-dom"

const GameSummary = ({ completionData, userData }) => {
  const navigate = useNavigate()

  const getTotalTimeComplete = (sec) => {
    // Conversion to days, hours, minutes, and seconds
    const elapsedTimeMinutes = parseInt(sec / 60) % 60
    const elapsedTimeHours = parseInt(parseInt(elapsedTimeMinutes / 60) / 60)
    const elapsedTimeSecReminder = sec % 60
    // Format the time as DD:HH:MM:SS
    const elapsedTimeStr = `
    ${elapsedTimeHours.toString().padStart(2, "0")}:${elapsedTimeMinutes
      .toString()
      .padStart(2, "0")}:${elapsedTimeSecReminder.toString().padStart(2, "0")}`

    return elapsedTimeStr
  }

  const currentScore = () => {
    const parts = completionData.x * completionData.y
    const textDisplay = (userData.score - parts) + " + " + parts
    return textDisplay
  }

  const goToMyPuzzles = () => {
    navigate("/myPuzzles")
  }

  const displayYourPuzzlesBtn = () => {
    return (
      <div className="w-full lg:w-1/3 px-12 border-t border-b lg:border-t-0 lg:border-b-0 lg:border-l lg:border-r border-gray-300 flex flex-col items-center py-20">
        <div className="mb-3 w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer text-indigo-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-12 h-12"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
            />
          </svg>
        </div>
        <button
          className="my-10 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-lg font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
          onClick={goToMyPuzzles}
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Your Puzzles
          </span>
        </button>
      </div>
    )
  }

  if (!completionData) return getPageLoadingSpinner()

  const totalTime = getTotalTimeComplete(completionData.totalSec)
  const score = currentScore()

  return (
    <>
      <div className="homePage">
        <div className="container mx-auto px-6 flex items-start justify-center my-5">
          <div className="w-full">
            <div className="flex flex-col lg:flex-row mx-auto bg-white dark:bg-gray-800 shadow rounded">
              <div className="w-full lg:w-1/3 px-12 flex flex-col items-center py-10">
                <img
                  className="w-full h-full overflow-hidden object-cover"
                  src={completionData.imageURL}
                  alt="avatar"
                />
              </div>
              {displayYourPuzzlesBtn()}
              <div className="w-full lg:w-1/3 flex-col flex justify-center items-center px-12 py-8">
                <h1 className="mb-10 text-center text-3xl text-gray-800 dark:text-gray-100 font-large tracking-normal">
                  GOOD JOB
                </h1>
                <h2 className="text-center text-3xl text-gray-800 dark:text-gray-100 font-medium tracking-normal">
                  {totalTime}
                </h2>
                <h2 className="text-center text-xl text-gray-600 dark:text-gray-100 font-normal mt-2 mb-4 tracking-normal">
                  Time to Complete
                </h2>
                <h2 className="text-center text-3xl text-gray-800 dark:text-gray-100 font-medium tracking-normal">
                  {score}
                </h2>
                <h2 className="text-center text-xl text-gray-600 dark:text-gray-100 font-normal mt-2 mb-4 tracking-normal">
                  Current Score
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GameSummary
