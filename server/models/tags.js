// Tag Document Schema

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TagSchema = new Schema({
  name: { type: String, required: true },
  tagged_by: {type: Schema.Types.ObjectID, ref: "userSchema", required: true},
})

module.exports = mongoose.model('Tag', TagSchema)