'use strict'
/* Modelo de vehiculo */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema


var ClientSchema = Schema({
    nit: { type: String, unique: true, required: true },
    name: String,
    surname: String,
    phone: String,
    email: String,
    address: String,
    region: String,
    city: String,
    contact: String,
    completeName: String,
    quick: Boolean,
    discountSurcharges: [{
        productType: { type: Schema.Types.ObjectId, ref: 'ProductType' },
        isDiscount: { type: Boolean, default: true, required: true },
        value: Number
    }]
}, 
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})
ClientSchema.virtual("fullname").get(function()
{
    return this.surname ? this.name + ' ' + this.surname : this.name
});
ClientSchema.virtual("fulldata").get(function()
{
    var concat = `Nombre: ${this.name} ${this.surname || ''} NIT: ${this.nit || ''} Teléfono: ${this.phone || ''} Email: ${this.email || ''} Dirección: ${this.address || ''} Departamento: ${this.region || ''} Ciudad: ${this.city || ''} Contacto: ${this.contact || ''}`
    return concat
});
ClientSchema.plugin(timestamp)
module.exports = mongoose.model('Client', ClientSchema)