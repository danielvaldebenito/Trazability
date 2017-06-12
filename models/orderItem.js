'use strict'
/* Modelo de item pedido */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var OrderItemSchema = Schema({
    order: { type: Schema.ObjectId, ref: 'Order' }, // Pedido
    productType: { type: Schema.ObjectId, ref: 'ProductType' }, // tipo de producto
    quantity: { type: Number, default: 1 }, // cantidad
})
OrderItemSchema.plugin(timestamp)
module.exports = mongoose.model('OrderItem', OrderItemSchema)