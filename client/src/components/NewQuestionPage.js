import React from 'react';
import axios from 'axios';

const regex = /\[[^\]]+?\]\([^)]+?\)/
const errorRegex = /(\[.*?(\])+.*?\]\(.*?\))|(\[.*?\]\(.*?(\))+.*?\))|(\[.+?\]\(\))/
const http = /\[[^\]]*?\]\(http:\/\/([^)]*?)\)/
const https = /\[[^\]]*?\]\(https:\/\/([^)]*?)\)/
const emptyLink = /(\[[^\]]+?\]\(http:\/\/\))|(\[[^\]]+?\]\(https:\/\/\s*\))/

const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})

export default function NewQuestionPage ({ setPage, setServerRequest, setMenuColors, login, setMessage }) {
  const [newQuestion, setNewQuestion] = React.useState(
    {
      title: '',
      text: '',
      tags: '',
    }
  )

  const [questionTitleError, setQuestionTitleError] = React.useState(false)
  const [questionTextError, setQuestionTextError] = React.useState(false)
  const [questionTagsError, setQuestionTagsError] = React.useState(false)
  const [questionTagsNumberError, setQuestionTagsNumberError] = React.useState(false)
  const [questionTagsLengthError, setQuestionTagsLengthError] = React.useState(false)
  const [questionHyperlinkError, setQuestionHyperlinkError] = React.useState(false)
  const [questionHTTPError, setQuestionHTTPError] = React.useState(false)
  const [questionEmptyLinkError, setQuestionEmptyLinkError] = React.useState(false)

  function handleChange (event) {
    const { name, value } = event.target
    setNewQuestion(prevData => {
      return {
        ...prevData,
        [name]: value
      }
    })
  }

  const containsText = /\S/
  function checkValidity () {
    let result = true

    setQuestionTitleError(false)
    if (!containsText.test(newQuestion.title)) {
      setQuestionTitleError(true)
      result = false
    }

    setQuestionTextError(false)
    if (!containsText.test(newQuestion.text)) {
      setQuestionTextError(true)
      result = false
    }

    setQuestionHyperlinkError(false)
    if (errorRegex.test(newQuestion.text)) {
      setQuestionHyperlinkError(true)
      result = false
    }

    setQuestionEmptyLinkError(false)
    setQuestionHTTPError(false)
    const links = newQuestion.text.match(regex)
    if (links !== null) {
      links.forEach(link => {
        if (!http.test(link) && !https.test(link)) {
          setQuestionHTTPError(true)
          result = false
        }
        if (emptyLink.test(link)) {
          setQuestionEmptyLinkError(true)
          result = false
        }
      })
    }

    setQuestionTagsError(false)
    if (!containsText.test(newQuestion.tagIds)) {
      setQuestionTagsError(true)
      result = false
    }

    const tagList = newQuestion.tags.trim().split(/\s+/)

    setQuestionTagsNumberError(false)
    if (tagList.length > 5) {
      setQuestionTagsNumberError(true)
      result = false
    }

    setQuestionTagsLengthError(false)
    tagList.forEach(tag => {
      if (tag.length > 10) {
        setQuestionTagsLengthError(true)
        result = false
      }
    })

    return result
  }
  
  function addQuestion (event) {
    event.preventDefault()

    if (!checkValidity()) return

    const question = {
      ...newQuestion
    }

    console.log(login)
    server.get(`/login/profile/${login.user.userID}`)
    .then(response => {
      console.log(response)
      if (response.data.reputation < 50){
        setMessage({ display: true, color: 'lightcoral', text: 'Cannot create new tag. You must have at least 50 reputation' })
      } else if (question.tags === ''){ setMessage({ display: true, color: 'lightcoral', text: 'Cannot create question. You must have a tag' })
      } else {
        server.post('/posts/new-question', question, { withCredentials: true })
        .then((response) => {
          setMessage({ display: true, color: 'lightgreen', text: 'New question create' })
          setMenuColors([1, 0])
          setServerRequest('/posts/newest')
          setPage('AllQuestionsPage')
        })
        .catch((error) => {
          setMessage({ display: true, color: 'lightcoral', text: 'Server Error' })
          console.log(error)
        })
      }
    })
    .catch(err => {
      console.log(err)
      setMessage({ display: true, color: 'lightcoral', text: 'Server Error' })
    })
  }

  return (
    <form id="new-question-form" className="new-question-page">
      <h2> Questions Title* </h2>
      <p><i>Limit title to 100 characters or less</i></p>
      <input
        type="text"
        id="newQuestionTitle"
        name="title"
        maxLength="100"
        onChange={handleChange}
      />
      {questionTitleError && <p className="error-message">Cannot be left empty</p>}

      <h2> Questions Text* </h2>
      <p><em>Add details</em></p>
      <textarea
        rows="10"
        cols="50"
        id="newQuestionText"
        name="text"
        onChange={handleChange}>
      </textarea>
      {questionTextError && <p className="error-message">Cannot be left empty</p>}
      {questionHyperlinkError && <p className="error-message">Hyperlink not formatted correctly</p>}
      {questionHTTPError && <p className="error-message">URL does not start with &apos;http://&apos; or &apos;https://&apos;</p>}
      {questionEmptyLinkError && <p className="error-message">URL cannot be empty</p>}

      <h2> Tags* </h2>
      <p><em>Add keywords separated by whitespace</em></p>
      <input
        type="text"
        id="newQuestionTag"
        name="tags"
        onChange={handleChange}
      />
      {questionTagsError && <p className="error-message">Must use at least one tag</p>}
      {questionTagsNumberError && <p className="error-message">Up to 5 tags allowed</p>}
      {questionTagsLengthError && <p className="error-message">Tags must be 10 characters or less</p>}

      <div id="post-question">
        <a href="#section-top">
          <button id="postQuestionButton" onClick={addQuestion}>Post Question</button>
        </a>
        <p>*indicates mandatory fields</p>
      </div>
    </form>
  )
}
