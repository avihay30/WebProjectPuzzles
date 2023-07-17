import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  SERVER_URL,
  getPageLoadingSpinner,
  is_response_ok,
  parse_response,
} from "../utils/utils"
import { PuzzleObj } from "../models/puzzleObj"

const TITLE = "My Puzzles"
const SUB_TITLE = "Monitor Your Puzzle Mastery"
const DESCRIPTION =
  "Visualize Progress and Assembly Status of Each Puzzle with Elapsed Time and Parts Completed in a Table!"
const STATUS_HEADER = "Status"
const ASSEMBLED_HEADER = "Assembled Parts"
const TIME_HEADER = "Elapsed Time"
const LEN_OF_PAGE = 5

let statusSortDirection = true
let assembledSortDirection = true
let timeSortDirection = true

const MyPuzzles = (props) => {
  const navigate = useNavigate()

  const [data, setData] = useState("")
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState("initial")

  useEffect(() => {
    loadData().then((response) => {
      if (is_response_ok(response)) {
        parse_response(response).then((res) => {
          const puzzles = res.map((puzzleDb) => new PuzzleObj(puzzleDb))
          prepareDataToPages(puzzles)
        })
      }
    })
  }, [props.userData])

  const loadData = () => {
    let response = fetch(`${SERVER_URL}/puzzles/list/${props.userData._id}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
    return response
  }

  const prepareDataToPages = (puzzles) => {
    const totalPuzzles = puzzles.length
    const totalPages = Math.ceil(totalPuzzles / LEN_OF_PAGE)
    const pages = []
    for (let i = 0; i < totalPages; i++) {
      const { startNum, endNum } = getPageRange(i, totalPuzzles)
      pages.push(puzzles.slice(startNum - 1, endNum))
    }
    setData(puzzles)
    setPages(pages)
    setLoading(false)
  }

  const changePage = (isIncriment) => {
    setCurrentPage(isIncriment ? currentPage + 1 : currentPage - 1)
  }

  const getPageRange = (currentPage, totalPuzzles) => {
    const startNum = currentPage * LEN_OF_PAGE + 1
    const theoreticalEndNum = (currentPage + 1) * LEN_OF_PAGE
    const endNum =
      theoreticalEndNum > totalPuzzles ? totalPuzzles : theoreticalEndNum
    return { startNum, endNum }
  }

  const sortBy = (event, headerToSort) => {
    event.preventDefault()
    const prevData = [...data]
    switch (headerToSort) {
      case STATUS_HEADER:
        prevData.sort((a, b) => {
          if (a.status == "Done") return statusSortDirection ? 1 : -1
          else if (b.status == "Done") return statusSortDirection ? -1 : 1
          return 0
        })
        statusSortDirection = !statusSortDirection
        break
      case ASSEMBLED_HEADER:
        prevData.sort((a, b) => {
          if (a.assembledParts.length > b.assembledParts.length) {
            return assembledSortDirection ? 1 : -1
          } else if (a.assembledParts.length < b.assembledParts.length) {
            return assembledSortDirection ? -1 : 1
          }
          return 0
        })
        assembledSortDirection = !assembledSortDirection
        break
      case TIME_HEADER:
        prevData.sort((a, b) => {
          if (a.timeInSec > b.timeInSec) {
            return timeSortDirection ? 1 : -1
          } else if (a.timeInSec < b.timeInSec) {
            return timeSortDirection ? -1 : 1
          }
          return 0
        })
        timeSortDirection = !timeSortDirection
        break
    }
    prepareDataToPages(prevData)
  }

  const getTableRows = () => {
    if (!data) return
    if (pages.length == 0) return

    const rows = pages[currentPage].map((puzzleObj) => {
      const elapsedTimeMinutes = parseInt(puzzleObj.timeInSec / 60) % 60
      const elapsedTimeHours = parseInt(parseInt(elapsedTimeMinutes / 60) / 60)
      const elapsedTimeSecReminder = puzzleObj.timeInSec % 60
      const elapsedTimeStr = `
      ${elapsedTimeHours.toString().padStart(2, "0")}:${elapsedTimeMinutes
        .toString()
        .padStart(2, "0")}:${elapsedTimeSecReminder
        .toString()
        .padStart(2, "0")}`
      return getTableRow(puzzleObj, elapsedTimeStr)
    })

    return rows
  }

  const getTableRow = (puzzleObj, elapsedTime) => {
    const { id, timeInSec, imageURL, status, size, x, y, assembledParts } =
      puzzleObj
    const assembled = assembledParts.length
    const actionBtnText = status === "In Progress" ? "Continue" : "Replay"
    let actionButton = ""

    if (actionBtnText == "Continue") {
      actionButton = (
        <button
          class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
          onClick={() =>
            continuePuzzle(id, timeInSec, x, y, imageURL, assembledParts)
          }
        >
          <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            {actionBtnText}
          </span>
        </button>
      )
    } else {
      actionButton = (
        <button
          class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800"
          onClick={() => replayPuzzle(id, x, y, imageURL)}
        >
          <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            {actionBtnText}
          </span>
        </button>
      )
    }
    return (
      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
        <td class="w-32 p-4">
          <img src={imageURL} alt="Preview"></img>
        </td>
        <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
          {status}
        </td>
        <td class="px-6 py-4">
          {assembled} / {size}
        </td>
        <td class="px-6 py-4">{elapsedTime}</td>
        <td class="px-6 py-4 text-center"> {actionButton}</td>
      </tr>
    )
  }

  const continuePuzzle = (id, timeInSec, x, y, url, assembledParts) => {
    const prepGame = {
      id: id,
      x: parseInt(x),
      y: parseInt(y),
      timeInSec: timeInSec,
      imageURL: url,
      assembled: assembledParts,
    }
    props.onGameCreated(prepGame)
    navigate("/game")
  }

  const replayPuzzle = async (id, x, y, url) => {
    let response = await fetch(`${SERVER_URL}/puzzles/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        x: parseInt(x),
        y: parseInt(y),
        userID: props.userData._id,
        url: url,
      }),
    })

    if (is_response_ok(response)) {
      response = await parse_response(response)
      const prepGame = {
        id: response.id,
        x: parseInt(x),
        y: parseInt(y),
        imageURL: url,
      }
      props.onGameCreated(prepGame)
      navigate("/game")
    } else {
      return false
    }
  }

  if (loading != false) return getPageLoadingSpinner()

  const { startNum, endNum } = getPageRange(currentPage, data.length)
  const rows = getTableRows()

  return (
    <div className="homePage">
      <h1 class="flex justify-center mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        {TITLE}
      </h1>
      {pages && pages.length == 0 ? (
        <span>
          <h1 class="text-3xl font-extrabold dark:text-white">
            No Puzzles 😞 -
            <small class="ml-2 font-semibold dark:text-white">
              Go back to Home Page to start your first puzzle!
            </small>
          </h1>
        </span>
      ) : (
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg mb-10">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 mt-5">
            <caption class="p-5 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
              {SUB_TITLE}
              <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                {DESCRIPTION}
              </p>
            </caption>
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" class="px-6 py-3">
                  Preview
                </th>
                <th scope="col" class="px-6 py-3">
                  <div class="flex items-center">
                    {STATUS_HEADER}
                    <a
                      href="#"
                      onClick={(event) => sortBy(event, STATUS_HEADER)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-3 h-3 ml-1"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 320 512"
                      >
                        <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                      </svg>
                    </a>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3">
                  <div class="flex items-center">
                    {ASSEMBLED_HEADER}
                    <a
                      href="#"
                      onClick={(event) => sortBy(event, ASSEMBLED_HEADER)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-3 h-3 ml-1"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 320 512"
                      >
                        <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                      </svg>
                    </a>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3">
                  <div class="flex items-center">
                    {TIME_HEADER}
                    <a href="#" onClick={(event) => sortBy(event, TIME_HEADER)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-3 h-3 ml-1"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 320 512"
                      >
                        <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                      </svg>
                    </a>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3">
                  <span class="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
          <nav
            class="flex items-center justify-between pt-2"
            aria-label="Table navigation"
          >
            <span class="text-sm font-normal flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
              Showing{" "}
              <span class="font-semibold text-gray-900 mx-1 dark:text-white">
                {startNum}-{endNum}
              </span>{" "}
              of{" "}
              <span class="font-semibold text-gray-900 ml-1 dark:text-white">
                {data.length}
              </span>
            </span>
            <ul class="inline-flex -space-x-px text-sm h-8">
              <li>
                <button
                  class={`flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-sm rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white
                  ${
                    currentPage == 0
                      ? "disabled:opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => changePage(false)}
                  disabled={currentPage == 0}
                >
                  {"<-"} Previous
                </button>
              </li>
              <li>
                <button
                  class={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg rounded-l-sm hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white
                  ${
                    currentPage == pages.length - 1
                      ? "disabled:opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => changePage(true)}
                  disabled={currentPage == pages.length - 1}
                >
                  Next {"->"}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}

export default MyPuzzles
