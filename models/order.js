'use strict'
/* Modelo de pedidos */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var autoIncrement = require('mongoose-auto-increment')

var config = require('../config')
var status = config.entitiesSettings.order.status;
var types = config.entitiesSettings.order.types;
var Schema = mongoose.Schema
var urlConnection = `mongodb://${config.database.user}:${config.database.password}@${config.database.server}:${config.database.port}/${config.database.name}`
var connection = mongoose.createConnection(urlConnection)
autoIncrement.initialize(connection)
var OrderSchema = Schema({
    commitmentDate: Date,
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    address: { type: Schema.Types.ObjectId, ref: 'Address' },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle'},
    phone: { type: String},
    type: { type: String, enum: types, default: 'ENVASADO'},
    distributor: { type: Schema.Types.ObjectId, ref: 'Distributor'}, // Distribuidor dueño del pedido
    originWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' }, // Vehiculo o almacén
    destinyWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' }, // Direccion del cliente
    status: { type: String, enum: status, default: 'RECIBIDO' },
    pendingConfirmCancel: Boolean,
    items: [{ 
        productType: { type: Schema.ObjectId, ref: 'ProductType' }, // tipo de producto
        quantity: { type: Number, default: 1 }, // cantidad
        price: Number,
        discount: Number,
        surcharge: Number,
        negotiable: { type: Number, default: 0 } 
    }],
    orderNumber: Number,
    observation: String,
    erpId: Number,
    erpOrderNumber: Number,
    erpUpdated: Boolean,
    payMethod: String,
    device: { type: Schema.Types.ObjectId, ref: 'Device'},
    licensePlate: String,
    userName: String
})
OrderSchema.plugin(timestamp)
OrderSchema.plugin(autoIncrement.plugin, { 
    model: 'Order',
    field: 'orderNumber',
    startAt: 1,
    incrementBy: 1 
})
var Order = connection.model('Order', OrderSchema)
module.exports = Order