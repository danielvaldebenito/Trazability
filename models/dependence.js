'use strict'
/* Modelo de local de venta (planta o local) */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var DependenceSchema = Schema({
    name: { type: String, required: true },
    address: String,
    email: String,
    phone: String,
    isPlant: { type: Boolean, default: false },
    distributor: { type: Schema.ObjectId, ref: 'Distributor' },
    virtual: { type: Boolean, default: false }
})


DependenceSchema.plugin(timestamp)
module.exports = mongoose.model('Dependence', DependenceSchema)