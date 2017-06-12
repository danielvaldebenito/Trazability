'use strict'
/* Modelo de almacenes */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var StoreSchema = Schema({
    name: String,
    address: String,
    warehouse: { type: Schema.ObjectId, ref: 'Warehouse'}
})
StoreSchema.plugin(timestamp)
module.exports = mongoose.model('Store', StoreSchema)