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
    }],
    addresses: [{
        location: String,
        city: String,
        region: String
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
    var concat = ''
    if(this.name || this.surname)
        concat += `Nombre: ${this.name} ${this.surname || ''} `
    if(this.nit)
        concat += `NIT: ${this.nit || ''} `
    if(this.phone)
        concat += `Teléfono: ${this.phone || ''} `
    if(this.email)
        concat += `Email: ${this.email || ''} `
    if(this.address)
        concat += `Dirección: ${this.address || ''} `
    if(this.region)
        concat += `Departamento: ${this.region || ''} `
    if(this.city)
        concat += `Ciudad: ${this.city || ''} `
    if(this.contact)
        concat += `Contacto: ${this.contact || ''}`
    return concat
});
ClientSchema.plugin(timestamp)
module.exports = mongoose.model('Client', ClientSchema)