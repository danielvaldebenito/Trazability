'use strict'
/* Modelo de venta */
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema
const config = require('../config')
const types = config.entitiesSettings.document.types;
const status = config.entitiesSettings.order.status;

const HistoryOrder = Schema({
    user: String,
    device: String,
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    coordinates: {
        lat: Number,
        lng: Number
    },
    status: { type: String, enum: status },
    date: Date
})
HistoryOrder.plugin(timestamp)
module.exports = mongoose.model('Document', HistoryOrder)

