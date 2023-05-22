import React, { useState } from 'react'
import axios from 'axios'

const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})


export default function LoginPage(props) {
  const [login, setLogin] = useState(
    {
      email: '',
      password: ''
    }
  )

  const [noAccountError, setNoAccountError] = useState(false)
  const [emptyEmailError, setEmptyEmailError] = useState(false)
  const [emptyPasswordError, setEmptyPasswordError] = useState(false)
  const [failedLogin, setFailedLogin] = useState(false)

  const containsText = /.*\S.*/
  function checkValidity() {
    let result = true

    if (emptyEmailError) setEmptyEmailError(false)
    if (!containsText.test(login.email)) {
      setEmptyEmailError(true)
      result = false
    }

    if (emptyPasswordError) setEmptyPasswordError(false)
    if (!containsText.test(login.password)) {
      setEmptyPasswordError(true)
      result = false
    }

    if (noAccountError) setNoAccountError(false)
    if (failedLogin) setFailedLogin(false)
    return result
  }


  function handleLogin(event) {
    event.preventDefault()
    if (!checkValidity()) return

    server.post('/login', login, { withCredentials: true })
      .then((response) => {
        console.log(response)
        if (!response.data.found) setNoAccountError(true)
        else if (!response.data.login) setFailedLogin(true)
        else {
          props.setMessage({display: true, color: "lightgreen", text: `Logged in. Welcome back ${response.data.user.username}`})
          props.setLogin({ login: true, user: response.data.user })
          props.setServerRequest('/posts/newest')
          props.setPage('AllQuestionsPage')
        }
      })
      .catch(err => {
        console.log(err)
        props.setMessage({display: true, color: "lightcoral", text: "Server Error"})
      })
  }

  function handleChange(event) {
    const { name, value } = event.target
    setLogin(prevData => {
      return {
        ...prevData,
        [name]: value
      }
    })
  }

  return (
    <div className='user-info-section'>
      <h6>Email</h6>
      <input
        type="text"
        id="emailInput"
        name="email"
        onChange={handleChange}
      ></input>
      {emptyEmailError && <p className='inputError'>Email cannot be empty</p>}
      {failedLogin && <p className='inputError'>The email or password is incorrect</p>}
      {noAccountError && <p className='inputError'>No user found with matching email</p>}

      <h6>Password</h6>
      <input
        type="password"
        id="passwordInput"
        name="password"
        onChange={handleChange}
      ></input>
      {emptyPasswordError && <p className='inputError'>Password cannot be empty</p>}
      <br></br>
      <button onClick={handleLogin}>Log in</button>
    </div>
  )
}