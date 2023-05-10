const express = require('express');
const ScalesController =  require('../controllers/scalesController');

const routes = express.Router();

routes.get('/weights', (req, res) => ScalesController.weights(req, res));
routes.get('/display', (req, res) => ScalesController.display(req, res));



module.exports = routes;