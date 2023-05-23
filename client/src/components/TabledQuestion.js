import React, { useRef } from 'react'
import ReactDOM from 'react-dom/client'
import formatDate from '../date'
import axios from 'axios'


const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})

export default function TabledQuestion(props) {
  const authorBox = useRef(null)
  const tagBox = useRef(null)

  const question = props.question
  const votePlurality = (question.votes === 1) ? 'vote' : 'votes'
  const answerPlurality = (question.answers.length === 1) ? ' answer' : 'answers'
  const viewPlurality = (question.views === 1) ? ' view' : ' views'
  const tags = []

  const promises = question.tags.map(tagID => {
    return (
      server.get(`/posts/tag/${tagID}`)
        .then((response) => {
          if (response.data.name === 'CastError') { throw new Error('Invalid Parameter') }
          tags.push(response.data)
        })
        .catch(err => {
          console.log(err)
        })
    )
  })
  Promise.all(promises).then(() => formatTags())


  function formatTags() {
    tags.sort((tag1, tag2) => {
      if (tag1.name < tag2.name) return -1
      if (tag1.name > tag2.name) return 1
      else return 0
    })
    const displayTags = tags.map(tag => {
      return <button
        key={tag._id}
        onClick={handleTagClick}>{tag.name}</button>
    })
    if (tagBox.current === null) tagBox.current = ReactDOM.createRoot(document.getElementById(`tagBox${question._id}`))
    tagBox.current.render(displayTags)
  }


  function requestUser() {
    const userID = question.asked_by
    server.get(`/users/find/${userID}`)
      .then((response) => {
        if (authorBox.current === null) authorBox.current = ReactDOM.createRoot(document.getElementById(`authorBox${question._id}`))
        authorBox.current.render(
          <p onClick={() => handleAuthorClick(response.data.userID)}>
            {response.data.username}
          </p>,
        )
      })
      .catch(err => {
        console.log(err)
      })
  }
  requestUser()


  function handleTitleClick() {
    server.post(`/posts/update-view/${question._id}`, {
      views: question.views + 1
    }).then((res) => {
      props.setMessage({ display: false, color: '', text: "" })
      props.setMenuColors([0, 0])
      props.setServerRequest(`/posts/question/${question._id}`);
      props.setPage('QuestionPage')
      props.setQuestion(question._id)
    }).catch((err) => console.log(err))
  }

  function handleTagClick(event) {
    const tag = event.target.textContent
    props.setMessage({ display: false, color: '', text: "" })
    props.setServerRequest(`/posts/search-tag/${tag}`)
    props.setQuestionsBanner(['Search Results', [0, 0, 0]])
  }

  function handleAuthorClick(userID) {
    props.setMessage({ display: true, color: '', text: '' })
    props.setServerRequest(`/login/profile/${userID}`)
    props.setPage("ProfilePage")
  }

  return (
    <tr>
      <td className="display-question">
        <div className='question-displayStats'>
          <p> {question.votes} {votePlurality}</p>
          <p> {question.answers.length} {answerPlurality} </p>
          <p> {question.views} {viewPlurality} </p>
        </div>

        <div className="question-displayInfo">
          <a href="#section-top"
            className="question-displayTitle"
            onClick={handleTitleClick}
          >
            {question.title}
          </a>
          <div id={`tagBox${question._id}`} className='question-displayTags'></div>
        </div>

        <div className="author-and-recency">
          <div id={`authorBox${question._id}`} className="question-displayAuthor"></div>
          <p className="question-displayDate">asked {formatDate(question.ask_date_time)} </p>
        </div>
      </td>
    </tr>
  )
}
