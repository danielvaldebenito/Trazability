'use strict'

var mongoose = require('mongoose')
var Sale = require('../models/sale')
var SaleItem = require('../models/saleItem')
var MovementItem = require('../models/movementItem')
var Enumerable = require('linq')

const parseToJson  = function (req, res, next) {
    try{
        const body = req.body
        const json = JSON.parse(body)
        req.body = json;
        next()
    } catch(e) {
        res.status(500).send({done: false, code: -1, message: 'No se pudo parsear el JSON', error: e})
    }

    
}

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
                quantity: 1, // cantidad
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
    convertMovementDetailToSaleDetail,
    parseToJson
}