'use strict'
/* Modelo de rangos de folio */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var FolioRankSchema = Schema({
    distributor: { type: Schema.ObjectId, ref: 'Distributor'},
    start: Number,
    end: Number
})
FolioRankSchema.plugin(timestamp)
module.exports = mongoose.model('FolioRank', FolioRankSchema)