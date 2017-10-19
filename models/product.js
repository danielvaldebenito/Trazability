'use strict'
/* Modelo de producto */
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const productService = require('../services/product')
const Schema = mongoose.Schema
let ProductSchema = Schema({
    nif: { type: String, require: true, unique: true },
    productType: { type: Schema.Types.ObjectId, ref: 'ProductType' },
    enabled: {type: Boolean, default: true},
    createdByPda: { type: Boolean },
    createdBy: String, 
    formatted: String
})
ProductSchema.plugin(timestamp)

module.exports = mongoose.model('Product', ProductSchema)