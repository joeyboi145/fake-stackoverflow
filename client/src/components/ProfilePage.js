import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import formatDate from "../date"


const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})


export default function ProfilePage(props) {
  const [menu, setMenu] = useState([1, 0, 0, 0])
  const [deletion, setDeletion] = useState({ display: false, userID: '' })
  let profile;

  server.get(props.serverRequest)
    .then(response => {
      profile = response.data
      fillProfile()
    })
    .catch(async err => {
      console.log(err)
      await new Promise(r => setTimeout(r, 2000));
      props.setMessage({ display: true, color: "lightcoral", text: "Cannot connect to server. Trying connection every 2 secconds" })
    })

  // Generating Profile Page
  function getContentTitle() {
    if (menu[0]) return "Questions:"
    else if (menu[1]) return "Answers:"
    else if (menu[2]) return "Tags:"
    else if (menu[3]) return "Users:"
    else return "Content:"
  }

  function fillProfile() {
    ReactDOM.render(
      <>
        {deletion.display &&
          <div id='delete-prompt'>
            <p>Are you sure you want to delete this user?</p>
            <button onClick={handleDeleteUser}>Yes</button>
            <button onClick={() => setDeletion({ display: false, userID: '' })}>No</button>
          </div>
        }
        <div id="profile-header">
          <div id="profile-pic">
            <p>{profile.username.substr(0, 1).toUpperCase()}</p>
          </div>
          <div id="profile-info">
            {(props.login.user.username === profile.username) && <p style={{ color: "lightslategray" }}>Your Profile</p>}
            <p id="profile-name">{profile.username}</p>
            <div id="profile-stats">
              <p>Member since: {formatDate(profile.member_since)}</p>
              <p>Reputation: {profile.reputation}</p>
            </div>
          </div>
        </div>
        <div id="profile-body">
          <MenuButtons />
          <div id="profile-content">
            <h1 id="profile-content-title">{getContentTitle()}</h1>
            <table id="profile-content-table"></table>
          </div>
        </div>
      </>,
      document.getElementById('profile-page'))

    if (menu[0]) getQuestions()
    else if (menu[1]) getAnswers()
    else if (menu[2]) getTags()
    else if (menu[3]) getUsers()

  }

  // Generating Questions Content
  async function getQuestions() {
    try {
      const response = await server.get(`/posts/search-user-questions/${profile.userID}`)
      let questions = response.data
      formatQuestion(questions)
    } catch (err) {
      console.log(err)
      props.setMessage({ display: true, color: "lightcoral", text: "Server Error" })
    }
  }

  async function formatQuestionTags(tagIDs, questionID) {
    let tags = []
    let promises = tagIDs.map(id => {
      return server.get(`/posts/tag/${id}`)
        .then(response => tags.push(response.data))
        .catch(err => {
          console.log(err)
          props.setMessage({ display: true, color: "lightcoral", text: "Server Error" })
        })
    })

    Promise.all(promises).then(() => {
      tags.sort((tag1, tag2) => {
        if (tag1.name < tag2.name) return -1
        if (tag1.name > tag2.name) return 1
        else return 0
      })

      const displayTags = tags.map(tag => {
        return <button
          key={tag._id}
        //onClick={handleTagClick}
        >{tag.name}</button>
      })
      ReactDOM.render(
        displayTags,
        document.getElementById(`${questionID}-tagBox`)
      )
    })
  }

  async function formatQuestion(questions) {
    questions.sort((question1, question2) => {
      return question1.ask_date_time - question2.ask_date_time
    })

    let tabledQuestions = questions.map(question => {
      const votePlurality = (question.votes === 1) ? 'vote' : 'votes'
      const answerPlurality = (question.answers.length === 1) ? ' answer' : 'answers'
      const viewPlurality = (question.views === 1) ? ' view' : ' views'
      const tagBox = `${question._id}-tagBox`

      return (
        <tr>
          <td className='profile-display-question'>
            <div className='profile-question-displayStats'>
              <p> {question.votes} {votePlurality}</p>
              <p> {question.answers.length} {answerPlurality} </p>
              <p> {question.views} {viewPlurality} </p>
            </div>

            <a href="#message-box"
              className="profile-question-displayTitle"
            //onClick={handleTitleClick}
            >
              {question.title}
            </a>

            <div className='profile-question-TT'>
              <div id={tagBox} className='question-displayTags'></div>
              <p>asked {formatDate(question.ask_date_time)}</p>
            </div>
          </td>
        </tr>
      )
    })

    if (tabledQuestions.length === 0) {
      tabledQuestions =
        <tr>
          <td className='profile-content-error'>
            <p>No Questions Found</p>
          </td>
        </tr>
    }

    ReactDOM.render(<tbody>{tabledQuestions}</tbody>,
      document.getElementById("profile-content-table"))
    questions.forEach(question => formatQuestionTags(question.tags, question._id))
  }

  // Generating Answers Content
  async function getAnswers() {
    try {
      const response = await server.get(`/posts/search-user-answers/${profile.userID}`)
      let documents = response.data
      formatAnswers(documents)
    } catch (err) {
      console.log(err)
      props.setMessage({ display: true, color: "lightcoral", text: "Server Error" })
    }
  }

  async function formatAnswers(documents) {
    documents.sort((doc1, doc2) => {
      return doc1.answer.ask_date_time - doc2.answer.ask_date_time
    })

    let tabledAnswers = documents.map(document => {
      const answer = document.answer
      const votePlurality = (answer.votes === 1) ? 'vote' : 'votes'

      return (
        <tr>
          <td className='profile-display-answer'>
            <div className='profile-answer-displayStats'>
              <p> {answer.votes} {votePlurality}</p>
            </div>

            <a href="#message-box"
              className="profile-answer-displayTitle"
            //onClick={handleTitleClick}
            >
              {document.question_title}
            </a>

            <p>answered {formatDate(answer.ask_date_time)}</p>
          </td>
        </tr>
      )
    })

    if (tabledAnswers.length === 0) {
      tabledAnswers =
        <tr>
          <td className='profile-content-error'>
            <p>No Answers Found</p>
          </td>
        </tr>
    }

    ReactDOM.render(<tbody>{tabledAnswers}</tbody>,
      document.getElementById("profile-content-table"))
  }

  // Generating Tags Content
  async function getTags() {
    try {
      const response = await server.get(`/posts/search-user-tags/${profile.userID}`)
      let tags = response.data
      console.log(tags)
      formatTags(tags)
    } catch (err) {
      console.log(err)
      props.setMessage({ display: true, color: "lightcoral", text: "Server Error" })
    }
  }

  async function formatTags(tags) {
    let tabledTags = tags.map(tag => {
      return <tr>
        <td className='profile-tag'>
          {tag.name}
        </td>
      </tr>
    })

    if (tabledTags.length === 0) {
      tabledTags =
        <tr>
          <td className='profile-content-error'>
            <p>No Tags Found</p>
          </td>
        </tr>
    }

    ReactDOM.render(<tbody className='profile-tags'>{tabledTags}</tbody>,
      document.getElementById("profile-content-table"))
  }

  // Generating User Content
  async function getUsers() {
    try {
      const response = await server.get('/users/all-users/')
      let users = response.data
      formatUsers(users)
    } catch (err) {
      console.log(err)
      props.setMessage({ display: true, color: "lightcoral", text: "Server Error" })
    }
  }

  async function formatUsers(users) {
    let tabledUsers = users.map(user => {
      return (
        <tr>
          <div className='profile-display-user'>
            <div className='display-profile-section'>
              <div className='display-profile'><p>{user.username.substr(0, 1).toUpperCase()}</p></div>
              <div className='display-profile-text'>
                <h3 className='display-profile-title'
                  onClick={() => handleAuthorClick(user.userID)}>
                  {user.username}
                </h3>
                <p>Reputation: {user.reputation}</p>
                <p>Member since: {formatDate(user.member_since)}</p>
              </div>
            </div>
            <div className='profile-delete-section'>
              <button onClick={() => setDeletion({ display: true, userID: user.userID })}>
                Delete
              </button>
            </div>
          </div>
        </tr>
      )
    })

    if (tabledUsers.length === 0) {
      tabledUsers =
        <tr>
          <td className='profile-content-error'>
            <p>No Users Found</p>
          </td>
        </tr>
    }

    ReactDOM.render(<tbody>{tabledUsers}</tbody>,
      document.getElementById("profile-content-table"))
  }

  function handleDeleteUser() {
    server.post(`/user/delete/${deletion.userID}`, {})
      .then(() => {
        setDeletion({ display: false, userID: '' })
        props.setMessage({ display: true, color: "lightgreen", text: "User deleted" })
      })
      .catch(err => {
        console.log(err)
        props.setMessage({ display: true, color: "lightcoral", text: "Error in deletion" })
      })
  }

  function handleAuthorClick(userID) {
    setMenu([1, 0, 0, 0])
    props.setMessage({ display: true, color: '', text: '' })
    props.setServerRequest(`/login/profile/${userID}`)
    props.setPage("ProfilePage")
  }


  function MenuButtons() {
    return (
      <div id="profile-menu">
        <h1 id="profile-menu-title">Menu</h1>
        <button
          style={{ backgroundColor: menu[0] ? 'lightgrey' : 'inherit' }}
          onClick={() => setMenu([1, 0, 0, 0])}>
          Questions
        </button>
        <button
          style={{ backgroundColor: menu[1] ? 'lightgrey' : 'inherit' }}
          onClick={() => setMenu([0, 1, 0, 0])}>
          Answers
        </button>
        <button
          style={{ backgroundColor: menu[2] ? 'lightgrey' : 'inherit' }}
          onClick={() => setMenu([0, 0, 1, 0])}>
          Tags
        </button>
        {profile.admin && (props.login.user.username === profile.username) &&
          <button
            style={{ backgroundColor: menu[3] ? 'lightgrey' : 'inherit' }}
            onClick={() => setMenu([0, 0, 0, 1])}>
            Users
          </button>
        }
      </div>
    )
  }


  return <div id='profile-page'></div>

}