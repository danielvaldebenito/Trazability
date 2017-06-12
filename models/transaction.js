'use strict'
/* Modelo de local de venta (planta o local) */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var config = require('../config')
var types = config.entitiesSettings.transaction.types;
var Schema = mongoose.Schema
var TransactionSchema = Schema({
    type: { type: String, require: true, enum: types }
})
TransactionSchema.plugin(timestamp)
module.exports = mongoose.model('Transaction', TransactionSchema)