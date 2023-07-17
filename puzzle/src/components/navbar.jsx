import {
  Link,
  useNavigate,
  useMatch,
  useResolvedPath,
} from "react-router-dom"

export default function Navbar(props) {

  const logout = () => {
    localStorage.setItem("user", null)
    window.location.href = "/"
  }

  const isInProfile = () => {
    const resolvedPath = useResolvedPath("/profile")
    const isActive = useMatch({ path: resolvedPath.pathname, end: true })
    return isActive
  }

  const alertUserIfNeeded = (path) => {
    if (window.location.pathname != "/game") return

    if (path == "/logout") {
      const confirmed = window.confirm(
        "Are you sure you want to exit the game?\nyour progress will be discraded!"
      )
      if (confirmed) {
        logout()
      }
      return
    }

    window.location.href = path
  }
  return window.location.pathname == "/game" ? (
    <nav className="nav">
      <Link onClick={() => alertUserIfNeeded("/")} className="site-logo">
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
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
        Puzzle2Gather
      </Link>
      <ul>
        <li className="flex items-center" style={{ backgroundColor: "#333" }}>
          <span>Hello {props.userData.name}</span>
        </li>

        <Link onClick={() => alertUserIfNeeded("/profile")}>My proflie</Link>
        <li>
          <Link onClick={() => alertUserIfNeeded("/logout")}>Logout</Link>
        </li>
      </ul>
    </nav>
  ) : (
    <nav className="nav">
      <Link to="/" className="site-logo">
        <div className="mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-8 h-8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </div>
        Puzzle2Gather
      </Link>
      {props.userData != null ? (
        <ul>
          {!isInProfile() ? (
            <li
              className="flex items-center"
              style={{ backgroundColor: "#333" }}
            >
              <span>Hello {props.userData.name}</span>
            </li>
          ) : (
            <></>
          )}
          <CustomLink to="/profile">My proflie</CustomLink>
          <li>
            <Link onClick={logout}>Logout</Link>
          </li>
        </ul>
      ) : (
        <ul>
          <CustomLink to="/login">Login</CustomLink>
        </ul>
      )}
    </nav>
  )
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)
  const isActive = useMatch({ path: resolvedPath.pathname, end: true })
  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  )
}
