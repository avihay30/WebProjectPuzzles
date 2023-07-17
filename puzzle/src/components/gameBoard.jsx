import React, { useEffect, useState } from "react"
import IncompatibleMessage from "./incompatibleMessage"
import { SERVER_URL, getPageLoadingSpinner, is_response_ok } from "../utils/utils"
import { useNavigate } from "react-router-dom"

const GameBoard = (props) => {
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState("initial")
  const [seconds, setSeconds] = useState(0)
  const [imagePieces, setImagePieces] = useState([])
  const [pieces, setPieces] = useState([])
  const [shuffled, setShuffled] = useState([])
  const [solved, setSolved] = useState([])

  const navigate = useNavigate()
  let timerInterval

  useEffect(() => {
    handleResize()
    window.addEventListener("resize", handleResize)
    if (props.gameData.imageURL) {
      splitImage()
    }

    startTimer()

    return () => {
      window.removeEventListener("resize", handleResize)
      clearInterval(timerInterval)
    }
  }, [props.gameData.imageURL])

  useEffect(() => {
    prepereGame()
  }, [imagePieces])

  const startTimer = () => {
    let interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1)
    }, 1000)

    timerInterval = interval
  }

  useEffect(() => {
    const handleReload = (event) => {
      event.preventDefault()
      const confirmationMessage =
        "Reloading this page will end the game! Your progress will be discarded."
      event.returnValue = confirmationMessage
      return confirmationMessage
    }

    window.addEventListener("beforeunload", handleReload)

    return () => {
      window.removeEventListener("beforeunload", handleReload)
    }
  }, [])

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768)
  }

  const prepereGame = (isOnClear = false) => {
    const size = props.gameData.x * props.gameData.y
    const pieces = [...Array(size)].map((_, i) => ({
      img: imagePieces[i],
      order: i,
      board: "shuffled",
    }))

    const assembled = props.gameData.assembled
    if (assembled && !isOnClear) {
      const unSolvedPieces = pieces.map((piece) => 
      assembled.includes(piece.order) ? undefined : piece
      )
      const solvePieces = pieces.map((piece) =>
        assembled.includes(piece.order) ? piece : undefined
      )
      solvePieces.forEach((piece) => {
        if (piece != undefined) piece.board = "solved"
      })
      setShuffled(shufflePieces(unSolvedPieces))
      setSolved(solvePieces)
      setSeconds(props.gameData.timeInSec)
    } else {
      setShuffled(shufflePieces(pieces))
      setSolved([...Array(size)])
    }
    setPieces(pieces)
    setLoading(false)
  }

  const splitImage = async () => {
    const { x, y, imageURL } = props.gameData
    const matrixX = x
    const matrixY = y

    const m_image = new Image()
    m_image.crossOrigin = "anonymous"
    m_image.src = imageURL

    await m_image.decode()

    const { width, height } = m_image
    const tileWidth = width / matrixX
    const tileHeight = height / matrixY

    const imageURLs = []

    for (let y = 0; y < matrixY; y++) {
      for (let x = 0; x < matrixX; x++) {
        const offsetX = x * tileWidth
        const offsetY = y * tileHeight
        const smallImageWidth = x === matrixX - 1 ? width - offsetX : tileWidth
        const smallImageHeight =
          y === matrixY - 1 ? height - offsetY : tileHeight

        const canvas = document.createElement("canvas")
        canvas.width = smallImageWidth
        canvas.height = smallImageHeight
        const ctx = canvas.getContext("2d")
        ctx.drawImage(
          m_image,
          offsetX,
          offsetY,
          smallImageWidth,
          smallImageHeight,
          0,
          0,
          smallImageWidth,
          smallImageHeight
        )

        const smallImageBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        )
        const smallImageURL = URL.createObjectURL(smallImageBlob)
        imageURLs.push(smallImageURL)
      }
    }

    setImagePieces(imageURLs)
  }

  const shufflePieces = (pieces) => {
    const shuffled = [...pieces]

    for (let i = shuffled.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled
  }

  const renderPieceContainer = (piece, index, boardName) => {
    const classNames = boardName === "solved" ? "w-32 h-32" : "w-24 h-24"
    return (
      <li
        className={classNames}
        key={index}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, index, boardName)}
      >
        {piece && (
          <img
            className={classNames}
            draggable
            onDragStart={(e) => handleDragStart(e, piece.order)}
            src={piece.img}
          />
        )}
      </li>
    )
  }

  const handleDragStart = (e, order) => {
    e.dataTransfer.setData("text/plain", order)
  }

  const handleDrop = (e, index, targetName) => {
    let target = targetName === "shuffled" ? shuffled : solved
    if (target[index]) return

    const pieceOrder = e.dataTransfer.getData("text")
    const pieceData = pieces.find((p) => p.order === +pieceOrder)
    const origin = pieceData.board === "shuffled" ? shuffled : solved

    if (targetName === pieceData.board) target = origin
    origin[origin.indexOf(pieceData)] = undefined
    target[index] = pieceData
    pieceData.board = targetName

    if (targetName === "shuffled") {
      setShuffled([...target])
      setSolved([...solved])
    } else {
      setShuffled([...shuffled])
      setSolved([...target])
    }
  }

  const markCorrectPieces = () => {
    const olElement = document.getElementById("solvedList")
    const liElements = olElement.getElementsByTagName("li")

    for (let i = 0; i < liElements.length; i++) {
      if (solved[i] != null && solved[i]["order"] == i) {
        liElements[i].style.border = "5px solid #045e09"
      }
    }
  }

  const disableMark = () => {
    const olElement = document.getElementById("solvedList")
    const liElements = olElement.getElementsByTagName("li")

    for (let i = 0; i < liElements.length; i++) {
      if (solved[i] != null && solved[i]["order"] == i) {
        liElements[i].style.border = "1px solid #DDD"
      }
    }
  }

  const saveAndExit = () => {
    setLoading(true)
    const size = props.gameData.x * props.gameData.y

    const solvedIndexs = solved
      .map((element, index) => (element !== undefined && element["order"] == index ? index : null))
      .filter((index) => index !== null)

    fetch(`${SERVER_URL}/puzzles/${props.gameData.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        time: seconds,
        assembledParts: solvedIndexs,
      }),
    }).then((response) => {
      if (is_response_ok(response)) {
        setLoading(false)
        navigate("/")
      } else {
        setLoading(false)
      }
    })
  }

  const updateUserScore = () => {
    const size = props.gameData.x * props.gameData.y

    fetch(`${SERVER_URL}/players/${props.userData._id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        score: props.userData.score + size,
      }),
    })
  }

  const checkIfBoardSolved = () => {
    if (!solved) return

    for (let i = 0; i < solved.length; i++) {
      if (solved[i] == null || solved[i]["order"] != i) {
        return
      }
    }

    setLoading(true)
    updateUserScore()
    const completionData = {
      ...props.gameData,
      totalSec: seconds,
      imageURL: props.gameData.imageURL,
    }
    const size = props.gameData.x * props.gameData.y
    fetch(`${SERVER_URL}/puzzles/${props.gameData.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        status: "Done",
        time: seconds,
        assembledParts: [...Array(size)].map((_, index) => index),
      }),
    }).then((response) => {
      if (is_response_ok(response)) {
        setLoading(false)
        props.onGameCompletion(completionData)
        navigate("/gameSummary")
      } else {
        setLoading(false)
      }
    })
  }

  if (loading != false) return getPageLoadingSpinner()

  checkIfBoardSolved()

  const { x } = props.gameData
  const numOfGridColumns = Array(parseInt(x)).fill("auto").join(" ")

  return (
    <div className="homePage">
      {isMobile ? (
        <IncompatibleMessage />
      ) : (
        <div>
          {/* Timer code */}
          {props.gameData.imageURL && (
            <div className="justify-center grid grid-flow-col gap-5 text-center auto-cols-max">
              <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                <span className="timer font-mono text-5xl">
                  <span style={{ "--value": Math.floor(seconds / 60 / 60) }}>
                    {Math.floor(seconds / 60 / 60)}
                  </span>
                </span>
                <span className="text-sm font-semibold">hours</span>
              </div>
              <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                <span className="timer font-mono text-5xl">
                  <span style={{ "--value": Math.floor((seconds / 60) % 60) }}>
                    {Math.floor((seconds / 60) % 60)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </span>
                <span className="text-sm font-semibold">min</span>
              </div>
              <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                <span className="timer font-mono text-5xl">
                  <span style={{ "--value": seconds % 60 }}>
                    {Math.floor(seconds % 60)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </span>
                <span className="text-sm font-semibold">sec</span>
              </div>
            </div>
          )}

          {/* Game board code */}
          <div className="jigsaw-container max-w-screen-2xl">
          <div className="jigsaw flex items-center mt-20">
            {props.gameData.imageURL && (
              <ul
                style={{
                  display: "grid",
                  gridTemplateColumns: `${numOfGridColumns}`,
                  gap: "0.5rem",
                  margin: "0.5rem",
                }}
              >
                {shuffled.map((piece, i) =>
                  renderPieceContainer(piece, i, "shuffled")
                )}
              </ul>
            )}
            <div className="ml-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-14 h-14"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
            {props.gameData.imageURL && (
              <ol
                id="solvedList"
                style={{
                  display: "grid",
                  gridTemplateColumns: `${numOfGridColumns}`,
                  gap: "0.5rem",
                  margin: "0.5rem",
                }}
                className={"mt-10 mb-10"}
              >
                {solved.map((piece, i) =>
                  renderPieceContainer(piece, i, "solved")
                )}
              </ol>
            )}
          </div>
          </div>
          {/* Buttons */}
          <div className="my-5 ml-2 min-w-96 flex justify-center">
            <button
              className="flex-auto w-16 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
              onClick={() => prepereGame(true)}
            >
              <span className="flex-auto w-16 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                Clear Board
              </span>
            </button>
            <button
              className="flex-auto w-44 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800"
              onMouseDown={markCorrectPieces}
              onMouseUp={disableMark}
            >
              <span className="flex-auto w-44 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                Check Board
              </span>
            </button>
            <button
              className="flex-auto w-16 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
              onClick={saveAndExit}
            >
              <span className="flex-auto w-16 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                Save & Exit
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard
