'use strict'

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema
let SimpleInventorySchema = Schema({
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse'},
    dependence: { type: Schema.Types.ObjectId, ref: 'Dependence' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    takes: [
        {
            productType: { type: Schema.Types.ObjectId, ref: 'ProductType' },
            quantity: Number,
            date: Date
        }
    ],
    date: Date
})
SimpleInventorySchema.plugin(timestamp)
module.exports = mongoose.model('SimpleInventory', SimpleInventorySchema)