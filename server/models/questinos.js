// Question Document Schema

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const QuestionSchema = new Schema({
  title: {type: String, maxLength: 100, required: true},
  text: {type: String, required: true},

  tags: {
    type: [{type: Schema.Types.ObjectID, ref: "tagSchema"}],
    validate: arr => Array.isArray(arr) && arr.length > 0
  },

  answers: [{type: Schema.Types.ObjectID, ref: "answerSchema"}],
  comments: [{type: Schema.Types.ObjectID, ref: "commentSchema"}],

  asked_by: {type: Schema.Types.ObjectID, ref: "userSchema", required: true},

  ask_date_time:{type: Date, default: new Date(Date.now())},
  views: {type: Number, default: 0},
  votes: {type: Number, default: 0}
});


module.exports = mongoose.model('Question', QuestionSchema)