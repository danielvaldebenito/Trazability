'use strict'
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var UserSchema = Schema({
    name: { type: String, required: true },
    surname: String,
    email: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: String,
    isAdmin: { type: Boolean, default: false },
    distributor: { type: Schema.Types.ObjectId, ref: 'Distributor' },
    lastLogin: Date
})
UserSchema.plugin(timestamp)
module.exports = mongoose.model('User', UserSchema)