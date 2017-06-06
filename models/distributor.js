'use strict'

var mongoose = require('mongoose');
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema;
var DistributorSchema = Schema({
    name: string,
    nit: string,
    email: string,
    contact: string,
    phone: string,
    image: string
});
DistributorSchema.plugin(timestamp);
module.exports = mongoose.model('Distributor', DistributorSchema);