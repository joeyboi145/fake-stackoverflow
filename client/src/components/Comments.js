import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

const regex = /\[[^\]]+?\]\([^)]+?\)/g
const containsText = /.*\S.*/
const server = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000
})

export default function Comments({ documentID, documentType, login, setMessage, setServerRequest, setPage }) {
  const [commentReputationError, setCommentReputationError] = useState(false)
  const [commentLengthError, setCommentLengthError] = useState(false)
  const [render, setRender] = useState({ comment_set: 1, comment_count: null })
  const comment_display = 3
  let comments = []

  server.get(`/posts/${documentType}/${documentID}`)
    .then(response => {
      if (response.data.name === 'CastError') throw new Error('Invalid Parameter')
      let commentIDs = response.data.comments
      if (render.comment_count !== commentIDs.length) setRender({ comment_set: 1, comment_count: commentIDs.length })
      getComments(commentIDs)
    })
    .catch(async err => {
      console.log(err)
      await new Promise(r => setTimeout(r, 2000));
      setMessage({display: true, color: "lightcoral", text: "Cannot connect to server. Trying connection every 2 secconds"})
    })


  function getComments(commentIDs) {
    const promises = commentIDs.map(id => {
      return (
        server.get(`/posts/comment/${id}`)
          .then(response => {
            if (response.data.name === 'CastError') throw new Error('Invalid Parameter')
            else comments.push(response.data)
          })
          .catch(err => console.log(err)))
    })
    Promise.all(promises).then(() => fillComments())
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

  async function fillComments() {
    comments.sort((com1, com2) => {
      if (com1.com_date_time < com2.com_date_time) return 1
      else if (com1.com_date_time > com2.com_date_time) return -1
      else {
        if (com1.text < com2.text) return 1
        else if (com1.text > com2.text) return -1
        else return 0
      }
    })

    let tabledComments = []
    for (var i = (render.comment_set - 1) * comment_display;
      i < (render.comment_set) * comment_display && i < render.comment_count;
      i++) {
      let comment = comments[i]
      let { userID, username } = await getCommentUser(comment.com_by)
      tabledComments.push(
        <tr>
          <td className='comment' key={comment._id}>
            {retrieveText(comment)}
            <p> - </p>
            <p onClick={() => handleAuthorClick(userID)}
              className='comment-author'>
              {username}
            </p>
            <p className='comment-votes'> {`Votes: ${comment.votes}`} </p>
          </td>
          {login.login &&
            <td>
              <button
                className='comment-upvote'
                onClick={() => handleUpvote(comment._id, comment.votes)}>
                <i>Upvote</i>
              </button>
            </td>
          }
        </tr>
      )
    }
    renderComments(tabledComments)
  }

  function renderComments(tabledComments) {
    ReactDOM.render(
      <tbody key={`${documentID}-table`}>
        <tr>
          <td>
            <div className='comment-header'>
              <p><i>Comments:</i></p>
              <div className='comment-buttons'>
                <button onClick={handlePrevButton}>Prev</button>
                <p>{((render.comment_set - 1) * comment_display) + 1}-{Math.min(((render.comment_set) * comment_display), render.comment_count)}</p>
                <button onClick={handleNextButton}>Next</button>
              </div>
            </div>
            {commentReputationError && <p className='inputError'> Users must have a reputation of 50 or greater to post comments</p>}
            {commentLengthError && <p className='inputError'>Comments cannot be longer than 140 characters</p>}
          </td>
        </tr>
        {tabledComments}
        <tr>
          {login.login && <td>
            <input
              type='text'
              className='newComment'
              placeholder='Add new comment'
              onKeyUp={handleChange}
            />
          </td>}
        </tr>
      </tbody>,
      document.getElementById(`${documentID}-comment-table`)
    )
  }

  async function getCommentUser(userID) {
    try {
      const response = await server.get(`/users/find/${userID}`)
      return response.data
    } catch (err) {
      console.log(err)
      return userID
    }
  }

  function handleChange(event) {
    if (event.key !== 'Enter') return
    setCommentReputationError(false)
    setCommentLengthError(false)
    setMessage({ display: false, color: "", text: '' })

    if (!containsText.test(event.target.value))
      setMessage({ display: true, color: "lightcoral", text: `Can't post empty comment` })
    else if (login.login !== true)
      setMessage({ display: true, color: "lightcoral", text: `Can't post comment. Try logging in!` })
    else {
      server.get(`/login/profile/${login.user.userID}`, { withCredentials: true })
        .then(response => {
          if (response.data.reputation < 50) setCommentReputationError(true)
          else if (event.target.value.length > 140) setCommentLengthError(true)
          else addComment(event.target.value)
        })
        .catch(err => {
          console.log(err)
          setMessage({ display: true, color: "lightcoral", text: `Server Error` })
        })
    }
  }

  function handlePrevButton() {
    if (render.comment_set > 1)
      setRender({
        comment_set: (render.comment_set - 1),
        comment_count: render.comment_count
      })
  }

  function handleNextButton() {
    let max = Math.floor((render.comment_count - 1) / comment_display) + 1
    if (render.comment_set < max)
      setRender({
        comment_set: (render.comment_set + 1),
        comment_count: render.comment_count
      })
  }

  function handleUpvote(commentID, votes) {
    server.post(`/posts/update-vote/comment/${commentID}`, { votes: votes + 1 })
      .then(() => setMessage({ display: false, color: '', text: '' }))
      .catch(err => {
        console.log(err)
        setMessage({ display: true, color: 'lightcoral', text: 'Vote Failed. Try again.' })
      })
  }

  function handleAuthorClick(userID) {
    setMessage({ display: true, color: '', text: '' })
    setServerRequest(`/login/profile/${userID}`)
    setPage("ProfilePage")
  }

  function addComment(text) {
    const newComment = {
      text: text,
      documentID: documentID,
      documentType: documentType
    }

    server.post('/posts/new-comment', newComment, { withCredentials: true })
      .then(response => {
        if (response.data.creation) {
          setRender({ comment_set: 1, comment_count: -1 })
        }
        else setMessage({ display: true, color: "lightcoral", text: `Server Error: Comment not created` })
      })
      .catch(err => {
        console.log(err)
        setMessage({ display: true, color: "lightcoral", text: `Server Error` })
      })
  }


  return (
    <table id={`${documentID}-comment-table`} className='comment-table'>
    </table>
  )
}