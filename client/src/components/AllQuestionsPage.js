import React, { useState, useRef} from 'react'
import ReactDOM from 'react-dom/client'
import TabledQuestion from './TabledQuestion.js'
import axios from 'axios'

const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})

export default function AllQuestionsPage(props) {
  const [render, setRender] = useState({ question_set: 1, question_count: null })
  const questionTable = useRef(null)
  const questionCount = useRef(null)
  const question_display = 5

  server.get(props.serverRequest)
    .then((response) => {
      if (response.data.name === 'CastError') { throw new Error('Invalid Parameter') }
      let questionIDs = response.data
      if (render.question_count !== questionIDs.length) setRender({ question_set: 1, question_count: questionIDs.length })
      populateMainTable(questionIDs)
    })
    .catch(async err => {
      console.log(err)
      await new Promise(r => setTimeout(r, 2000));
      //props.setMessage({display: true, color: "lightcoral", text: "Cannot connect to server. Trying connection every 2 secconds"})
    })


  function populateMainTable(data) {
    let tabledQuestions = []
    for (var i = (render.question_set - 1) * question_display;
      i < (render.question_set) * question_display && i < render.question_count;
      i++) {
      tabledQuestions.push(
        <TabledQuestion
          key={data[i]._id}
          question={data[i]}
          setPage={props.setPage}
          setServerRequest={props.setServerRequest}
          setMenuColors={props.setMenuColors}
          setMessage={props.setMessage}
          setQuestion={props.setQuestion}
        />
      )
    }

    let displayList;
    if (tabledQuestions.length === 0) {
      displayList =
        <tbody>
          <tr>
            <td><p id="questionDisplayError">No Questions Found</p></td>
          </tr>
        </tbody>
    } else {
      displayList =
        <tbody>
          {tabledQuestions}
          <tr>
            <td id='questions-buttons'>
              <button onClick={handlePrevButton}>Prev</button>
              <p>{((render.question_set - 1) * question_display) + 1}-{Math.min(((render.question_set) * question_display), render.question_count)}</p>
              <button onClick={handleNextButton}>Next</button>
            </td>
          </tr>
        </tbody>
    }

    if (questionTable.current === null) questionTable.current = ReactDOM.createRoot(document.getElementById('questions-displaylist'))
    if (questionCount.current === null)  questionCount.current = ReactDOM.createRoot(document.getElementById('question-count')) 

    questionTable.current.render(displayList)
    questionCount.current.render(`${tabledQuestions.length} Questions`)
  }

  function handleAskQuestionButton() {
    if (!props.login.login)
      props.setMessage({
        display: true,
        color: 'lightcoral',
        text: "Cannot add new question. Try Logging In."
      })
    else {
      props.setMenuColors([0, 0])
      props.setPage("NewQuestionPage")
    }
  }

  function handleNewestButton () {
    props.setServerRequest('/posts/newest')
    props.setQuestionsBanner(['All Questions',[1, 0, 0]])
  }

  function handleActiveButton () {
    props.setServerRequest('/posts/active')
    props.setQuestionsBanner(['All Questions',[0, 1, 0]])
  }

  function handleUnansweredButton () {
    props.setServerRequest('/posts/unanswered')
    props.setQuestionsBanner(['All Questions',[0, 0, 1]])
  }

  function handlePrevButton() {
    if (render.question_set > 1)
      setRender({
        question_set: (render.question_set - 1),
        question_count: render.question_count
      })
  }

  function handleNextButton() {
    let max = Math.floor((render.question_count - 1) / question_display) + 1
    if (render.question_set < max)
      setRender({
        question_set: (render.question_set + 1),
        question_count: render.question_count
      })
  }


  function FilterButtons() {
    return (
      <div id="filters">
        <button
          id="newestButton"
          onClick={handleNewestButton}
          style={{ backgroundColor: props.questionsBanner[1][0] ? 'lightgrey' : 'inherit' }}
        >Newest</button>
        <button
          id="activeButton"
          onClick={handleActiveButton}
          style={{ backgroundColor: props.questionsBanner[1][1] ? 'lightgrey' : 'inherit' }}
        >Active</button>
        <button
          id="unansweredButton"
          onClick={handleUnansweredButton}
          style={{ backgroundColor: props.questionsBanner[1][2] ? 'lightgrey' : 'inherit' }}
        >Unanswered</button>
      </div>
    )
  }

  return (
    <div className="all-question-page">
      <div id="header" className="header">
        <div>
          <h1 id="allQuestions-title">{props.questionsBanner[0]}</h1>
          <a href="#section-top">
            <button id="allQuestionsButton"
              className="ask-question"
              onClick={handleAskQuestionButton}
            >Ask Question</button>
          </a>
        </div>
        <div>
          <p id="question-count"></p>
          <FilterButtons />
        </div>
      </div>
      <table id="questions-displaylist"></table>
    </div>
  )
}
