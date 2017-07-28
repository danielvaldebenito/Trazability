'use strict'
var express = require('express')
var TestController = require('../controllers/test');
var md_auth = require('../middlewares/authenticated');

var api = express.Router();

api.get('/test/', md_auth.ensureAuth, TestController.getList)
api.get('/test/:id', md_auth.ensureAuth, TestController.getOne)
module.exports = api;