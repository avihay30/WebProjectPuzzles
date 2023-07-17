import { useState } from "react"
import { SERVER_URL, parse_response, is_response_ok } from "../utils/utils"
import NotificationAlert from "./notificationAlert"

export const Login = (props) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showNotification, setShowNotification] = useState(false)
  const [response, setResponse] = useState(null)

  const loginUser = async (e) => {
    e.preventDefault()

    let response = await fetch(`${SERVER_URL}/players/login/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
    if (is_response_ok(response)) {
      setLogedin(await parse_response(response))
      window.location.pathname = "/"
    } else {
      handleNotification(response)
      setLogedin(null)
    }
  }

  const setLogedin = async (userData) => {
    let data = null
    delete userData.password
    if (userData != null) data = JSON.stringify(userData)
    localStorage.setItem("user", data)
  }

  // Presenting Notification Alert
  const handleNotification = (response) => {
    setShowNotification(true)
    setResponse(response)
  }

  const alertClosed = () => {
    setShowNotification(false)
  }

  return (
    <>
      {showNotification && (
        <NotificationAlert
          response={response}
          onAlertClose={alertClosed}
        ></NotificationAlert>
      )}
      <div className="auth-form-container h-104">
        <h1 className="text-5xl font-semibold leading-normal text-blueGray-700 mb-4">Log-in</h1>
        <form className="login-form" onSubmit={loginUser}>
          <label htmlFor="email" className="form-label" >Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="JohnSnow@TheWall.com"
            id="email"
            name="email"
          />
          <label htmlFor="password">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="********"
            id="password"
            name="password"
          />
          <button className="my-8 relative inline-flex items-center justify-center text-lg font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800" type="submit" style={{ border: "2px solid white" }}>
          Log In 
          </button>
        </form>
        <button
          className="link-btn"
          onClick={() => props.onFormSwitch("register")}
        >
          Don't have an account? Register here.
        </button>
      </div>
    </>
  )
}
