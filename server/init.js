// Setup database with initial test data.
// Include an admin user.
// Pass URL for mongoDB instance, admin username, and admin password as arguments
// mongodb://127.0.0.1:27017/fake_so admin secretPass

let userArgs = process.argv.slice(2);

if (userArgs.length !== 3) {
  console.log('ERROR: Incorrect number of arguments')
  return
}

if (!userArgs[0].startsWith('mongodb')) {
  console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
  return
}

const mongoose = require('mongoose')
const bycript = require('bcrypt')

let mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


let adminName = userArgs[1]
let adminPass = userArgs[2]

let Answer = require('./models/answers')
let Comments = require('./models/comments')
let Question = require('./models/questions')
let Tag = require('./models/tags')
let User = require('./models/users')


/**
 * Creates a Tag document in the database
 * @param {String} name name of tag
 * @returns the Tag document saved to the database
 */
function tagCreate(name, user) {
  let tag = new Tag({
      name: name,
      tagged_by: user
    }
  )
  return tag.save()
}

/**
 * Creates a User document in the database 
 * @param {String} username username of user
 * @param {String} email email of user
 * @param {String} password unhashed password of user
 * @param {Number} reputation reputation of user
 * @param {Date} member_since Date when user joined
 * @returns the User document saved to the database
 */
function userCreate(username, email, password, reputation, member_since, admin) {
  userDetail = {
    username: username,
    email: email,
    admin: admin
  }
  userDetail.password = bycript.hashSync(password, bycript.genSaltSync())
  if (reputation != false) userDetail.reputation = reputation
  if (member_since != false) userDetail.member_since = member_since

  let user = new User(userDetail)
  return user.save()
}

/**
 * Creates a Comment document in the database
 * @param {String} text the text of a comment
 * @param {User} com_by the User who made the comment
 * @param {Date} com_date_time the Date the comment was posted
 * @param {Number} votes the votes a comment has
 * @returns the Comment document saved to the database
 */
function commentCreate(text, com_by, com_date_time, votes) {
  commentDetail = {
    text: text,
    com_by: com_by
  }
  if (com_date_time != false) commentDetail.com_date_time = com_date_time
  if (votes != false) commentDetail.votes = votes

  let comment = new Comment(commentDetail)
  return comment.save()
}

/**
 * Creates an Answer document in database
 * @param {String} text text in an asnwer
 * @param {[Comment]} comments a list of Comments that belong to an asnwer
 * @param {User} ans_by a User who wrote the asnwer
 * @param {Date} ans_date_time the Date the answer was posted
 * @param {Number} votes the votes an answer has
 * @returns the Answer document saved to the database
 */
function answerCreate(text, comments, ans_by, ans_date_time, votes) {
  answerDetail = {
    text: text,
    ans_by: ans_by
  }
  if (comments != false) answerDetail.comments = comments
  if (ans_date_time != false) answerDetail.ans_date_time = ans_date_time
  if (votes != false) answerDetail.votes = votes

  let answer = new Answer(answerDetail)
  return answer.save()
}

/**
 * Creates a Question document in database
 * @param {String} title the title of the question
 * @param {String} text the text of the question
 * @param {[Tag]} tags a list of Tags associated with the question
 * @param {[Answer]} answers a list of Answers associated with the question
 * @param {[Comment]} comments a list of Comments associated with the question
 * @param {User} asked_by the User who asked the question
 * @param {Date} ask_date_time the Date the question was posted
 * @param {Number} views the number of views the question has
 * @param {Number} votes the number of votes the question has
 * @returns the Question document saved to the database
 */
function questionCreate(title, text, tags, answers, comments, asked_by, ask_date_time, views, votes) {
  qstnDetail = {
    title: title,
    text: text,
    tags: tags,
    asked_by: asked_by
  }
  if (answers != false) qstnDetail.answers = answers
  if (comments != false) qstnDetail.comments = comments
  if (ask_date_time != false) qstnDetail.ask_date_time = ask_date_time
  if (views != false) qstnDetail.views = views
  if (votes != false) qstnDetail.votes = votes

  let qstn = new Question(qstnDetail)
  return qstn.save()
}

const populate = async () => {
  let admin = await userCreate("admin", adminName, adminPass, 500, false, true)
  let u1 = await userCreate('Joji John', "email1", 'password1', false, false, false)
  let u2 = await userCreate('saltyPeter', 'email2', 'password2', false, false, false)
  let u3 = await userCreate('hamkalo', 'email3', 'password3', false, false, false)
  let u4 = await userCreate('azad', 'email4', 'password4', false, false, false)
  let u5 = await userCreate('abaya', 'email5', 'password5', false, false, false)
  let u6 = await userCreate('alia', 'email6', 'password6', false, false, false)
  let u7 = await userCreate('sana', 'email7', 'password7', false, false, false)
  //console.log("Users done")

  let t1 = await tagCreate('react', admin);
  let t2 = await tagCreate('javascript', admin);
  let t3 = await tagCreate('android-studio', admin);
  let t4 = await tagCreate('shared-preferences', admin);
  //console.log("Tags done")

  let a1 = await answerCreate('React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.', false, u3, false, false);
  let a2 = await answerCreate('On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.', false, u4, false, false);
  let a3 = await answerCreate('Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.', false, u5, false, false);
  let a4 = await answerCreate('YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);', false, u6, false, false);
  let a5 = await answerCreate('I just found all the above examples just too confusing, so I wrote my own. ', false, u7, false, false);
  //console.log("Answers Done")

  await questionCreate('Programmatically navigate using React router', 'the alert shows the proper index for the li clicked, and when I alert the variable within the last function I\'m calling, moveToNextImage(stepClicked), the same value shows but the animation isn\'t happening. This works many other ways, but I\'m trying to pass the index value of the list item clicked to use for the math to calculate.', [t1, t2], [a1, a2], false, u1, false, false, false);
  await questionCreate('android studio save string shared preference, start activity and load the saved string', 'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.', [t3, t4, t2], [a3, a4, a5], false, u2, false, 121, false);

  if (db) db.close()
  console.log("done")
}


populate()
  .catch((err) => {
    console.log("ERROR: " + err)
    if (db) db.close()
  })

console.log('processing ...');
