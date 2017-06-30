'use strict'
/* Modelo de local de venta (planta o local) */
var mongoose = require('mongoose')
var timestamp = require('mongoose-timestamp')
var Schema = mongoose.Schema

var MovementItemSchema = Schema({
    fill: Boolean, // Lleno o vacío
    active: Boolean, // Activo o no
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    movement: { type: Schema.Types.ObjectId, ref: 'Movement' },
    document: { type: Schema.Types.ObjectId, ref: 'Document' }
})
MovementItemSchema.plugin(timestamp)


var Stock = require('./stock')
// Triggers
MovementItemSchema.post('save', (doc) => {
    var product = doc.product
    var warehouse = doc.movement.warehouse
    var io = doc.movement.type
    if(io == 'E')
    {
        Stock.findOne({ product: product, warehouse: warehouse }, (err, stock) => {
            if(err) throw err
            if(!stock)
            {
                var st = new Stock({
                    warehouse: warehouse,
                    product: product
                })
                st.save()
            }
        })
    } else { // 'S'
        Stock.findOneAndRemove({ product: product, warehouse: warehouse }, (err, removed) => {
            if(err) throw err
        })
    }
        
    
})

module.exports = mongoose.model('MovementItem', MovementItemSchema)