'use strict'
/* Modelo de distribuidor */
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema;
const Warehouse = require('../models/warehouse')
const Dependence = require('../models/dependence')
const DistributorSchema = Schema({
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
    intern: {type: Boolean, default: false},
    address: String,
    city: String,
    region: String
})
DistributorSchema.plugin(timestamp)

DistributorSchema.post('save', (doc) => {
    // Create dependence
    let dependence = new Dependence({
        name: 'Virtual Dependence ' + doc.name,
        isPlant: false,
        distributor: doc._id,
        virtual: true
    })
    dependence.save((err, dep) => {
        if(err) throw err
        console.log('creada dependencia virtual para el distributor ' + doc.name)
        // Create decrease warehouse
        let warehouse = new Warehouse({
            type: 'MERMAS',
            name: 'Mermas ' + doc.name,
            dependence: dep._id
        })
        warehouse.save((err, stored) => {
            if(err) throw err
            console.log('creada warehouse de mermas para el distributor ' + doc.name)
        })
    })
    
})



module.exports = mongoose.model('Distributor', DistributorSchema)