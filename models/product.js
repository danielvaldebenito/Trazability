'use strict'
/* Modelo de producto */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var ProductSchema = Schema({
    nif: { type: String, require: true, unique: true }, 
    productType: { type: Schema.Types.ObjectId, ref: 'ProductType' },
    enabled: {type: Boolean, default: true},
    createdByPda: { type: Boolean },
    createdBy: String
})
ProductSchema.plugin(timestamp)
module.exports = mongoose.model('Product', ProductSchema)