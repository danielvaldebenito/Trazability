'use strict'
/* Modelo de usuario-bodega */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema

var UserWarehouseSchema = Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' }
})
UserWarehouseSchema.plugin(timestamp)
module.exports = mongoose.model('UserWarehouse', UserWarehouseSchema)