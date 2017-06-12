'use strict'
/* Modelo de venta */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var config = require('../config')
var types = config.entitiesNames.document.types;

var DocumentSchema = Schema({
    type: { type: String, enum: types },
    folio: { type: String }
})
DocumentSchema.plugin(timestamp)
module.exports = mongoose.model('Document', DocumentSchema)