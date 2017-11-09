'use strict'
/* Modelo de local de venta (planta o local) */
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const config = require('../config')
const types = config.entitiesSettings.transaction.types;
const Schema = mongoose.Schema
const TransactionSchema = Schema({
    type: { type: String, require: true, enum: types },
    movements: [{ type: Schema.Types.ObjectId, ref: 'Movement'}],
    device: { type: Schema.Types.ObjectId, ref: 'Device'},
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    document: { type: Schema.Types.ObjectId, ref: 'Document'}
})
TransactionSchema.plugin(timestamp)
module.exports = mongoose.model('Transaction', TransactionSchema)