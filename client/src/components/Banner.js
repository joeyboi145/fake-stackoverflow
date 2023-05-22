import React from 'react'
import axios from 'axios'

const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})


export default function Banner(props) {
  const [searchText, setSearchText] = React.useState('')
  const containsText = /.*\S.*/

  function search (input) {
    props.setQuestionsBanner(['Search results', [0, 0, 0]])
    const searchTerms = input.replace(/\[.*?\]/g, ' ').trim().split(/\s+/)

    if (input.includes('[') && input.includes(']')) {
      const searchTags = input.replace(/(^.*?\[)|(\].*?\[)|(\].*?$)/g, ' ').trim().split(/\s+/)

      if (searchTerms[0] === '') props.setServerRequest(`/posts/search-tag/${searchTags}`)
      else props.setServerRequest(`/posts/search/${searchTags}/${searchTerms}`)
    } else props.setServerRequest(`/posts/search-text/${searchTerms}`)
  }

  function handleChange (event) {
    if (event.key === 'Enter') {
      if (!containsText.test(searchText)) {
        props.setServerRequest('/posts/newest')
        props.setQuestionsBanner(['All Questions', [1, 0, 0]])
      } else search(searchText)
      event.target.value = ''
      setSearchText('')
      props.setPage('AllQuestionsPage')
    } else { setSearchText(event.target.value) }
  }

  function handleLogin() {
    props.setMessage({ display: false, color: "", text: `` })
    props.setPage('LoginPage')
  }

  function handleRegister() {
    props.setMessage({ display: false, color: "", text: `` })
    props.setPage('RegisterPage')
  }

  function handleLogout() {
    server.post('/logout', {}, { withCredentials: true })
      .then(() => {
        console.log("DESTORY SESSION")
        props.setLogin({ login: false, username: {} })
        props.setMessage({ display: true, color: "lightgreen", text: `Logout Successful` })
        props.setServerRequest('/posts/newest');
        props.setPage('AllQuestionsPage')
      })
      .catch(err => {
        console.log(err);
        props.setMessage({ display: true, color: "lightcoral", text: `Server Error. Please try again.` })
      })
  }

  function handleProfile() {
    props.setMessage({ display: true, color: '', text: '' })
    props.setServerRequest(`/login/profile/${props.login.user.userID}`)
    props.setPage("ProfilePage")
  }

  function UserSection() {
    if (props.login.login === true) {
      return (
        <>
          <div className='user-profile' onClick={handleProfile}>
            <p>{props.login.user.username.substr(0, 1).toUpperCase()}</p>
          </div>
          <button
            id='logout-button'
            className='user-buttons'
            onClick={handleLogout}>
            Log Out
          </button>
        </>
      )

    } else return (
      <>
        <button
          id='login-button'
          className='user-buttons'
          onClick={handleLogin}>
          Log In
        </button>
        <button
          id='sign-up-button'
          className='user-buttons'
          onClick={handleRegister}>
          Sign Up
        </button>
      </>
    )
  }

  return (
    <div id="banner" className="banner">
      <div className='banner-elements'>
        <h1 id="web-title">Fake Stackoverflow</h1>
        <input id="web-search"
          type="text"
          placeholder=" Search..."
        onKeyUp={handleChange}
        ></input>

        <div className='user-section'>
          <UserSection />
        </div>

      </div>
    </div>
  )
}