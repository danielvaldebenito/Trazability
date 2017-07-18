'use strict'
/* Modelo de procesos internos */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var GeoreferenceRequestSchema = Schema({
    lat: Number,
    lng: Number,
    requestId: String,
    user: String
})
GeoreferenceRequestSchema.plugin(timestamp)
module.exports = mongoose.model('GeoreferenceRequest', GeoreferenceRequestSchema)