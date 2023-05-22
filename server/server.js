// Application server

const express = require('express')
const session = require("express-session")
const MongoDBSession = require('connect-mongodb-session')(session)
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')
const mongoDB = 'mongodb://127.0.0.1:27017/fake_so'
const port = 8000

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

const store = new MongoDBSession({
  uri: mongoDB,
  collection: 'sessions'
})

const app = express()
app.use(express.json())
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
  credentials: true,
}))
app.use(
  session({
    name: 'session_name',
    secret: "supersecret difficult to guess string",
    cookie: {},
    resave: false,
    saveUninitialized: false,
    store: store
  })
)

const Answer = require('./models/answers')
const Comment = require('./models/comments')
const Question = require('./models/questions')
const Tag = require('./models/tags')
const User = require('./models/users')


// ***=== GET Requests ===***
// '/posts/newest'                    (done)
// '/posts/active'
// '/posts/unanswered'
// '/posts/question/:questionID'      (done)
// '/posts/answer/:answerID'          (done)
// '/posts/tag/:tagID'                (done)
// '/posts/comment/:commentID         (done)
// '/users/find/:userID               (done)
// '/users/all-users/'                (done)
// '/posts/all-tags/'

// '/posts/search-tag/:tags'          
// '/posts/search-text/:text'
// '/posts/search/:tags/:text'
// '/posts/count-questions/:tagID
// '/posts/search-user-questions/:userID'   (done)
// '/posts/search-user-answers/:userID'     (done)
// '/posts/search-user-tags/:userID'        (done)

// '/users/isAuth'                          (done)
// '/login/profile/:userID                  (done)

// ***=== POST Requests ===***
// '/posts/new-question/'
// '/posts/new-answer/'
// '/posts/new-comment/'                        (done)
// '/posts/update-view/:quesetionID'            (done)
// '/posts/update-votes/:questionID'            (done)
// '/posts/update-vote/question/:questionID'    (done)
// '/posts/update-vote/answer/:answerID'        (done)
// '/posts/update-vote/comment/:commentID'      (done)

// '/user/delete/:userID'             (done)
// '/posts/delete/tag/:tagID'

// '/users/login'                     (done)
// '/users/logout'                    (done)
// '/users/register'                  (bug)
// ...


// Request all question documents (sorted in newest)
app.get('/posts/newest', (req, res) => {
  Question.find().sort({ ask_date_time: 'asc' })
    .then(questions => res.send(questions))
    .catch(err => res.send(err))
})

function getMostRecentAnswer(question) {
  const answerPromise = new Promise((resolve, reject) => {
    const answerIDs = question.answers
    const answerDocs = []
    const promises = answerIDs.map(answerID => {
      Answer.findById(answerID)
        .then((answerDoc) => answerDocs.push(answerDoc))
        .catch((answerErr) => reject(answerErr))
    })

    Promise.all(promises)
      .then(() => {
        resolve(answerDocs.reduce((answer1, answer2) => {
          answer1.ask_date_time >= answer2.ask_date_time ? answer1 : answer2
        }, new Date(0)))
      })
  })
  return answerPromise
}

// Returns all question documents (sorted in most recent answer)
app.get('/posts/active', (req, res) => {
  Question.find()
    .then((questions) => {
      questions.sort((question1, question2) => {
        const answer1 = getMostRecentAnswer(question1)
          .then((ans) => ans)
          .catch((err) => console.log(err))
        const answer2 = getMostRecentAnswer(question2)
          .then((ans) => ans)
          .catch((err) => console.log(err))
        let answers = [answer1, answer2]

        Promise.all(answers)
          .then(() => answer1.ask_date_time - answer2.ask_date_time)
      })
      res.send(questions)
    })
    .catch((err) => res.send(err))
})

// Request all question documents that haven't been answered
app.get('/posts/unanswered', (req, res) => {
  Question.find({ answers: null }).sort({ ask_date_time: 'asc' })
    .then((response) => res.send(response))
    .catch((err) => res.send(err))
})

// Request question document by ID
app.get('/posts/question/:questionID', (req, res) => {
  const id = req.params.questionID
  Question.findById(id)
    .then(question => res.send(question))
    .catch(err => res.send(err))
})

// Request answer document by ID
app.get('/posts/answer/:answerID', (req, res) => {
  const id = req.params.answerID
  Answer.findById(id)
    .then(answer => res.send(answer))
    .catch(err => res.send(err))
})

app.get('/posts/tag/:tagID', (req, res) => {
  const id = req.params.tagID
  Tag.findById(id)
    .then(tag => res.send(tag))
    .catch(err => res.send(err))
})

app.get('/posts/comment/:commentID', (req, res) => {
  const id = req.params.commentID
  Comment.findById(id)
    .then(comment => res.send(comment))
    .catch(err => res.send(err))
})

