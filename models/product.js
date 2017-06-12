'use strict'
/* Modelo de producto */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var ProductSchema = Schema({
    nif: { type: String, require: true, unique: true }, 
    productType: { type: Schema.ObjectId, ref: 'ProductType' },
    enabled: {type: Boolean, default: true}
})
ProductSchema.plugin(timestamp)
module.exports = mongoose.model('Product', ProductSchema)