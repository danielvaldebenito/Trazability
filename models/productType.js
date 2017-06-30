'use strict'
/* Modelo de producto */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var ProductTypeSchema = Schema({
    name: String,
    description: String,
    weight: Number,
    tare: Number
})
ProductTypeSchema.plugin(timestamp)

module.exports = mongoose.model('ProductType', ProductTypeSchema)