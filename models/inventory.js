'use strict'
/* Modelo de inventario */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var SettingsSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User'},
    dateStart: { type: Date, default: Date.now() },
    dateEnd: Date,
    alive: { type: Boolean, default: true },
    dependence: { type: Schema.ObjectId, ref: 'Dependence' }
})
SettingsSchema.plugin(timestamp)
module.exports = mongoose.model('Settings', SettingsSchema)