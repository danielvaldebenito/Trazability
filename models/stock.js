'use strict'
/* Modelo de última ubicación informada de cada producto */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema

var StockSchema = Schema({
    product: { type: Schema.ObjectId, ref: 'Product' },
    warehouse: { type: Schema.ObjectId, ref: 'Warehouse' }
})
StockSchema.plugin(timestamp)
module.exports = mongoose.model('Stock', StockSchema)