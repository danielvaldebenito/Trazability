'use strict'
/* Modelo de PDA */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var DeviceConfigSchema = Schema({
    esn: { type: String, required: true },
    key: String,
    value: String,
    device: { type: Schema.ObjectId, ref: 'Device' },
})
DeviceConfigSchema.plugin(timestamp)
module.exports = mongoose.model('DeviceConfig', DeviceConfigSchema)