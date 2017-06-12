'use strict'
/* Modelo de Descuentos y recargos */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema

var DiscountSurchargeSchema = Schema({
    client: { type: Schema.ObjectId, ref: 'Client' },
    productType: { type: Schema.ObjectId, ref: 'ProductType' },
    isDiscount: { type: Boolean, default: true, required: true },
    value: Number
})
DiscountSurchargeSchema.plugin(timestamp)
module.exports = mongoose.model('DiscountSurcharge', DiscountSurchargeSchema)