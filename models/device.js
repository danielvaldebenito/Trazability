'use strict'
/* Modelo de PDA */
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema
const DeviceSchema = Schema({
    esn: { type: String, required: true, unique: true },
    version: String,
    token: String,
    tokenDate: Date,
    lastLogin: Date,
    entryStatus: Number,
    status: Number,
    logDate: Date,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    pos: String,
    token2: String,
    tokenDate2: Date,
    version2: String,
    user2: { type: Schema.Types.ObjectId, ref: 'User' },
})
DeviceSchema.plugin(timestamp)
module.exports = mongoose.model('Device', DeviceSchema)