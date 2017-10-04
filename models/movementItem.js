'use strict'
/* Modelo de local de venta (planta o local) */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema
var Stock = require('../models/stock')
var MovementItemSchema = Schema({
    fill: Boolean, // Lleno o vacío
    active: Boolean, // Activo o no
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    movement: { type: Schema.Types.ObjectId, ref: 'Movement' },
    document: { type: Schema.Types.ObjectId, ref: 'Document' }
})
MovementItemSchema.plugin(timestamp)

MovementItemSchema.post('save', (doc) => {
    if(doc.movement.type == 'E') {
        Stock.findOneAndUpdate(
            { product: doc.product }, 
            { warehouse: doc.movement.warehouse },
            { upsert: true }, (err, stock) => {
                if(err)
                    throw err
                else
                    console.log('stock actualizado')
            });
    }
    
})


module.exports = mongoose.model('MovementItem', MovementItemSchema)