app.get('/users/find/:userID', (req, res) => {
  const id = req.params.userID
  User.findById(id)
    .then(user => res.send({
      userID: user._id,
      username: user.username,
      reputation: user.reputation,
      member_since: user.member_since,
      admin: user.admin
    }))
    .catch(err => res.send(err))
})

app.get('/users/all-users/', (req, res) => {
  User.find().sort({ username: 'asc' })
    .then(users => {
      let filteredUsers = users.map(user => {
        return ({
          userID: user._id,
          username: user.username,
          reputation: user.reputation,
          member_since: user.member_since,
          admin: user.admin
        })
      })
      res.send(filteredUsers)
    })
    .catch(err => res.send(err))
})

// Request all tag documents
app.get('/posts/all-tags', (req, res) => {
  Tag.find().sort({ name: 'asc' })
    .then((response) => res.send(response))
    .catch((err) => res.send(err))
})

/**
 * Retrives the REGEX expression for a string
 * @param {String} text a string
 * @returns a REGEX expression as a String
 */
function getRegex(text) {
  let regex = '.*'
  for (const i in text) {
    const char = text[i]
    if (char === '.' || char === '+' || char === '*' ||
      char === '?' || char === '^' || char === '$' ||
      char === '(' || char === ')' || char === '[' ||
      char === ']' || char === '{' || char === '}' ||
      char === '|' || char === '\\') { regex += '\\' + char } else regex += char
  }
  return regex + '.*'
}

/**
 * Creates a filter that searches for specific text in a question's title or text body
 * @param {String} text
 * @returns A filter as a JSON
 */
function textFilter(text) {
  let terms = text.split(",")
  let regexs = terms.map(term => getRegex(term))
  let filter = [];
  regexs.forEach(regex => {
    filter.push(({ title: { $regex: regex, $options: 'i' } }))
    filter.push(({ text: { $regex: regex, $options: 'i' } }))
  })
  return filter
}

/**
 * Creates an 'OR' filter that searches for tags and previously passed conditions
 * @param {String} tags a string of search tags, seperated by ','
 * @param {JSON} filter a JSON filter that can have predetermined conditions
 * @returns Promise Object that holds a Query
 */
function tagsAndFilterQuery(tags, filter) {
  let query = new Promise((resolve, reject) => {
    let terms = tags.split(',')
    let tagDocs = [];
    let promises = terms.map((tagName) => {
      return (
        Tag.findOne({ name: tagName })
          .then((tagDoc) => {
            if (tagDoc !== null) tagDocs.push(tagDoc)
          })
          .catch((err) => reject(err))
      )
    });

    Promise.all(promises)
      .then(() => {
        if (tagDocs.length == 0) resolve([])
        else {
          tagDocs.map((tag) => filter.push(({ tags: tag._id })))
          resolve(Question.find().or(filter)
            .sort({ ask_date_time: 'asc' }))
        }
      })
  })
  return query
}

// Request all question documents that have some specific
// text in a question's title or text body
app.get('/posts/search-text/:text', (req, res) => {
  const text = req.params.text
  const filter = textFilter(text)

  Question.find().or(filter)
    .sort({ ask_date_time: 'asc' })
    .then((response) => res.send(response))
    .catch((err) => res.send(err))
})

// Request all question documents that have specific tags
// associated with them
app.get('/posts/search-tag/:tags', (req, res) => {
  const tags = req.params.tags

  tagsAndFilterQuery(tags, [])
    .then((response) => res.send(response))
    .catch((err) => res.send(err))
})

// Request all question documents that have specific tags
// associated with them or some specific text 
// in their title or text body 
app.get('/posts/search/:tags/:text', (req, res) => {
  let text = req.params.text
  let tags = req.params.tags
  let filter = textFilter(text);

  tagsAndFilterQuery(tags, filter)
    .then((response) => res.send(response))
    .catch((err) => res.send(err))
})


app.get('/posts/search-user-questions/:userID', async (req, res) => {
  const id = req.params.userID

  try {
    let user = await User.findById(id)
    if (user === null) throw new Error("User not found")

    let questions = await Question.find({ asked_by: user._id })
    res.send(questions)
  } catch (err) { res.send(err) }
})

async function getQuestionAnswer(answers) {
  let documents = []
  let promises = answers.map(answer => {
    return Question.find({ answers: answer._id })
      .then(question => {
        if (question === [] || question[0] === null) throw new Error("Question not found")
        let document = { question_title: question[0].title, answer: answer }
        documents.push(document)
      })
      .catch(err => console.log(err))
  })
  return Promise.all(promises).then(() => documents)
}

app.get('/posts/search-user-answers/:userID', async (req, res) => {
  const id = req.params.userID

  try {
    let user = await User.findById(id)
    if (user === null) throw new Error("User not found")

    let answers = await Answer.find({ ans_by: user._id })
    let documents = await getQuestionAnswer(answers)
    if (documents === null || documents === []) throw new Error("Questions not found")
    res.send(documents)
  } catch (err) { res.send(err) }
})


