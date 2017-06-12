'use strict'
/* Modelo de lista de precio */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema

var PriceListSchema = Schema({
    name: { type: String, required: true },
    distributor: { type: Schema.ObjectId, ref: 'Distributor' }
})
PriceListSchema.plugin(timestamp)
module.exports = mongoose.model('PriceList', PriceListSchema)