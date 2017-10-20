'use strict'

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema
const config = require('../config')
const reasons = config.entitiesSettings.maintenance.reasons;
const MaintenanceSchema = Schema({
    reason: { type: String, enum: reasons },
    document: { type: Schema.Types.ObjectId, ref: 'Document' }, 
    transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' }, 
    origenWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' }, 
    destinyWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' }
})
MaintenanceSchema.plugin(timestamp)
module.exports = mongoose.model('Maintenance', MaintenanceSchema)