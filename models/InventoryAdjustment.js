'use strict'
/* Modelo de ajuste de inventario */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var config = require('../config')
var reasons = config.entitiesSettings.inventoryAdjustment.reasons;
var Schema = mongoose.Schema
var InventoryAdjustmentSchema = Schema({
    transaction: { type: Schema.ObjectId, ref: 'Transaction' },
    inventoryTake: { type: Schema.ObjectId, ref: 'InventoryTake' },
    reason: { type: String, enum: reasons }, // motivo de ajuste
    user: { type: Schema.ObjectId, ref: 'User' },
})
InventoryAdjustmentSchema.plugin(timestamp)
module.exports = mongoose.model('InventoryAdjustment', InventoryAdjustmentSchema)