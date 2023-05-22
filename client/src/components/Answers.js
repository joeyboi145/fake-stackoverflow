import React, { useState } from 'react'
import formatDate from "../date"
import ReactDOM from 'react-dom'
import axios from 'axios'
import Comments from "./Comments"

const regex = /\[[^\]]+?\]\([^)]+?\)/g
const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})


export default function Answers({ answerIDs, login, setMessage, setServerRequest, setPage }) {
  const [render, setRender] = useState({ answer_set: 1, answer_count: null })
  const answer_display = 5
  const answers = []
  const promises = answerIDs.map(id => {
    return (
      server.get(`/posts/answer/${id}`)
        .then(response => {
          if (response.data.name === 'CastError') console.log('Invalid Parameter')
          else answers.push(response.data)
        })
        .catch(async err => {
          console.log(err)
          await new Promise(r => setTimeout(r, 2000));
          setMessage({ display: true, color: "lightcoral", text: "Cannot connect to server. Trying connection every 2 secconds" })
        })
    )
  })
  Promise.all(promises).then(() => fillTable(answers))


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

  async function getAnswerUser(userID) {
    try {
      const response = await server.get(`/users/find/${userID}`)
      return response.data
    } catch (err) {
      console.log(err)
      return userID
    }
  }

  async function fillTable(answers) {
    if (render.answer_count !== answers.length) setRender({ answer_set: 1, answer_count: answers.length })

    answers.sort((ans1, ans2) => {
      if (ans1.ask_date_time < ans2.ask_date_time) return 1
      else if (ans1.ask_date_time > ans2.ask_date_time) return -1
      else {
        if (ans1.text < ans2.text) return 1
        else if (ans1.text > ans2.text) return -1
        else return 0
      }
    })

    let tabledAnswers = []
    for (var i = (render.answer_set - 1) * answer_display;
      i < (render.answer_set) * answer_display && i < render.answer_count;
      i++) {
      let answer = answers[i]
      let { userID, username } = await getAnswerUser(answer.ans_by)
      tabledAnswers.push(
        <>
          <tr>
            <td className="answer">
              <div className="answer-stats">
                <p className="answer-title">Answer</p>
                <div
                  className='triangle-up'
                  onClick={() => handleVote(answer._id, answer.votes, +1)}>
                </div>
                <p className="answer-votes">{answer.votes}</p>
                <div
                  className='triangle-down'
                  onClick={() => handleVote(answer._id, answer.votes, -1)}>
                </div>
              </div>
              <div className="answer-body">{retrieveText(answer)}</div>
              <div className="answer-info">
                <p className="author-and-recency answer-displayAuthor"
                  onClick={() => handleAuthorClick(userID)}>
                  {username}
                </p>
                <p id="answer-date">asked {formatDate(answer.ask_date_time)}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <Comments
                documentID={answer._id}
                documentType={"answer"}
                commentIDs={answer.comments}
                login={login}
                setMessage={setMessage}
                setServerRequest={setServerRequest}
                setPage={setPage}
              />
            </td>
          </tr>
        </>
      )
    }

    ReactDOM.render(
      <tbody>
        {tabledAnswers}
        <tr>
          <td id='answer-buttons'>
            <p>Answers: </p>
            <button onClick={handlePrevButton}>Prev</button>
            <p>{((render.answer_set - 1) * answer_display) + 1}-{Math.min(((render.answer_set) * answer_display), render.answer_count)}</p>
            <button onClick={handleNextButton}>Next</button>
          </td>
        </tr>
      </tbody>,
      document.getElementById('answer-table'))

  }

  function handlePrevButton() {
    if (render.answer_set > 1)
      setRender({
        answer_set: (render.answer_set - 1),
        answer_count: render.answer_count
      })
  }

  function handleNextButton() {
    let max = Math.floor((render.answer_count - 1) / answer_display) + 1
    if (render.answer_set < max)
      setRender({
        answer_set: (render.answer_set + 1),
        answer_count: render.answer_count
      })
  }

  function handleVote(answerID, vote, voteDifference) {
    if (!login.login)
      setMessage({ display: true, color: 'lightcoral', text: 'Vote Failed. Try Logging In.' })
    else {
      server.get(`/login/profile/${login.user.userID}`)
        .then((response) => {
          if (response.data.reputation < 50) {
            setMessage({ display: true, color: 'lightcoral', text: 'Vote Failed. Reputation too low.' })
          } else {
            let repDifference = (voteDifference === 1) ? 5 : -10;

            server.post(`/posts/update-vote/answer/${answerID}`, {
              votes: vote + voteDifference,
              userID: login.user.userID,
              reputation: response.data.reputation + repDifference
            })
              .then(() => setMessage({ display: false, color: '', text: '' }))
              .catch(err => {
                console.log(err)
                setMessage({ display: true, color: 'lightcoral', text: 'Vote Failed. Try again.' })
              })
          }
        })
    }
  }

  function handleAuthorClick(userID) {
    setMessage({ display: true, color: '', text: '' })
    setServerRequest(`/login/profile/${userID}`)
    setPage("ProfilePage")
  }

  function handleAuthorClick(userID) {
    setMessage({ display: true, color: '', text: '' })
    setServerRequest(`/login/profile/${userID}`)
    setPage("ProfilePage")
  }

  return (
    <table id="answer-table" className="answers"></table>
  )
}