'use strict'
/* Modelo de detalle de venta */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var SaleItemSchema = Schema({
    sale: { type: Schema.ObjectId, ref: 'Sale' }, // Pedido
    productType: { type: Schema.ObjectId, ref: 'ProductType' }, // tipo de producto
    quantity: { type: Number, default: 1 }, // cantidad
    unitPrice: Number,
    discount: Number,
    surcharge: Number
})
SaleItemSchema.plugin(timestamp)
module.exports = mongoose.model('SaleItem', SaleItemSchema)