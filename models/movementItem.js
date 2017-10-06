'use strict'
/* Modelo de local de venta (planta o local) */
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const Schema = mongoose.Schema
const Stock = require('../models/stock')
const Movement = require('../models/movement')
const MovementItemSchema = Schema({
    fill: Boolean, // Lleno o vacío
    active: Boolean, // Activo o no
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    movement: { type: Schema.Types.ObjectId, ref: 'Movement' },
    document: { type: Schema.Types.ObjectId, ref: 'Document' }
})
MovementItemSchema.plugin(timestamp)

MovementItemSchema.post('save', (doc) => {
    if(doc.movement) {
        const pop = doc.populate('movement', (err, record) => {
            const movement = record.movement
            const movementType = movement.type
            if(movementType == 'S') {
                Stock.findOneAndRemove(
                    {
                        product: doc.product,
                        warehouse: movement.warehouse
                    }, (err, raw) => {
                        if(err) {
                            console.log('Ocurrió un error al eliminar stock', err)
                        } else {
                            console.log('Stock eliminado en movimiento de salida', doc.product)
                        }
                    }
                )
            } else if(movementType == 'E') {
                Stock.findOneAndUpdate(
                    { product: doc.product },
                    { warehouse: movement.warehouse },
                    { upsert: true, new: true },
                    (err, stock, res) => {
                        console.log('Actualizando stock entrada producto:', doc.product)
                    }
                )
                
            }
        })
        
    }
    // if(doc.movement.type == 'S') {
    //     Stock.findOneAndRemove(
    //         { product: doc.product, warehouse: doc.movement.warehouse }, (err, res) => {
    //             if(err)
    //                 console.log('Error al actualizar stock de salida', err)
    //             console.log('stock salida actualizado', res)
    //         });
    // } else if(doc.movement.type == 'E') {
    //     Stock.findOneAndUpdate(
    //     {product: doc.product}, 
    //     {product: doc.product, warehouse: doc.movement.warehouse}, { upsert: true }, (err, raw) => {
    //         if(err)
    //             console.log('Error al actualizar stock de entrada', err)
    //         else
    //             console.log('stock entrada actualizado', raw)
    //     })
    // }
})


module.exports = mongoose.model('MovementItem', MovementItemSchema)