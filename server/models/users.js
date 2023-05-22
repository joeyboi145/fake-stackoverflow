// User Document Schema

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  reputation: {type: Number, default: 0},
  member_since: {type: Date, default: new Date(Date.now())},
  admin: {type: Boolean, default: false}
})

module.exports = mongoose.model('User', UserSchema)