'use strict'
/* Modelo de vehiculo */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var VehicleSchema = Schema({
    licensePlate: { type: String, unique: true, required: true }, // Patente
    trademark: String, // marca
    model: String, // modelo
    capacity: { type: Number, default: 0 }, // capacidad en cantidad de litros o cilindros
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['ENVASADO', 'GRANEL'], default: 'ENVASADO' },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    dependence: { type: Schema.Types.ObjectId, ref: 'Dependence' },
    distributor: { type: Schema.Types.ObjectId, ref: 'Distributor' },
    disabled: { type: Boolean, default: false }
})
VehicleSchema.plugin(timestamp)
module.exports = mongoose.model('Vehicle', VehicleSchema)