import React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  SERVER_URL,
  getPageLoadingSpinner,
  is_response_ok,
  parse_response,
} from "../utils/utils"

export default function HomePage(props) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshUserData()
    setLoading(false)
  }, [])

  const refreshUserData = async () => {
    if (!props.userData) return
    let response = await fetch(`${SERVER_URL}/players/${props.userData._id}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
    if (is_response_ok(response)) {
      setUserData(await parse_response(response))
    } else {
    }
  }

  const setUserData = async (userData) => {
    let data = null
    delete userData.password
    if (userData != null) data = JSON.stringify(userData)
    localStorage.setItem("user", data)

    if (userData != props.userData) {
      props.onUserUpdate(userData)
    }
  }

  const renderButtons = () => {
    if (props.userData) {
      return (
        <>
          <Link className="home-btn" to="/newPuzzle">
            Create new puzzle
          </Link>
          <Link className="home-btn" to="/myPuzzles">
            My puzzles
          </Link>
        </>
      )
    } else {
      return (
        <>
          <p class="mt-10 mb-2 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-900">
            Please log in to access the puzzles.
          </p>
          <Link
            to="/login"
            class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
          >
            Login
            <svg
              class="w-5 h-5 ml-2 -mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </Link>
        </>
      )
    }
  }

  if (loading != false) return getPageLoadingSpinner()

  return (
    <header className="homePage">
      <div className="contentWrapper">
        <h1 class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-gray-900">
          Welcome to Puzzle2Gather
        </h1>
        <h2 class="text-2xl font-extrabold dark:text-gray-900">
          Where fantasy and fun come to life
        </h2>
        {renderButtons()}
      </div>
      <div className="aboutSection">
        <div className="about-container">
          <div className="aboutText">
            <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-900">
              A place to create and play puzzles from your own images.
            </p>
            <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-900">
              Puzzle2Gather is a website that allows you to turn your favorite
              images into interactive puzzles.
            </p>
            <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-900">
              Create unique puzzles by uploading your own images, and challenge
              yourself.
            </p>
            <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-900">
              Solve puzzles, have fun, and experience the joy of assembling
              pieces 2-gather.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
