import React, { useEffect, useState, useRef } from "react"
import {
  SERVER_URL,
  getLoadingSpinner,
  is_response_ok,
  parse_response,
} from "../utils/utils"
import NotificationAlert from "./notificationAlert"

import { useNavigate } from "react-router-dom"

export default function CreatePuzzle(props) {
  const [loading, setLoading] = useState(true)
  const [imageURL, setImageURL] = useState(null)
  const [matrixX, setMatrixX] = useState(null)
  const [matrixY, setMatrixY] = useState(null)
  const [currentActiveImage, setCurrentActiveImage] = useState(null)
  const canvasRef = useRef(null)
  const [smallImages, setSmallImages] = useState([])
  const [inputBorder, setInputBorder] = useState("")
  const [inputError, setError] = useState("")
  const [imagesURLList, setImagesURLList] = useState("")
  const [inPreparingGame, setInPreparingGame] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [response, setResponse] = useState(null)

  useEffect(() => {
    if (props.userData) {
      getUsersImagesURLs()
        .then((imagesURLs) => {
          setImagesURLList(imagesURLs)
          setLoading(false)
        })
        .catch((error) => {
          setLoading(false)
          console.error(error)
          // Handle error from server
        })
    }
  }, [props.userData])

  const navigate = useNavigate()

  async function prepareGame() {
    setInPreparingGame(true)
    // Send POST request to add new puzzle
    let response = await fetch(`${SERVER_URL}/puzzles/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        x: matrixX,
        y: matrixY,
        userID: props.userData._id,
        url: currentActiveImage,
      }),
    })

    if (!is_response_ok(response)) {
      setResponse(response)
      setShowNotification(true)
      return
    }
    // move window to gameBoard
    response = await parse_response(response)
    const prepGame = {
      id: response.id,
      x: matrixX,
      y: matrixY,
      imageURL: currentActiveImage,
    }
    props.onGameCreated(prepGame)
    navigate("/game")
  }

  const splitImage = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    const m_image = new Image()
    m_image.crossOrigin = "anonymous" // Enable cross-origin request for the image

    m_image.onload = () => {
      const { width, height } = m_image
      const tileWidth = width / matrixX
      const tileHeight = height / matrixY

      canvas.width = width
      canvas.height = height

      const smallImageURLs = []

      for (let y = 0; y < matrixY; y++) {
        for (let x = 0; x < matrixX; x++) {
          const offsetX = x * tileWidth
          const offsetY = y * tileHeight
          const smallImageWidth =
            x === matrixX - 1 ? width - offsetX : tileWidth
          const smallImageHeight =
            y === matrixY - 1 ? height - offsetY : tileHeight

          canvas.width = smallImageWidth
          canvas.height = smallImageHeight

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

          const smallCanvasDataURL = canvas.toDataURL()
          smallImageURLs.push(smallCanvasDataURL)
        }
      }

      setSmallImages(smallImageURLs)
    }

    m_image.src = currentActiveImage // Set the image source to the URL address
  }

  // Receive user input for url image
  function handleImage(url) {
    if (url) {
      // Check if the given text is a valid URL
      try {
        const isValidUrl = new URL(url)
        // Check if the URL ends with 'jpg', 'png', or 'jpeg'
        if (
          url.endsWith(".jpg") ||
          url.endsWith(".png") ||
          url.endsWith(".jpeg")
        ) {
          let isErrored = false
          const m_image = new Image()
          m_image.crossOrigin = "anonymous"
          m_image.src = url
          m_image.onerror = () => {
            setImageURL(null)
            setInputBorder("border-red-500")
            setError(
              "Invalid URL. Copyrights issues, try uploding using the link below."
            )
            isErrored = true
          }
          if (isErrored) return

          // Do something with the URL, such as saving it to a state variable
          setImageURL(url)
          // Remove the red border if the input is a valid URL
          setInputBorder("")
          // Clear the error message
          setError("")
        } else {
          // Handle the case when the input URL doesn't have a valid image format
          setImageURL(null)
          // For example, display an error message or take appropriate action
          // Apply red border to the input field
          setInputBorder("border-red-500")
          // Set the error message
          setError(
            "Invalid image format. Only JPG, PNG, and JPEG formats are allowed."
          )
        }
      } catch (inputError) {
        // Handle the case when the input is not a valid URL
        setImageURL(null)
        // For example, display an error message or take appropriate action
        // Apply red border to the input field
        setInputBorder("border-red-500")
        // Set the error message
        setError("Invalid URL. Please enter a valid URL.")
      }
    } else {
      // Handle the case when the input is empty or cleared
      setImageURL(null)
      // Remove the red border if the input is empty
      setInputBorder("")
      // Clear the error message
      setError("")
    }
  }

  // Update matrixX value and apply border color
  function handleMatrixXChange(e) {
    const value = e.target.value

    if (value === "") {
      e.target.style.border = "" // Reset the border if the input is empty
    } else if (containsDot(value) || !isInteger(value)) {
      e.target.style.border = "1px solid red" // Set red border if dot is present or invalid values
    } else if (value < 2 || value > 10) {
      e.target.style.border = "1px solid red" // Set red border for values outside the range
    } else {
      e.target.style.border = "" // Reset the border if the value is valid
    }

    setMatrixX(value)
  }

  // Update matrixY value and apply border color
  function handleMatrixYChange(e) {
    const value = e.target.value

    if (value === "") {
      e.target.style.border = "" // Reset the border if the input is empty
    } else if (containsDot(value) || !isInteger(value)) {
      e.target.style.border = "1px solid red" // Set red border if dot is present or invalid values
    } else if (value < 2 || value > 10) {
      e.target.style.border = "1px solid red" // Set red border for values outside the range
    } else {
      e.target.style.border = "" // Reset the border if the value is valid
    }

    setMatrixY(value)
  }

  // Function to check if a value contains a dot
  function containsDot(value) {
    let isDot = false
    for (let i = 0; i < value.length; i++) {
      if (value[i] === ".") {
        isDot = true
      }
    }
    return isDot
  }

  // Function to check if a value is an integer
  function isInteger(value) {
    const parsed = parseInt(value, 10)
    return parsed.toString() === value
  }

  async function fileUploadHandler() {
    let response = await fetch(`${SERVER_URL}/images/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userID: props.userData._id,
        url: imageURL,
      }),
    })
    if (is_response_ok(response)) {
      setImagesURLList((prevURLs) => [...prevURLs, imageURL])
      handleNotification(response)
      document.getElementById("default-input").value = "" // Clear the input label
      setImageURL(null)
    } else {
      handleNotification(response)
    }
  }

  // Presenting Notification Alert
  const handleNotification = (response) => {
    setShowNotification(true)
    setResponse(response)
  }

  const alertClosed = () => {
    setShowNotification(false)
  }

  function setActiveImage(src) {
    if (currentActiveImage === src) {
      setCurrentActiveImage(null)
    } else {
      const clickableImages = document.getElementsByClassName("clickable-image")

      for (let i = 0; i < clickableImages.length; i++) {
        const image = clickableImages[i]
        if (image.getAttribute("src") === currentActiveImage) {
          image.classList.remove("active")
          break
        }
      }

      setCurrentActiveImage(src)
    }
  }

  function clear() {
    const inputs = document.querySelectorAll(
      "input[type='file'], input[type='number']"
    )
    inputs.forEach((input) => {
      if (input.type === "file") {
        input.value = "" // Clear file input
      } else {
        input.value = "" // Clear number input
      }
    })

    const clickableImages = document.getElementsByClassName("clickable-image")
    for (let i = 0; i < clickableImages.length; i++) {
      const image = clickableImages[i]
      image.classList.remove("active") // Remove "active" class from clickable images
    }

    setCurrentActiveImage(null)
    setMatrixX(null)
    setMatrixY(null)
  }

  async function getUsersImagesURLs() {
    // Send the GET request to the server
    let response = await fetch(
      `${SERVER_URL}/images/list/${props.userData._id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (is_response_ok(response)) {
      return await parse_response(response)
    } else {
      setResponse(response)
      setShowNotification(true)
    }
  }

  function renderImagesURLs() {
    if (!imagesURLList) {
      return null // Return null if imagesURLs is empty or false
    } else if (imagesURLList.length == 0) {
      return (
        <span>
          <h1 class="text-2xl font-extrabold dark:text-white">
            No Images.. 😞 - Add new pictures to begin your journey!
          </h1>
        </span>
      )
    } else {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {imagesURLList.map((url) => (
            <div key={url}>
              <img
                className={`h-auto max-w-full rounded-lg clickable-image ${
                  currentActiveImage === url ? "active" : ""
                }`}
                src={url}
                alt=""
                style={{ width: "300px", height: "200px" }}
                onClick={() => setActiveImage(url)}
              />
            </div>
          ))}
        </div>
      )
    }
  }

  return (
    <header className="homePage">
      {showNotification && (
        <NotificationAlert
          response={response}
          onAlertClose={alertClosed}
        ></NotificationAlert>
      )}
      <div className="contentWrapper m-5">
        <h1 className="text-4xl font-bold text-center mb-2">
          Creating a new puzzle
        </h1>
        <p className="text-center mb-5 text-xl">
          Here you can choose an image and adjust the number of pieces
        </p>
        <div class="mb-6">
          <label
            for="file_input"
            class="block text-sm font-medium text-gray-900 dark:text-white"
          >
            Upload URL image to your gallery
          </label>
          <div class="flex items-center">
            <input
              type="text"
              id="default-input"
              class={`bg-gray-50 border ${inputBorder} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block flex-grow p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              onChange={(e) => handleImage(e.target.value)}
              onPaste={(e) => handleImage(e.clipboardData.getData("Text"))}
            ></input>

            {imageURL !== null ? (
              <button
                class="h-auto relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 ml-2"
                onClick={fileUploadHandler}
              >
                <span class="h-full flex items-center justify-center relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 text-lg">
                  Upload Image
                </span>
              </button>
            ) : (
              <></>
            )}
          </div>
          {inputError && (
            <label className="text-red-700 p-2">{inputError}</label>
          )}
          <label class="block mt-2 text-xs text-gray-900 dark:text-white">
            If you need to create a URL for your image, you can use websites
            like&nbsp;
            <a
              href="https://postimages.org/"
              target="_blank"
              rel="noopener noreferrer"
              class="underline text-blue-700"
            >
              https://postimages.org/
            </a>
          </label>
        </div>

        <div style="overflow: auto; height: 450px; margin-bottom: 10px;">
          <div class="border border-gray-350 rounded-lg p-4 mb-4">
            {loading ? getLoadingSpinner() : renderImagesURLs()}
          </div>
        </div>
        {currentActiveImage && (
          <div className="flex mb-5 flex-col">
            <div className="inputWrapper">
              <label>
                <input
                  type="number"
                  min="2"
                  step="1"
                  max="10"
                  value={matrixX}
                  onChange={handleMatrixXChange}
                />
              </label>
              X
              <label>
                <input
                  type="number"
                  min="2"
                  step="1"
                  max="10"
                  value={matrixY}
                  onChange={handleMatrixYChange}
                />
              </label>
            </div>
            <div>
              <button
                class={`flex-auto w-25 mr-2 relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800 
                  ${
                    !(
                      matrixX >= 2 &&
                      matrixX <= 10 &&
                      matrixY >= 2 &&
                      matrixY <= 10
                    ) ||
                    !isInteger(matrixX) ||
                    !isInteger(matrixY) ||
                    inPreparingGame
                      ? "disabled:opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                onClick={prepareGame}
                disabled={
                  !(
                    matrixX >= 2 &&
                    matrixX <= 10 &&
                    matrixY >= 2 &&
                    matrixY <= 10
                  ) ||
                  !isInteger(matrixX) ||
                  !isInteger(matrixY) ||
                  inPreparingGame
                }
              >
                <span class="flex-auto relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                  Play Now
                </span>
              </button>
              <button
                class="flex-auto w-115 relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
                onClick={clear}
              >
                <span class="flex-auto relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                  Clear
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
      {smallImages !== null ? (
        <div className="grid-container">
          {smallImages.map((smallImageURL, index) => (
            <img
              key={index}
              src={smallImageURL}
              alt={`Small Image ${index}`}
              className="grid-item"
            />
          ))}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      ) : (
        ""
      )}
    </header>
  )
}
