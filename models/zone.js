'use strict'
/* Modelo de Zonas */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema;
var ZoneSchema = Schema({
    name: { type: String, unique: true, required: true },
    points: [{
        lat: Number,
        lng: Number
    }]
});
ZoneSchema.plugin(timestamp)
module.exports = mongoose.model('Zone', ZoneSchema)