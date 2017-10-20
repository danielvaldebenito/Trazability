'use strict'

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema

const TransferSchema = Schema({
    originDependence: {type: Schema.Types.ObjectId, ref: 'Dependence' },
    licensePlate: String,
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    active: Boolean,
    documents: [String],
    transaction: {type: Schema.Types.ObjectId, ref: 'Transaction' },
    stations: [
        {
            destinyDependence: {type: Schema.Types.ObjectId, ref: 'Dependence' },
            documents: [String],
            putUp: [{
                nif: String,
                full: Boolean
            }],
            putDown: [{
                nif: String,
                full: Boolean
            }]
        }
    ]
})
TransferSchema.plugin(timestamp)
module.exports = mongoose.model('Transfer', TransferSchema)

/**
 * Carga: {
 *  vehiculo, documento, transaccion, origenWarehouse (store, internalProcess), destinyWarehouse (vehicle)
 * }
 */

/**
 * Descarga: {
 *  vehiculo, documento, transaccion, origenWarehouse (vehicle), destinyWarehouse (store, internalProcess)
 * }
 */

 /**
 * Mantencion: {
 *  reason, documento, transaccion, origenWarehouse (internalProcess), destinyWarehouse (internalProcess)
 * }
 */