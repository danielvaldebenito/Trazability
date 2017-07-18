'use strict'
/* Modelo de procesos internos */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var GeoreferenceSchema = Schema({
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    device: { type: Schema.Types.ObjectId, ref: 'Device'},
    lat: Number,
    lng: Number,
    requestId: String
})
GeoreferenceSchema.plugin(timestamp)
module.exports = mongoose.model('Georeference', GeoreferenceSchema)

