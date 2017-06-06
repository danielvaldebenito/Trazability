'use strict'
/* Modelo de distribuidor */
var mongoose = require('mongoose');
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema;
var DistributorSchema = Schema({
    name: String,
    nit: String,
    email: String,
    contact: String,
    phone: String,
    image: String
});
DistributorSchema.plugin(timestamp);
module.exports = mongoose.model('Distributor', DistributorSchema);