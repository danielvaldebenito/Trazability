'use strict'
/* Modelo de vehiculo */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var ClientSchema = Schema({
    nit: { type: String, unique: true, required: true },
    name: String
})
ClientSchema.plugin(timestamp)
module.exports = mongoose.model('Client', ClientSchema)