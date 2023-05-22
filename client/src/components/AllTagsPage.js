import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})

export default function AllTagsPage(props) {
  const [tagCount, setTagCount] = React.useState(0)

  server.get(props.serverRequest)
    .then(response => {
      if (response.data.name === 'CastError') { throw new Error('Invalid Parameter') }
      makeTagBoxes(response.data)
    })
    .catch(async err => {
      console.log(err)
      await new Promise(r => setTimeout(r, 2000));
      props.setMessage({ display: true, color: "lightcoral", text: "Cannot connect to server. Trying connection every 2 secconds" })
    })

  function makeTagBoxes(tags) {
    setTagCount(tags.length)
    const tagBoxes = tags.map(tag => {
      return <TagBox key={tag._id} tag={tag} />
    })
    ReactDOM.render(tagBoxes, document.querySelector('#tagBoxes'))
  }

  function TagBox(props) {
    return (
      <div className="tagBox">
        <a href="section-top"
          onClick={handleTagBoxClick}>
          {props.tag.name}
        </a>
        {getTagBoxNumber(props.tag)}
        <p className={`tagCount${props.tag._id}`}></p>
      </div>
    )
  }

  function getTagBoxNumber(tag) {
    const count = 0
    server.get(`/posts/count-questions/${tag._id}`)
      .then(response => {
        if (response.data.name === 'CastError') { throw new Error('Invalid Parameter') }
        fillTagBoxNumber(response.data.count, tag._id)
      })
      .catch(async err => {
        console.log(err)
        await new Promise(r => setTimeout(r, 2000));
        props.setMessage({ display: true, color: "lightcoral", text: "Cannot connect to server. Trying connection every 2 secconds" })
      })
  }

  function fillTagBoxNumber(count, id) {
    const plurality = count == 1 ? 'question' : 'questions'
    ReactDOM.render(`${count} ${plurality}`, document.querySelector(`.tagCount${id}`))
  }

  function handleAskQuestionButton() {
    props.setPage('NewQuestionPage')
    props.setMenuColors([0, 0])
  }

  function handleTagBoxClick(event) {
    event.preventDefault()
    const tag = event.target.textContent
    props.setServerRequest(`posts/search-tag/${tag}`)
    props.setQuestionsBanner([tag, [0, 0, 0]])
    props.setMenuColors([1, 0])
    props.setPage('AllQuestionsPage')
  }

  return (
    <div className="all-tags-page">
      <div className="tag-header">
        <div id="numTags">
          {tagCount} tags
        </div>
        <div id="tagTitle">All Tags</div>
        <a href="#section-top">
          <button id="tagsPageButton"
            className="ask-question"
            onClick={handleAskQuestionButton}>
            Ask Question</button>
        </a>
      </div>

      <div id="tagBoxes">
      </div>

    </div>
  )
}