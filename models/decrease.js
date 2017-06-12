'use strict'
/* Modelo de almacén de mermas (obligatorio y único para cada local de venta)*/
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var DecreaseSchema = Schema({
    warehouse: { type: Schema.ObjectId, ref: 'Warehouse'}
})
DecreaseSchema.plugin(timestamp)
module.exports = mongoose.model('Decrease', DecreaseSchema)