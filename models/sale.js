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
    done: { type: Boolean, default: true, require: true },
    type: { type: String, enum: types },
    paymentMethod: { type: String, enum: paymentMethods },
    transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    document: { type: Schema.Types.ObjectId, ref: 'Document' },
    items: [{
        productType: { type: Schema.Types.ObjectId, ref: 'ProductType' }, // tipo de producto
        quantity: { type: Number, default: 1 }, // cantidad
        price: Number,
        discount: { type: Number, default: 0 },
        negotiable: Number,
        surcharge: { type: Number, default: 0 } 
    }],
    delivery: { type: Schema.Types.ObjectId, ref: 'Delivery' },
    retreats: [
        {
            productType: { type: Schema.Types.ObjectId, ref: 'ProductType' },
            nif: String
        }
    ],
    user: { type: Schema.Types.ObjectId, ref: 'User'}
})
SaleSchema.plugin(timestamp)
module.exports = mongoose.model('Sale', SaleSchema)