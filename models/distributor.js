'use strict'
/* Modelo de distribuidor */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema;
var DistributorSchema = Schema({
    name: {
        type: String,
        required: [ true, 'El nombre es requerido'],
        unique: true
    },
    nit: { type: String, unique: true } ,
    email: String,
    contact: String,
    phone: String,
    image: String,
    intern: {type: Boolean, default: false}
})
DistributorSchema.plugin(timestamp)
module.exports = mongoose.model('Distributor', DistributorSchema)