import React from 'react';
import axios from 'axios';

const regex = /\[[^\]]+?\]\([^)]+?\)/
const errorRegex = /(\[.*?(\])+.*?\]\(.*?\))|(\[.*?\]\(.*?(\))+.*?\))|(\[.+?\]\(\))/
const http = /\[[^\]]*?\]\(http:\/\/([^)]*?)\)/
const https = /\[[^\]]*?\]\(https:\/\/([^)]*?)\)/
const emptyLink = /(\[[^\]]+?\]\(http:\/\/\))|(\[[^\]]+?\]\(https:\/\/\s*\))/

const server = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
})

export default function NewAnswerPage (props) {
  const [newAnswer, setNewAnswer] = React.useState(
    {
      text: '',
    }
  )

  const [answerTextError, setAnswerTextError] = React.useState(false)
  const [answerHyperlinkError, setAnswerHyperlinkError] = React.useState(false)
  const [answerHTTPError, setAnswerHTTPError] = React.useState(false)
  const [answerEmptyLinkError, setAnswerEmptyLinkError] = React.useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setNewAnswer(prevData => {
      return {
        ...prevData,
        [name]: value
      }
    })
  }

  const containsText = /\S/
  function checkValidity() {
    let result = true

    setAnswerTextError(false)
    if (!containsText.test(newAnswer.text)) {
      setAnswerTextError(true)
      result = false
    }

    setAnswerHyperlinkError(false)
    if (errorRegex.test(newAnswer.text)) {
      setAnswerHyperlinkError(true)
      result = false
    }

    setAnswerEmptyLinkError(false)
    setAnswerHTTPError(false)
    const links = newAnswer.text.match(regex)
    if (links !== null) {
      links.forEach(link => {
        if (!http.test(link) && !https.test(link)) {
          setAnswerHTTPError(true)
          result = false
        }
        if (emptyLink.test(link)) {
          setAnswerEmptyLinkError(true)
          result = false
        }
      })
    }

    return result
  }

  function addAnswer(event) {
    event.preventDefault()

    if (!checkValidity()) { return }

    const answer = {
      ...newAnswer,
      question_id: props.question
    }

    server.post('/posts/new-answer', answer, {withCredentials: true})
      .then(response => {
        props.setServerRequest(`/posts/question/${props.question}`)
        props.setPage("QuestionPage")
      })
      .catch(err => console.log(err))
  }

  return (
    <form id="new-answer-form" className="new-answer-page">
      <h2> Answer Text* </h2>
      <textarea
        rows="10"
        cols="50"
        id="newAnswerText"
        name="text"
        onChange={handleChange}>
      </textarea>
      {answerTextError && <p className="error-message">Cannot be left empty</p>}
      {answerHyperlinkError && <p className="error-message">Hyperlink not formatted correctly</p>}
      {answerHTTPError && <p className="error-message">URL does not start with &apos;http://&apos; or &apos;https://&apos;</p>}
      {answerEmptyLinkError && <p className="error-message">URL cannot be empty</p>}

      <div id="post-answer">
        <a href="#section-top">
          <button id="postAnswerButton" onClick={addAnswer}>Post Answer</button>
        </a>
        <p>*indicates mandatory fields</p>
      </div>
    </form>
  )
}
