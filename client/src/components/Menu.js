import React from 'react'

export default function Menu (props) {
  function handleQuestionButton () {
    props.setMessage({display: false, color: '', text: ''})
    props.setMenuColors([1, 0])
    props.setQuestionsBanner(['All Questions', [1,0,0]])
    props.setServerRequest('/posts/newest')
    props.setPage('AllQuestionsPage')
  }

  function handleTagsButton () {
    props.setMessage({display: false, color: '', text: ''})
    props.setMenuColors([0, 1])
    props.setServerRequest('/posts/all-tags')
    props.setPage('AllTagsPage')
  }

  return (
    <div className="menu">
        <a id="questions-tab"
            style={{ backgroundColor: props.menuColors[0] ? 'lightgrey' : 'inherit' }}
            href="#section-top"
            onClick={handleQuestionButton} 
            >
          Questions
        </a>
        <a id="tags-tab"
            style={{ backgroundColor: props.menuColors[1] ? 'lightgrey' : 'inherit' }}
            href="#section-top"
            onClick={handleTagsButton}
            >
          Tags
        </a>
    </div>
  )
}