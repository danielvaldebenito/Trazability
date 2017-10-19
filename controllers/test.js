'use strict'
var Enumerable = require('linq')
var pushService = require('../services/push')
const pushSocket = require('../services/pushSocket')
const productService = require('../services/product')
var list = [
    {
        id: 1,
        name: 'Jose Pérez',
        age: 18,
        admin: false
    },
    {
        id: 2,
        name: 'Luis Valdés',
        age: 31,
        admin: true
    },
    {
        id: 3,
        name: 'Ramón Fernández',
        age: 46,
        admin: false
    }
]
function getList(req, res) {
    
    return res.status(200)
                .send({
                    data: list
                })
}

function getOne (req, res) {
    var id = req.params.id
    var item = Enumerable.from(list)
                .firstOrDefault((x) => { return x.id == id })
    
    return res.status(200)
                .send({
                    data: item
                })
}

function testNotification (req, res) {
    pushService.test(req.params.token)
        .then(function (response) {
            console.log("Successfully sent message:", response);
            return res.status(200).json({ response })

        })
        .catch(function (error) {
            console.log("Error sending message:", error);
            return res.status(500).json({ error })
        }); 
    
}
function testPushSocket(req, res) {
    const namespace = req.params.namespace
    const room = req.params.room
    const tag = req.params.tag
    const data = req.body
    pushSocket.send(namespace, room, tag, data)
    res.status(200).send('OK')
}

function testFormatNif (req, res) {
    const nif = req.params.nif
    const promise = productService.formatNif(nif)
    promise.then(result => {
        res.status(200).send(result)
    })
    promise.catch(err => { return res.status(500).send({ err }) })

        
}

module.exports = {
    getList,
    getOne,
    testNotification,
    testPushSocket,
    testFormatNif
}