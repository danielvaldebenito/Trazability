'use strict'
/* Modelo de pedidos */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var config = require('../config')
var status = config.entitiesSettings.order.status;
var types = config.entitiesSettings.order.types;
var Schema = mongoose.Schema
var OrderSchema = Schema({
    commitmentDate: Date,
    type: { type: String, enum: types, default: 'ENVASADO'},
    distributor: { type: Schema.Types.ObjectId, ref: 'Distributor'}, // Distribuidor dueño del pedido
    originWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' }, // Vehiculo o almacén
    destinyWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' }, // Direccion del cliente
    status: { type: String, enum: status, default: 'RECIBIDO' },
    arrival: {
        date: Date,
        lat: Number, 
        lng: Number
    },
    items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }]
})
OrderSchema.plugin(timestamp)
module.exports = mongoose.model('Order', OrderSchema)