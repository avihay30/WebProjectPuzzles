import { render } from "preact"
import { PuzzleApp } from "./puzzleApp.jsx"
import { BrowserRouter } from "react-router-dom"
import "./styles/index.css"

render(
  <BrowserRouter>
    <PuzzleApp />
  </BrowserRouter>,
  document.getElementById("app")
)
