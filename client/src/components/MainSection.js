import React from 'react'
import AllQuestionsPage from './AllQuestionsPage.js'
import AllTagsPage from './AllTagsPage.js'
import LoginPage from './LoginPage.js'
import RegisterPage from './RegisterPage.js'
import QuestionPage from './Question.js'
import NewQuestionPage from './NewQuestionPage.js'
import NewAnswerPage from './NewAnswerPage.js'
import ProfilePage from './ProfilePage.js'

export default function MainSection(props) {
  const [question, setQuestion] = React.useState(null)

  function currentPage(page) {
    switch (page) {
      case 'AllQuestionsPage':
        return <AllQuestionsPage
          setPage={props.setPage}
          serverRequest={props.serverRequest}
          setServerRequest={props.setServerRequest}
          login={props.login}
          setMenuColors={props.setMenuColors}
          questionsBanner={props.questionsBanner}
          setQuestionsBanner={props.setQuestionsBanner}
          setMessage={props.setMessage}
          setQuestion={setQuestion}
        />

      case 'QuestionPage':
        return <QuestionPage
          setPage={props.setPage}
          serverRequest={props.serverRequest}
          setServerRequest={props.setServerRequest}
          login={props.login}
          setMessage={props.setMessage}
        />

      case 'AllTagsPage':
        return <AllTagsPage
          setPage={props.setPage}
          setMenuColors={props.setMenuColors}
          setTitle={props.setTitle}
          serverRequest={props.serverRequest}
          setServerRequest={props.setServerRequest}
          setMessage={props.setMessage}
          setQuestionsBanner={props.setQuestionsBanner}
        />

      case 'LoginPage':
        return <LoginPage
          setPage={props.setPage}
          setServerRequest={props.setServerRequest}
          setLogin={props.setLogin}
          setMessage={props.setMessage}
        />

      case 'RegisterPage':
        return <RegisterPage
          setPage={props.setPage}
          setMessage={props.setMessage}
        />

      case 'ProfilePage':
        return <ProfilePage
          setPage={props.setPage}
          serverRequest={props.serverRequest}
          setServerRequest={props.setServerRequest}
          login={props.login}
          setMessage={props.setMessage}
        />

      case 'NewQuestionPage':
        return <NewQuestionPage
          setPage={props.setPage}
          setServerRequest={props.setServerRequest}
          setMenuColors={props.setMenuColors}
          setMessage={props.setMessage}
          login={props.login}
        />
      case 'NewAnswerPage':
        return <NewAnswerPage
          setPage={props.setPage}
          setServerRequest={props.setServerRequest}
          question={question}
        />

      default:
        return <AllQuestionsPage
          setPage={props.setPage}
          serverRequest={props.serverRequest}
          setServerRequest={props.setServerRequest}
          login={props.login}
          setMenuColors={props.setMenuColors}
          questionsBanner={props.questionsBanner}
          setQuestionsBanner={props.setQuestionsBanner}
          setMessage={props.setMessage}
        />
    }
  }

  return (
    <div className='main-section'>
      {props.message.display &&
        <div id="message-display" style={{ backgroundColor: props.message.color }}>{props.message.text}</div>
      }
      {currentPage(props.page)}
    </div>
  )
}
