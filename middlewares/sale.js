'use strict'

const mongoose = require('mongoose')
const Sale = require('../models/sale')
const Order = require('../models/order')
const Delivery = require('../models/delivery')
const SaleItem = require('../models/saleItem')
const MovementItem = require('../models/movementItem')
const Enumerable = require('linq')
const Product = require('../models/product')


var convertMovementDetailToSaleDetail = function(req, res, next) {
    
    var movementDetail = []
    movementDetail = req.body.items

    var saleDetail = []

    var total = movementDetail.length
    console.log('total', total)
    movementDetail.forEach((m) => {
        var saleItem = Enumerable.from(saleDetail)
                            .where((x) => { return x.productType == m.productType })
                            .firstOrDefault()
        if(saleItem == null)
        {
            var sItem = {
                productType: m.productType, // tipo de producto
                quantity: m.quantity, // cantidad (ENVASADO: 1 - GRANEL: N)
                price: m.price,
                discount: 0,
                surcharge: 0
            }
            saleDetail.push(sItem)
        } else {
            saleItem.quantity = saleItem.quantity + 1;
        }
    
        total --;
        if(total == 0)
        {
            req.body.itemsSale = saleDetail
            next()
        }
            
        
    })
    
}


module.exports = {
    convertMovementDetailToSaleDetail
}