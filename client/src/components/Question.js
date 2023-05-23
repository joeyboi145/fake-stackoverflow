import React, { useState, useRef} from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import formatDate from '../date'
import Answers from './Answers'
import Comments from './Comments'

const regex = /\[[^\]]+?\]\([^)]+?\)/g
const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})

export default function QuestionPage(props) {
  const questionPage = useRef(null)
  const authorBox = useRef(null)

  server.get(props.serverRequest)
    .then(response => {
      if (response.data.name === 'CastError') throw new Error('Invalid Parameter')
      let question = response.data
      fillQuestionPage(question)
      fillQuestionUser(question.asked_by)
    })
    .catch(async err => {
      console.log(err)
      await new Promise(r => setTimeout(r, 2000));
      props.setMessage({display: true, color: "lightcoral", text: "Cannot connect to server. Trying connection every 2 secconds"})
    })

  function fillQuestionUser(userID) {
    server.get(`/users/find/${userID}`)
      .then(response => {
        let { username } = response.data
        if (authorBox.current === null) authorBox.current = ReactDOM.createRoot(document.getElementById('question-author'))
        authorBox.current.render(username)
      })
      .catch(err => {
        console.log(err)
        props.setMessage({ display: true, color: 'lightcoral', text: "Server Error" })
      })
  }

  function retrieveText(document) {
    const text = document.text.split(regex)
    const links = document.text.match(regex)
    let body = <p key={`${document._id}T0`}>{text[0]}</p>

    if (links !== null) {
      const linkNames = links.map(link => {
        const name = link.replace(/(^\[)|(\]\(.*)/g, '')
        return name
      })

      const hyperLinks = links.map(link => {
        const hyperLink = link.replace(/(.*\]\()|(\)$)/g, '')
        return hyperLink
      })

      for (let i = 0; i < links.length; i++) {
        const link = <a
          key={`${document._id}L${i}`}
          href={hyperLinks[i]}
          target="_blank"
          rel="noreferrer">
          {linkNames[i]}</a>
        const textElement = <p key={`${document._id}T${i + 1}`}>{text[i + 1]}</p>
        body = [body, link, textElement]
      }
    }
    return body
  }

  function QuestionStats({ question }) {
    const viewPlurality = (question.views === 1) ? ' view' : ' views'
    const answerPluraity = (question.answers.length === 1) ? ' answer' : 'answers'

    return (
      <div id='question-stats'>
        <div
          className='triangle-up'
          onClick={() => handleVote(question._id, question.votes, +1)}>
        </div>
        <p id="question-votes">{question.votes}</p>
        <div
          className='triangle-down'
          onClick={() => handleVote(question._id, question.votes, -1)}>
        </div>
        <p id="question-answers">{question.answers.length} {answerPluraity}</p>
        <p id="question-views">{question.views} {viewPlurality}</p>
      </div>
    )

  }

  function QuestionBanner({ question }) {
    return (
      <div id="question-banner">
        <p id="question-title">{question.title}</p>
        <a href="#message-display">
          <button id="questionPageButton"
            className="ask-question"
            onClick={handleAskQuestionButton}>Ask Question</button>
        </a>
      </div>
    )
  }

  function QuestionBody({ question }) {
    return (
      <div id="question-body">
        <div id="question-text">{retrieveText(question)}</div>
        <div id="question-info">
          <div id="question-author"
            className="question-displayAuthor"
            onClick={() => handleAuthorClick(question.asked_by)}>
            {question.asked_by}
          </div>
          <div id="question-date" className="question-displayDate">
            asked {formatDate(question.ask_date_time)}
          </div>
        </div>
      </div>
    )
  }

  function handleAskQuestionButton() {
    if (!props.login.login) {
      console.log("ASKQUESTION")
      props.setMessage({ display: true, color: 'lightcoral', text: 'Cannot create new answer. Try Logging In.' })
    } else {
      props.setMessage({ display: false, color: '', text: '' })
      props.setPage('NewQuestionPage')
    }
  }

  function handleAnswerButton() {
    if (!props.login.login) {
      console.log("ANSWER")
      props.setMessage({ display: true, color: 'lightcoral', text: 'Cannot create new answer. Try Logging In.' })
    } else {
      props.setMessage({ display: false, color: '', text: '' })
      props.setPage('NewAnswerPage')
    }
  }

  function handleVote(questionID, vote, voteDifference) {
    if (!props.login.login)
      props.setMessage({ display: true, color: 'lightcoral', text: 'Vote Failed. Try Logging In.' })
    else {
      server.get(`/login/profile/${props.login.user.userID}`)
        .then((response) => {
          if (response.data.reputation < 50) {
            props.setMessage({ display: true, color: 'lightcoral', text: 'Vote Failed. Reputation too low.' })
          } else {
            let repDifference = (voteDifference === 1) ? 5 : -10;

            server.post(`/posts/update-vote/question/${questionID}`, {
              votes: vote + voteDifference,
              userID: props.login.user.userID,
              reputation: response.data.reputation + repDifference
            })
              .then(() => props.setMessage({ display: false, color: '', text: '' }))
              .catch(err => {
                console.log(err)
                props.setMessage({ display: true, color: 'lightcoral', text: 'Vote Failed. Try again.' })
              })
          }
        })
    }
  }

  function handleAuthorClick(userID) {
    props.setMessage({ display: true, color: '', text: '' })
    props.setServerRequest(`/login/profile/${userID}`)
    props.setPage("ProfilePage")
  }

  function handleAuthorClick(userID) {
    props.setMessage({ display: true, color: '', text: '' })
    props.setServerRequest(`/login/profile/${userID}`)
    props.setPage("ProfilePage")
  }

  function fillQuestionPage(question) {
    if (questionPage.current === null) questionPage.current = ReactDOM.createRoot(document.querySelector('.question-page'))
    questionPage.current.render(
      <>
        <div id='question'>
          <QuestionStats question={question} />
          <div id='question-main'>
            <QuestionBanner question={question} />
            <QuestionBody question={question} />
          </div>
        </div>

        <Comments
          documentID={question._id}
          documentType={"question"}
          commentIDs={question.comments}
          login={props.login}
          setMessage={props.setMessage}
          setServerRequest={props.setServerRequest}
          setPage={props.setPage}
        />
        <Answers
          answerIDs={question.answers}
          login={props.login}
          setMessage={props.setMessage}
          setServerRequest={props.setServerRequest}
          setPage={props.setPage}
        />

        <div>
          <a href="#message-display">
            <button className="answer-button"
              href="#top"
              onClick={handleAnswerButton}>Answer Question</button>
          </a>
        </div>
      </>
    )
  }

  return (
    <div className="question-page"></div>
  )
}
