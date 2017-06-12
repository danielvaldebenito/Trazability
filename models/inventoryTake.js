'use strict'
/* Modelo de toma de inventario */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var InventoryTakeSchema = Schema({
    product: { type: Schema.ObjectId, ref: 'Product' },
    inventoryWarehouse: { type: Schema.ObjectId, ref: 'InventoryWarehouse' },
    exists: { type: Boolean, default: false },
    shouldBe: { type: Boolean, default: true }
})
InventoryTakeSchema.plugin(timestamp)
module.exports = mongoose.model('InventoryTake', InventoryTakeSchema)