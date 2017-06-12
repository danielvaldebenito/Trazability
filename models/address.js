'use strict'
/* Modelo de direcciones de cliente */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var AddressSchema = Schema({
    location: { type: String, required: true },
    client: { type: Schema.ObjectId, ref: 'Client'},
    warehouse: { type: Schema.ObjectId, ref: 'Warehouse'},
    coordinates: {
        lat: Number,
        lng: Number
    }
})
AddressSchema.plugin(timestamp)
module.exports = mongoose.model('Address', AddressSchema)