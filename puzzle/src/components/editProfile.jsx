import { Component } from "preact"
import {
  SERVER_URL,
  getLoadingSpinner,
  is_response_ok,
} from "../utils/utils"

export default class EditProfile extends Component {
  constructor(props) {
    super()
    this.state = {
      user: props.userData,
      isNameValid: true,
      isEmailValid: true,
      isEditActive: false,
      loading: false,
    }
  }

  raiseUserDataToProfile = () => {
    const { onUserDataChange } = this.props
    const updatedUserData = this.state.user
    /* Call the callback function to update user data in 
       local storage and trigger re-render in MyProfile Component */
    onUserDataChange(updatedUserData)
  }

  saveUpdatedData(event) {
    this.setState({
      loading: true,
    })
    const { user } = this.state
    fetch(`${SERVER_URL}/players/${user._id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
      }),
    }).then((response) => {
      if (is_response_ok(response)) {
        this.setState({
          loading: false,
          isEditActive: false,
        })

        this.raiseUserDataToProfile()
        this.props.onNotification(response)
      } else {
        /* Call the callback function to show notification 
           and trigger re-render in MyProfile Component */
        this.props.onNotification(response)
        this.setState({
          loading: false,
        })
      }
    })
  }

  toggleEditProfile(event) {
    this.setState({
      isEditActive: !this.state.isEditActive,
    })
  }

  handleNameChange = (event) => {
    this.setState({
      user: {
        ...this.state.user,
        name: event.target.value,
      },
      isNameValid: event.target.value.length > 0,
    })
  }

  handleEmailChange = (event) => {
    this.setState({
      user: {
        ...this.state.user,
        email: event.target.value,
      },
      isEmailValid: this.validateEmail(event.target.value),
    })
  }

  validateEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    return emailRegex.test(email)
  }

  getErrorMsgIfExists() {
    const { isEmailValid, isNameValid } = this.state
    if (isEmailValid && isNameValid) return

    let msg = ""
    if (!isEmailValid && !isNameValid) {
      msg = "Name and Email are invalid."
    } else if (!isNameValid) {
      msg = "Name is empty."
    } else if (!isEmailValid) {
      msg = "Email is invalid."
    }

    return (
      <p class="mt-2 text-sm text-red-600 dark:text-red-500">
        <span class="font-medium">Oh, snapp!</span> {msg}
      </p>
    )
  }

  getHeader() {
    if (this.state.isEditActive) {
      return (
        <div className="mb-3 w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer text-indigo-700">
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
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </div>
      )
    } else
      return (
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
      )
  }

  editIsOffContant() {
    return (
      <button
        class="my-10 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-lg font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
        onclick={(event) => this.toggleEditProfile(event)}
      >
        <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
          Edit your profile
        </span>
      </button>
    )
  }

  editIsOnContant() {
    return (
      <div>
        <div className="flex flex-col md:py-0 py-4">
          <label
            htmlFor="fullname"
            className="text-gray-800 dark:text-gray-100 text-sm font-bold leading-tight tracking-normal mb-2"
          >
            Full Name
          </label>
          <input
            id="fullname"
            className="mb-2 text-gray-600 dark:text-gray-700 focus:outline-none focus:border focus:border-indigo-700 dark:focus:border-indigo-700 dark:border-gray-700 dark:bg-gray-300 bg-white font-normal w-64 h-10 flex items-center pl-3 text-sm border-gray-300 rounded border shadow"
            onChange={this.handleNameChange}
            value={this.state.user.name}
            placeholder="Your new name"
          />
          <label
            htmlFor="email"
            className="text-gray-800 dark:text-gray-100 text-sm font-bold leading-tight tracking-normal mb-2"
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute text-white flex items-center px-4 border-r dark:border-gray-700 h-full bg-indigo-700 dark:bg-indigo-600 rounded-l cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-mail"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" />
                <rect x={3} y={5} width={18} height={14} rx={2} />
                <polyline points="3 7 12 13 21 7" />
              </svg>
            </div>
            <input
              id="email"
              className={
                "text-gray-600 dark:text-gray-700 focus:outline-none focus:border focus:border-indigo-700 dark:focus:border-indigo-700 dark:border-gray-300 dark:bg-gray-300 bg-white font-normal w-64 h-10 flex items-center pl-16 text-sm border-gray-300 rounded border shadow"
              }
              value={this.state.user.email}
              onChange={this.handleEmailChange}
              placeholder="Your new email"
              type="email"
            />
          </div>
          {this.getErrorMsgIfExists()}
        </div>
        <div class="my-5 flex">
          <button
            class={`flex-auto w-45 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800 
            ${
              !this.state.isEmailValid || !this.state.isNameValid
                ? "disabled:opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={(event) => this.saveUpdatedData(event)}
            disabled={!this.state.isEmailValid || !this.state.isNameValid}
          >
            <span class="flex-auto relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              Save
            </span>
          </button>
          <button
            class="flex-auto w-5 relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
            onClick={(event) => this.toggleEditProfile(event)}
          >
            <span class="flex-auto relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              Cancel
            </span>
          </button>
        </div>
      </div>
    )
  }

  render() {
    let contant = this.editIsOffContant()
    if (this.state.isEditActive) contant = this.editIsOnContant()

    if (this.state.loading == true) contant = getLoadingSpinner()

    return (
      <div className="w-full lg:w-1/3 px-12 border-t border-b lg:border-t-0 lg:border-b-0 lg:border-l lg:border-r border-gray-300 flex flex-col items-center py-10">
        {this.getHeader()}
        {contant}
      </div>
    )
  }
}
