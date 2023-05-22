import React from 'react';
import axios from 'axios';

const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
})

export default function RegisterPage(props) {
  const [newUser, setNewUser] = React.useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [displayNameError, setDisplayNameError] = React.useState(false);
  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordCriteriaError, setPasswordCriteriaError] = React.useState(false)
  const [securePasswordError, setSecurePasswordError] = React.useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setNewUser(prevData => {
      return {
        ...prevData,
        [name]: value
      }
    })
  }

  const containsText = /\S/
  const validEmail = /.+@[a-z]+\.[a-z]{2,}/
  function checkValidity() {
    let result = true;

    if (displayNameError) setDisplayNameError(false)
    if (!containsText.test(newUser.displayName)) {
      setDisplayNameError(true)
      result = false
    }

    if (emailError) setEmailError(false)
    if (!containsText.test(newUser.email) ||
      !validEmail.test(newUser.email)) {
      setEmailError(true)
      result = false
    }

    if (passwordError) setPasswordError(false)
    if (!containsText.test(newUser.password)) {
      setPasswordError(true)
      result = false
    }

    if (passwordCriteriaError) setPasswordCriteriaError(false)
    if (newUser.password.length < 8 || !/\d/.test(newUser.password) || !/[A-Za-z]/.test(newUser.password)) {
      setPasswordCriteriaError(true)
      result = false
    }

    if (securePasswordError) setSecurePasswordError(false)
    if (newUser.password.includes(newUser.displayName) || newUser.password.includes(newUser.email)) {
      setSecurePasswordError(true)
      result = false
    }

    if (confirmPasswordError) setConfirmPasswordError(false)
    if (newUser.password !== newUser.confirmPassword) {
      setConfirmPasswordError(true)
      result = false
    }

    return result
  }

  function handleRegister(event) {
    event.preventDefault()
    if (!checkValidity()) return

    let user = {
      username: newUser.displayName,
      email: newUser.email,
      password: newUser.password,
    }

    server.post('/register', user)
      .then(response => {
        if (response.data.unique_email) {
          props.setMessage({ display: true, color: "lightgreen", text: "Registration Complete. Redirect to login" })
          props.setPage("LoginPage")
        }
        else props.setMessage({ display: true, color: "lightcoral", text: "Registration Failed. Someone already exists with this email" })
      })
      .catch(err => {
        console.log(err)
        props.setMessage({ display: true, color: "lightcoral", text: "Server Error" })
      })

    props.setPage("LoginPage")
  }

  return (
    <div className='user-info-section'>
      <h6>Display Name</h6>
      <input
        type="text"
        id="newUsername"
        name="displayName"
        onChange={handleChange}
      ></input>
      {displayNameError && <p className='inputError'>Please choose a display name</p>}

      <h6>Email</h6>
      <input
        type="text"
        id="newEmail"
        name="email"
        onChange={handleChange}
      ></input>
      {emailError && <p className='inputError'>Please enter a valid email address</p>}

      <h6>Password</h6>
      <input
        type="password"
        id="newPassword"
        name="password"
        onChange={handleChange}
      ></input>
      {passwordError && <p className='inputError'>You MUST create a password</p>}
      {passwordCriteriaError && <p className='inputError'>Password does not meet criteria</p>}
      {securePasswordError && <p className='inputError'>Password cannot contain display name or password</p>}
      <p>Passwords must contain at least eight characters, including at least 1 letter and 1 number</p>

      <h6>Confirm Password</h6>
      <input
        type="password"
        id="confirm-password"
        name="confirmPassword"
        onChange={handleChange}
      ></input>
      {confirmPasswordError && <p className='inputError'>Passwords do not match</p>}

      <br></br>
      <button onClick={handleRegister}>Sign Up</button>
    </div>
  )
}
