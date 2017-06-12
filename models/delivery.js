'use strict'
/* Modelo de entrega */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var DeliverySchema = Schema({
    coordinates: {
        lat: Number,
        lng: Number
    },
    done: Boolean,
    image: String,
    order: { type: Schema.ObjectId, ref: 'Order' },
    sale: { type: Schema.ObjectId, ref: 'Sale' }
})
DeliverySchema.plugin(timestamp)
module.exports = mongoose.model('Delivery', DeliverySchema)