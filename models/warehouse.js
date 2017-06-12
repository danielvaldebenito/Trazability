'use strict'
/* Modelo de una bodega perteneciente a un local de venta*/
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var config = require('../config')
var typesEnum = config.entitiesSettings.warehouse.types
var Schema = mongoose.Schema
var WarehouseSchema = Schema({
    name: { type: String, required: true },
    dependence: { type: Schema.ObjectId, ref: 'Dependence' },
    type: {
        type: String,
        enum: typesEnum
    }
})
WarehouseSchema.plugin(timestamp)
module.exports = mongoose.model('Warehouse', WarehouseSchema)