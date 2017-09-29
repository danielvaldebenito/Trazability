'use strict'
/* Modelo de tipos de procesos internos en una planta */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var InternalProcessTypeSchema = Schema({
    name: String,
    description: String,
})
InternalProcessTypeSchema.plugin(timestamp)
module.exports = mongoose.model('InternalProcessType', InternalProcessTypeSchema)