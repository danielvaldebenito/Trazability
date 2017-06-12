'use strict'
/* Modelo de precio */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema

var PriceSchema = Schema({
    priceList: { type: Schema.ObjectId, ref: 'PriceList' },
    productType: { type: Schema.ObjectId, ref: 'ProductType' },
    price: Number
})
PriceSchema.plugin(timestamp)
module.exports = mongoose.model('Price', PriceSchema)