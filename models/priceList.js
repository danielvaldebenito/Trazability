'use strict'
/* Modelo de lista de precio */
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema

const PriceListSchema = Schema({
    name: { type: String, required: true },
    // distributor: { type: Schema.Types.ObjectId, ref: 'Distributor' },
    region: String,
    city: String,
    items: [{
        productType: { type: Schema.Types.ObjectId, ref: 'ProductType' },
        price: Number
    }]
})
PriceListSchema.plugin(timestamp)
module.exports = mongoose.model('PriceList', PriceListSchema)