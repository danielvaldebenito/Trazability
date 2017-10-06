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
    if(doc.movement.type == 'S') {
        Stock.findOneAndRemove(
            { product: doc.product, warehouse: doc.movement.warehouse }, (err, res) => {
                if(err)
                    console.log('Error al actualizar stock de salida', err)
                console.log('stock salida actualizado', res)
            });
    } else if(doc.movement.type == 'E') {
        Stock.findOneAndUpdate(
        {product: doc.product}, 
        {product: doc.product, warehouse: doc.movement.warehouse}, { upsert: true }, (err, raw) => {
            if(err)
                console.log('Error al actualizar stock de entrada', err)
            else
                console.log('stock entrada actualizado', raw)
        })
    }
})


module.exports = mongoose.model('MovementItem', MovementItemSchema)