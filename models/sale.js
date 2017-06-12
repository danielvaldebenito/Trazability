'use strict'
/* Modelo de venta */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var config = require('../config')
var types = config.entitiesSettings.sale.types;
var paymentMethods = config.entitiesSettings.sale.paymentMethods;
var SaleSchema = Schema({
    coordinates: {
        lat: Number,
        lng: Number
    },
    done: Boolean,
    type: { type: String, enum: types },
    paymentMethod: { type: String, enum: paymentMethods },
    transaction: { type: Schema.ObjectId, ref: 'Transaction' },
    document: { type: Schema.ObjectId, ref: 'Document' }
})
SaleSchema.plugin(timestamp)
module.exports = mongoose.model('Sale', SaleSchema)