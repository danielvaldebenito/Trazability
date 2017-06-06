'use strict'
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var UserSchema = Schema({
    name: { type: String, required: true },
    surname: String,
    email: String,
    password: { type: String, required: true },
    image: String,
    isAdmin: { type: Boolean, default: false },
    distributor: { type: Schema.ObjectId, ref: 'Distributor' },
    lastLogin: Date
})
UserSchema.plugin(timestamp)
module.exports = mongoose.model('User', UserSchema)