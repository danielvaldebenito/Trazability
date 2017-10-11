'use strict'
/* Modelo de producto */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
const config = require('../config')
const types = config.entitiesSettings.productType.types
var Schema = mongoose.Schema
var ProductTypeSchema = Schema({
    name: String,
    description: String,
    code: String,
    type: { type: String, enum: types }
})
ProductTypeSchema.plugin(timestamp)

module.exports = mongoose.model('ProductType', ProductTypeSchema)