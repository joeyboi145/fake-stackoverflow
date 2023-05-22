// Answer Document Schema

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AnswerSchema = new Schema({
  text: { type: String, required: true },
  comments: [{type: Schema.Types.ObjectID, ref: "commentSchema"}],

  ans_by: {type: Schema.Types.ObjectID, ref: "userSchema", required: true},
    
  ask_date_time: { type: Date, default: new Date(Date.now()) },
  votes: {type: Number, default: 0},
})

module.exports = mongoose.model('Answer', AnswerSchema)