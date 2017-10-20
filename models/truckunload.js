'use strict'

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema

const TruckunloadSchema = Schema({
    document: { type: Schema.Types.ObjectId, ref: 'Document' }, 
    transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' }, 
    origenWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' }, 
    destinyWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' }
})
TruckunloadSchema.plugin(timestamp)
module.exports = mongoose.model('Truckunload', TruckunloadSchema)