'use strict'

var mongoose = require('mongoose')
var Document = require('../models/document')
var createDocument = function(req, res, next) {

    var folio = req.body.folio
    var typeDocument = req.body.typeDocument
    Document.findOne({ folio: folio, typeDocument: typeDocument }, (err, doc) => {
        if(err) res.status(500).send({ message: 'Error en creación de documento', error: err })
        if(!doc)
        {
            var document = new Document()
            document.type = req.body.typeDocument
            document.folio = req.body.folio
            document.save((err, docStored) => {
                if(err) {
                    res.status(500).send({ message: 'Error en creación de documento', error: err })
                    return
                };
                req.body.document = docStored._id
                console.log('documento creado', docStored)
                next();
            })
        } else {
            req.body.document = doc._id
            console.log('documento ya existe', doc)
            next();
        }
    })

    
}

module.exports = {
    createDocument
}