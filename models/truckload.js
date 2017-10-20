'use strict'

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema

let TruckloadSchema = Schema({
    document: { type: Schema.Types.ObjectId, ref: 'Document' }, 
    transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' }, 
    originWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' }, 
    destinyWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' }
})
TruckloadSchema.plugin(timestamp)
module.exports = mongoose.model('Truckload', TruckloadSchema)