import { useState, useEffect } from "react"
import { Login } from "./components/loginpage"
import { Register } from "./components/registerpage"
import MyPuzzles from "./components/myPuzzles"
import MyProfile from "./components/myProfile"
import CreatePuzzle from "./components/createPuzzle"
import GameSummary from "./components/gameSummary" // Update the import statement
import HomePage from "./components/homePage"
import "./styles/loginRegister.css"
import "./styles/pages.css"
import "./styles/navbar.css"
import "./styles/gameBoard.css"
import Navbar from "./components/navbar"
import { getLocalStorageUser } from "./utils/utils"
import { Route, Routes } from "react-router-dom"
import GameBoard from "./components/gameBoard"
import NotFound from "./components/notFound"

export function PuzzleApp() {
  const [currentForm, setCurrentForm] = useState("login")
  const [authenticated, setAuthenticated] = useState(null)
  const [gameData, setGameData] = useState(null)
  const [completionData, setGameCompletionData] = useState(null)

  useEffect(() => {
    const loggedInUser = getLocalStorageUser()
    setAuthenticated(loggedInUser)
  }, [])

  const toggleForm = (formName) => {
    setCurrentForm(formName)
  }

  const userUpdated = (userData) => {
    setAuthenticated(userData)
  }

  const startGame = (prepGameData) => {
    setGameData(prepGameData)
  }

  const gameCompleted = (gameCompletionData) => {
    setAuthenticated((prevAuthenticated) => ({
      ...prevAuthenticated,
      score:
        prevAuthenticated.score + gameCompletionData.x * gameCompletionData.y,
    }))
    setGameCompletionData(gameCompletionData)
  }

  const redirectIfNotAuthenticated = () => {
    const path = window.location.pathname
    if (authenticated == null && 
      path != "/login" && path != "/" && path != "/404")
      window.location.href = "/404"
  }

  const redirectIfReloadingWhileGame = () => {
    const path = window.location.pathname
    if (path == "/game" && gameData == null) {
      window.location.href = "/"
    } else if (path == "/gameSummary" && completionData == null) {
      window.location.href = "/"
    }
  }

  const ifWaitWhileReloading = () => {
    const path = window.location.pathname
    return (
      authenticated == null &&
      (path == "/myPuzzles" || path == "/profile" || path == "/newPuzzle")
    )
  }

  redirectIfReloadingWhileGame()

  return (
    <>
      <Navbar userData={authenticated} />
      <>
        {ifWaitWhileReloading() ? (
          <div className="homePage"></div>
        ) : redirectIfNotAuthenticated() ? <></> : (
          <Routes>
            <Route
              path="/"
              element={
                <HomePage userData={authenticated} onUserUpdate={userUpdated} />
              }
            />
            <Route
              path="/newPuzzle"
              element={
                <CreatePuzzle
                  userData={authenticated}
                  onGameCreated={startGame}
                />
              }
            />
            <Route
              path="/game"
              element={
                <GameBoard
                  userData={authenticated}
                  gameData={gameData}
                  onGameCompletion={gameCompleted}
                />
              }
            />
            <Route
              path="/gameSummary"
              element={
                <GameSummary
                  userData={authenticated}
                  completionData={completionData}
                />
              }
            />
            <Route
              path="/myPuzzles"
              element={
                <MyPuzzles userData={authenticated} onGameCreated={startGame} />
              }
            />
            <Route
              path="/profile"
              element={<MyProfile userData={authenticated} />}
            />
            <Route
              path="/login"
              element={
                <div className="loginRegister">
                  {currentForm === "login" ? (
                    <Login onFormSwitch={toggleForm} />
                  ) : (
                    <Register onFormSwitch={toggleForm} />
                  )}
                </div>
              }
            />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </>
    </>
  )
}
