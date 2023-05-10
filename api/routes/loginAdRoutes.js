const express = require('express');
const LoginAdController =  require('../controllers/loginAdController');
const auth = require("../../middleware/auth");

const routes = express.Router();

routes.post('/auth/', (req, res) => LoginAdController.login(req, res));
routes.post('/checkToken/', auth, (req, res) => LoginAdController.checkToken(req, res));


module.exports = routes;