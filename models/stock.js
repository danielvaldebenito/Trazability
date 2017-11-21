'use strict'
/* Modelo de última ubicación informada de cada producto */
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema

const StockSchema = Schema({
    product: { type: Schema.ObjectId, ref: 'Product' },
    warehouse: { type: Schema.ObjectId, ref: 'Warehouse' }
})
StockSchema.plugin(timestamp)
module.exports = mongoose.model('Stock', StockSchema)