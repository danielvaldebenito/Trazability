'use strict'
/* Modelo de pedidos */
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const autoIncrement = require('mongoose-auto-increment')

const config = require('../config')
const status = config.entitiesSettings.order.status;
const types = config.entitiesSettings.order.types;
const events = config.entitiesSettings.order.eventsHistory;
const reasonsCancel = config.entitiesSettings.order.reasons;
const Schema = mongoose.Schema
const urlConnection = `mongodb://${config.database.user}:${config.database.password}@${config.database.server}:${config.database.port}/${config.database.name}`
const connection = mongoose.createConnection(urlConnection)
autoIncrement.initialize(connection)
const OrderSchema = Schema({
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
    erpId: String,
    erpOrderNumber: Number,
    erpUpdated: Boolean,
    payMethod: String,
    device: { type: Schema.Types.ObjectId, ref: 'Device'},
    licensePlate: String,
    userName: String,
    pendingConfirmCancel: Boolean,
    reasonCancel: { type: String, enum: reasonsCancel },
    // pendingConfirmReassign: Boolean,
    // pendingDeviceReassign: { type: Schema.Types.ObjectId, ref: 'Device'},
    // pendingVehicleReassign: { type: Schema.Types.ObjectId, ref: 'Vehicle'},
    // pendingOWReassign: { type: Schema.Types.ObjectId, ref: 'Warehouse'},
    history: [{
        user: { type: Schema.Types.ObjectId, ref: 'User'},
        userName: String,
        device: { type: Schema.Types.ObjectId, ref: 'Device'},
        oldDevice: { type: Schema.Types.ObjectId, ref: 'Device'},
        date: Date,
        event: { type: String, enum: events }
    }]
})
OrderSchema.plugin(timestamp)
OrderSchema.plugin(autoIncrement.plugin, { 
    model: 'Order',
    field: 'orderNumber',
    startAt: 1,
    incrementBy: 1 
})
const Order = connection.model('Order', OrderSchema)
module.exports = Order