app.get('/posts/search-user-tags/:userID', async (req, res) => {
  const id = req.params.userID

  try {
    let user = await User.findById(id)
    if (user === null) throw new Error("User not found")
    let tags = await Tag.find({ tagged_by: user._id }).sort({ name: 'asc' })
    res.send(tags)
  } catch (err) { res.send(err) }
})

app.get('/posts/count-questions/:tagID', (req, res) => {
  let tagID = req.params.tagID
  Question.countDocuments({ tags: tagID })
    .then((response) => res.send({ count: response }))
    .catch((err) => res.send(err))
})


app.get('/isAuth', (req, res) => {
  //console.log("\nAUTHENTICATE: " + req.session.user)
  if (req.session.userID) {
    User.findById(req.session.userID)
      .then(user => res.send({
        login: true,
        user: {
          userID: user._id,
          username: user.username,
          admin: user.admin
        }
      }))
      .catch(err => res.send(err))
  } else res.send({ logn: false, user: {} })
})

app.get('/login/profile/:userID', (req, res) => {
  let id = req.params.userID
  User.findById(id)
    .then(user => res.send({
      userID: user._id,
      username: user.username,
      reputation: user.reputation,
      member_since: user.member_since,
      admin: user.admin
    }))
    .catch(err => res.send(err))
})

app.post('/posts/new-question', (req, res) => {
  let title = req.body.title.trim()
  let text = req.body.text.trim()
  let tags = req.body.tags.trim().split(/\s+/)
  console.log(tags)

  let tagIDs = []
    let promises = tags.map((tagName) => {
      console.log(tagName)
      if (tagName !== '') return Tag.findOne({ name: tagName })
        .then((tagObj) => {
          if (tagObj === null) {
            tagCreate(tagName, req.session.userID).then((tag) => tag)._id
              .then(tagIDs.push(tag))
              .catch(tagError => console.log(tagError))
          } else tagIDs.push(tagObj._id)
        })
        .catch((tagErr) => console.log(tagErr))
    })

  Promise.all(promises).then(() => {
    questionCreate(title, text, tagIDs, req.session.userID)
      .then((response) => res.send(response))
      .catch((quesErr) => console.log(quesErr))
  })
})

function questionCreate(title, text, tags, asked_by) {
  details = {
    title: title,
    text: text,
    tags: tags,
    asked_by: asked_by,
  }

  const question = new Question(details)
  return question.save()
}

function tagCreate(name, author) {
  const details = {
    name: name,
    tagged_by: author,
  }

  const tag = new Tag(details)
  return tag.save()
}


app.post('/posts/new-answer', (req, res) => {
  text = req.body.text
  questionID = req.body.question_id
  let answers = []

  Question.findById(questionID)
    .then((response) => {
      console.log(response.answers)
      answers = response.answers

      answerCreate(text, req.session.userID)
        .then(newAnswer => {
          answers.push(newAnswer)
          Question.findByIdAndUpdate(questionID, { answers: answers })
            .then(update => res.send(update))
            .catch(updateError => res.send(updateError))
        })
        .catch(ansErr => console.log(ansErr))
    })
    .catch((err) => res.send(err))
})

function answerCreate(text, ans_by) {
  details = {
    text: text,
    ans_by: ans_by,
  }

  const ans = new Answer(details)
  return ans.save()
}

app.post('/posts/new-comment', async (req, res) => {
  const { text, documentID, documentType } = req.body
  let document

  if (documentType === 'question') document = await Question.findById(documentID)
  else if (documentType === 'answer') document = await Answer.findById(documentID)
  if (document === null) {
    console.log("COMMENT ERROR: document not found")
    res.send({ creation: false })
  }

  let comment = new Comment({
    text,
    com_by: req.session.userID
  })
  let addedComment = await comment.save()
  let commentList = document.comments
  commentList.push(addedComment)

  if (documentType === "question")
    document = await Question.findByIdAndUpdate(documentID, { comments: commentList }, { returnDocument: 'after' })
  else document = await Answer.findByIdAndUpdate(documentID, { comments: commentList }, { returnDocument: 'after' })
  res.send({ creation: true, comments: document.comments })
})


app.post('/posts/update-view/:questionID', (req, res) => {
  let questionID = req.params.questionID
  let views = req.body
  Question.findByIdAndUpdate(questionID, views)
    .then((response) => res.send(response))
    .catch((err) => res.send(err))
})

