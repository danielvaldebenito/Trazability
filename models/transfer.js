'use strict'

const mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema

var TransferSchema = Schema({
    originDependence: {type: Schema.Types.ObjectId, ref: 'Dependence' },
    licensePlate: String,
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    active: Boolean,
    documents: [String],
    stations: [
        {
            destinyDependence: {type: Schema.Types.ObjectId, ref: 'Dependence' },
            documents: [String],
            putUp: [{
                nif: String,
                full: Boolean
            }],
            putDown: [{
                nif: String,
                full: Boolean
            }]
        }
    ]
})
TransferSchema.plugin(timestamp)
module.exports = mongoose.model('Transfer', TransferSchema)

