'use strict'
/* Modelo de producto */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var ProductSchema = Schema({
    name: String,
    description: String,
    weight: number,
    tare: number
})
ProductSchema.plugin(timestamp)
module.exports = mongoose.model('Product', ProductSchema)