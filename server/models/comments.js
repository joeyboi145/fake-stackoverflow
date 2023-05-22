// Comment Document Schema

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new Schema({
  text: {type: String, required: true},

  com_by: {type: Schema.Types.ObjectID, ref: "userSchema", required: true},

  com_date_time: { type: Date, default: new Date(Date.now()) },
  votes: {type: Number, default: 0}
})

module.exports = mongoose.model("Comment", CommentSchema)