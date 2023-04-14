const express = require('express');
const DatabaseController =  require('../controllers/databaseController');
const auth = require("../../middleware/auth");

const routes = express.Router();

routes.get('/listFlow', (req, res) => DatabaseController.listFlow(req, res));
routes.get('/listGates', (req, res) => DatabaseController.listGates(req, res));
routes.get('/listWeights', (req, res) => DatabaseController.listWeights(req, res));
routes.post('/insertWeight', (req, res) => DatabaseController.insertWeight(req, res));
routes.post('/insertGate', (req, res) => DatabaseController.insertGate(req, res));
routes.post('/insertVehiclesFlow', (req, res) => DatabaseController.insertVehiclesFlow(req, res));
routes.post('/',auth, (req, res) => DatabaseController.create(req, res));
routes.put('/:id',auth, (req, res) => DatabaseController.update(req, res));
routes.delete('/:id',auth, (req, res) => DatabaseController.delete(req, res));

module.exports = routes;