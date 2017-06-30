'use strict'
/* Modelo de configuracion de opciones por distribuidor (opciones por ver) */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var config = require('../config')
var keys = config.entitiesSettings.settings.keys;
var Schema = mongoose.Schema
var SettingsSchema = Schema({
    distributor: { type: Schema.ObjectId, ref: 'Distributor'},
    key: { type: String, required: true, enum: keys },
    value: Schema.Types.Mixed
})
SettingsSchema.plugin(timestamp)
module.exports = mongoose.model('Settings', SettingsSchema)