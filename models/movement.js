'use strict'
/* Modelo de local de venta (planta o local) */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var MovementSchema = Schema({
    type: { type: String, enum: ['E', 'S']},
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    items: [{ type: Schema.Types.ObjectId, ref: 'MovementItem' }]
})
MovementSchema.plugin(timestamp)

module.exports = mongoose.model('Movement', MovementSchema)