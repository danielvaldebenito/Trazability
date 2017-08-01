'use strict'
var express = require('express')
var TestController = require('../controllers/test');
var md_auth = require('../middlewares/authenticated');

var api = express.Router();

api.get('/test/', TestController.getList)
api.get('/test/:id', TestController.getOne)
module.exports = api;