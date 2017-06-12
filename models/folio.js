'use strict'
/* Modelo de folio */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var FolioSchema = Schema({
    folioRank: { type: Schema.ObjectId, ref: 'FolioRank'},
    number: { type: Number, required: true },
    taked: { type: Boolean, default: false }
})
FolioSchema.plugin(timestamp)
module.exports = mongoose.model('Folio', FolioSchema)