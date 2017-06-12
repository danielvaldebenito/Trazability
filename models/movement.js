'use strict'
/* Modelo de local de venta (planta o local) */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var MovementSchema = Schema({
    type: { type: String, enum: ['E', 'S']},
    user: { type: Schema.ObjectId, ref: 'User' },
    warehouse: { type: Schema.ObjectId, ref: 'Warehouse' },
    transaction: { type: Schema.ObjectId, ref: 'Transaction' }
})
MovementSchema.plugin(timestamp)
module.exports = mongoose.model('Movement', MovementSchema)