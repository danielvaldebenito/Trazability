'use strict'
/* Modelo de inventario-bodega */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var InventoryWarehouseSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User'},
    alive: { type: Boolean, default: true },
    warehouse: { type: Schema.ObjectId, ref: 'Warehouse' },
    inventory: { type: Schema.ObjectId, ref: 'Inventory' }
})
InventoryWarehouseSchema.plugin(timestamp)
module.exports = mongoose.model('InventoryWarehouse', InventoryWarehouseSchema)