'use strict'
/* Modelo de local de venta (planta o local) */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema

var MovementItemSchema = Schema({
    fill: Boolean, // Lleno o vacío
    active: Boolean, // Activo o no
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    movement: { type: Schema.Types.ObjectId, ref: 'Movement' },
    document: { type: Schema.Types.ObjectId, ref: 'Document' }
})
MovementItemSchema.plugin(timestamp)



module.exports = mongoose.model('MovementItem', MovementItemSchema)