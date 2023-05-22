import React, { useState } from 'react'
import Banner from './Banner.js'
import Menu from './Menu.js'
import MainSection from './MainSection.js'
import axios from 'axios'

const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})


export default function FakeStackOverflow() {
  const [page, setPage] = useState('AllQuestionsPage')
  const [serverRequest, setServerRequest] = useState('/posts/newest')
  const [login, setLogin] = useState({login: null, user: {}})
  const [menuColors, setMenuColors] = useState([1, 0])
  const [questionsBanner, setQuestionsBanner] = useState(['All Questions', [1, 0, 0]])
  const [message, setMessage] = useState({display: false, color: 'inherit', text: ''})


  function isAuth() {
    console.log("AUTHENTICATE")
    if (login.login === null) {
      server.get('/isAuth', { withCredentials: true })
        .then((response) => setLogin(response.data))
        .catch(async err => {
          console.log(err)
          await new Promise(r => setTimeout(r, 2000));
          setMessage({display: true, color: "lightcoral", text: "Cannot Connect to Server. Trying Connection every 2 secconds"})
        })
    }
  }
  isAuth()

  return (
    <>
      <Banner
        setPage={setPage}
        setServerRequest={setServerRequest}
        login={login}
        setLogin={setLogin}
        setMenuColors={setMenuColors}
        setQuestionsBanner={setQuestionsBanner}
        setMessage={setMessage}
      />
      <section className="main-body">
        <Menu
          setPage={setPage}
          setServerRequest={setServerRequest}
          menuColors={menuColors}
          setMenuColors={setMenuColors}
          setQuestionsBanner={setQuestionsBanner}
          setMessage={setMessage}
        />
        <MainSection
          page={page}
          setPage={setPage}
          serverRequest={serverRequest}
          setServerRequest={setServerRequest}
          login={login}
          setLogin={setLogin}
          setMenuColors={setMenuColors}
          questionsBanner={questionsBanner}
          setQuestionsBanner={setQuestionsBanner}
          message={message}
          setMessage={setMessage}
        />
      </section>
    </>
  );
}