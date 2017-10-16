'use strict'
/* Modelo de una bodega perteneciente a un local de venta*/
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const config = require('../config')
const typesEnum = config.entitiesSettings.warehouse.types
const Schema = mongoose.Schema
const WarehouseSchema = Schema({
    name: { type: String, required: true },
    dependence: { type: Schema.ObjectId, ref: 'Dependence' },
    type: {
        type: String,
        enum: typesEnum
    }
})
WarehouseSchema.plugin(timestamp)
module.exports = mongoose.model('Warehouse', WarehouseSchema)