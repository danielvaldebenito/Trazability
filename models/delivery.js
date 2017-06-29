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
    done: { type: Boolean, require: true },
    image: String,
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    sale: { type: Schema.Types.ObjectId, ref: 'Sale' }
})
DeliverySchema.plugin(timestamp)
module.exports = mongoose.model('Delivery', DeliverySchema)