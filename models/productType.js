'use strict'
/* Modelo de producto */
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const config = require('../config')
const types = config.entitiesSettings.productType.types
const Schema = mongoose.Schema
const ProductTypeSchema = Schema({
    name: String,
    description: String,
    code: String,
    type: { type: String, enum: types },
    capacity: Number
})
ProductTypeSchema.plugin(timestamp)

module.exports = mongoose.model('ProductType', ProductTypeSchema)