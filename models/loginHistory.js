'use strict'
/* Modelo de local de venta (planta o local) */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var LoginHistorySchema = Schema({
    esn: String,
    version: String,
    token: String,
    tokenDate: Date,
    lastLogin: Date,
    entryStatus: Number,
    status: Number,
    logDate: Date,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
})
LoginHistorySchema.plugin(timestamp)

module.exports = mongoose.model('LoginHistory', LoginHistorySchema)