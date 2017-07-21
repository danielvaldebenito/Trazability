'use strict'
/* Modelo de PDA */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var DeviceSchema = Schema({
    esn: { type: String, required: true, unique: true },
    version: String,
    token: String,
    tokenDate: Date,
    lastLogin: Date,
    entryStatus: Number,
    status: Number,
    logDate: Date,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
})
DeviceSchema.plugin(timestamp)
module.exports = mongoose.model('Device', DeviceSchema)