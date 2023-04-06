const express = require('express');
const LoginAdController =  require('../controllers/loginAdController');

const routes = express.Router();

routes.post('/auth/', (req, res) => LoginAdController.login(req, res));


module.exports = routes;