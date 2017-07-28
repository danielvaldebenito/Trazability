'use strict'
/* Modelo de procesos internos */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')

var Schema = mongoose.Schema
var InternalProcessSchema = Schema({
    internalProcessType: { type: Schema.Types.ObjectId, ref: 'InternalProcessType'},
    warehouse: { type: Schema.ObjectId, ref: 'Warehouse'}
})
InternalProcessSchema.plugin(timestamp)
module.exports = mongoose.model('InternalProcess', InternalProcessSchema)