app.post('/posts/update-vote/question/:questionID', (req, res) => {
  let questionID = req.params.questionID
  let { votes, userID, reputation } = req.body
  Question.findByIdAndUpdate(questionID, { votes: votes })
    .then(response => {
      res.json(response)
      User.findByIdAndUpdate(userID, { reputation: reputation })
        .then(() => res.send())
        .catch(err => send(err))
    })
    .catch(err => res.send(err))
})

app.post('/posts/update-vote/answer/:answerID', (req, res) => {
  let answerID = req.params.answerID
  let { votes, userID, reputation } = req.body
  Answer.findByIdAndUpdate(answerID, { votes: votes })
    .then(response => {
      res.json(response)
      User.findByIdAndUpdate(userID, { reputation: reputation })
        .then(() => res.send())
        .catch(err => send(err))
    })
    .catch(err => res.send(err))
})

app.post('/posts/update-vote/comment/:commentID', (req, res) => {
  let commentID = req.params.commentID
  let votes = req.body
  console.log(commentID)
  console.log(votes)
  Comment.findByIdAndUpdate(commentID, votes)
    .then(response => res.send(response))
    .catch(err => res.send(err))
})


app.post('/user/delete/:userID', async (req, res) => {
  let userID = req.params.userID

  try {  // For each quesiton the user posted
    //User.findByIdAndDelete(userID)

    let questions = await Question.find({ asked_by: userID })
    questions.forEach(question => {
      let answerIDs = question.answers
      let commentIDs = question.comments

      // Delete question comments
      commentIDs.forEach(commentID => Comment.findByIdAndRemove(commentID).exec())

      // Delete question answers w/ their own comments
      answerIDs.forEach(answerID => {
        Answer.findByIdAndRemove(answerID).exec()
          .then(answer => {
            answer.comments.forEach(commentID => Comment.findByIdAndRemove(commentID).exec())
          })
      })
      // And finally, delete each question
      Question.findByIdAndRemove(question._id).exec()
    })

    // Delete all answers & comments associated with the user
    let answers = await Answer.find({ ans_by: userID })
    answers.forEach(answer => {
      Question.find({ answers: answer._id })
        .then(question => {
          let newAnswers = question.answers.map(answerID => {
            if (answerID !== answer._id) return answerID
          })
          Question.findByIdAndUpdate(question._id, { answers: newAnswers }).exec()
          Answer.findByIdAndRemove(answer._id).exec()
        })
    })

    let comments = await Comment.find({ com_by: userID })
    comments.forEach(comment => {
      Question.find({ comments: comment._id })
        .then(question => {
          if (question !== null) {
            let newComments = question.comments.map(commentID => {
              if (commentID !== comment._id) return commentID
            })
            Question.findByIdAndUpdate(question._id, { comments: newComments }).exec()

          } else {
            Answer.find({ commnets: comment._id })
              .then(answer => {
                let newComments = answer.comments.map(commentID => {
                  if (commentID !== comment._id) return commentID
                })
                Question.findByIdAndUpdate(answer._id, { comments: newComments }).exec()
              })
          }
        })
      Comment.findByIdAndRemove(comment._id).exec()
    })
    User.findByIdAndRemove(userID).exec()
    res.send({ deletion: true })

  } catch (err) {
    console.log(err)
    res.send(err)
  }
})


// Source: https://stackoverflow.com/questions/64627649/express-session-is-not-setting-cookies-in-browser
// Logins user into the system, sends a boolean response
app.post('/login', async (req, res) => {
  console.log("\nLOGIN ATTEMPT")
  let checkEmail = req.body.email.trim()
  let checkPassword = req.body.password.trim()
  const user = await User.findOne({ email: checkEmail })

  if (user === null) res.send({ found: false, login: false })
  else {
    let hashPassword = user.password
    const isMatch = await bcrypt.compare(checkPassword, hashPassword)
    if (isMatch) {
      req.session.userID = user._id
      res.json({
        found: true,
        login: true,
        user: {
          userID: user._id,
          username: user.username,
          admin: user.admin
        }
      })
      res.send(req.session.sessionID)
      console.log(true)
    }
    else res.send({ found: true, login: false })
  }
})

app.post('/logout', (req, res) => {
  console.log("\nDESTROY SESSION")
  if (req.session.userID) req.session.destroy(() => {
    console.log(true)
    res.send()
  });
})

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body

  let user = await User.findOne({ email });
  if (user) {
    res.send({ unique_email: false })
    return
  }

  const hashedPassword = await bcrypt.hash(password, bcrypt.genSaltSync())
  user = new User({
    username,
    email,
    password: hashedPassword,
  })

  await user.save();
  console.log("NEW USER")
  res.send({ unique_email: true })
})

const server = app.listen(port, () => {
  console.log(`app listening on port ${port}\n`)
})

process.on('SIGINT', () => {
  if (db) {
    db.close()
      .then(() => {
        server.close(() => console.log("Server closed. Database instance disconnected"))
      })
      .catch((err) => console.log(err))
  }
})
