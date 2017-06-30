'use strict'
/* Modelo de detalle de venta */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var SaleItemSchema = Schema({
    sale: { type: Schema.Types.ObjectId, ref: 'Sale' }, // Venta
    productType: { type: Schema.Types.ObjectId, ref: 'ProductType' }, // tipo de producto
    quantity: { type: Number, default: 1 }, // cantidad
    unitPrice: Number,
    discount: { type: Number, default: 0 },
    surcharge: { type: Number, default: 0 }
})
SaleItemSchema.plugin(timestamp)
module.exports = mongoose.model('SaleItem', SaleItemSchema)