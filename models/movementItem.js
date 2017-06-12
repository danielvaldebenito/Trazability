'use strict'
/* Modelo de local de venta (planta o local) */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var MovementItemSchema = Schema({
    fill: boolean, // Lleno o vacío
    active: boolean, // Activo o no
    product: { type: Schema.ObjectId, ref: 'Product' },
    movement: { type: Schema.ObjectId, ref: 'Movement' },
    document: { type: Schema.ObjectId, ref: 'Document' }
})
MovementItemSchema.plugin(timestamp)
module.exports = mongoose.model('MovementItem', MovementItemSchema)