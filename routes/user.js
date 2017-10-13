'use strict'
var express = require('express')
var UserController = require('../controllers/user');
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty')
var api = express.Router();
var md_upload = multipart({uploadDir: './uploads/users'});
api.get('/test', UserController.pruebas)
api.post('/register', UserController.saveUser)
api.post('/login', UserController.loginUser)
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser)
api.put('/update-pass-user/', UserController.updatePass)
api.put('/disable-user/:id', UserController.disableUser)
api.put('/enable-user/:id', UserController.enableUser)
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage)
api.get('/get-image-user/:imageFile', UserController.getImageFile)
api.get('/users/:distributor', md_auth.ensureAuth, UserController.getUsers)
api.get('/user/:id', md_auth.ensureAuth, UserController.getOne)
api.get('/users/exists/:username', md_auth.ensureAuth, UserController.validateUsername)
module.exports = api;