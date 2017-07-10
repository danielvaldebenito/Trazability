'use strict'
/* Modelo de PDA */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var DeviceConfigSchema = Schema({
    key: String,
    value: String,
    app: String
})
DeviceConfigSchema.plugin(timestamp)
module.exports = mongoose.model('DeviceConfig', DeviceConfigSchema)