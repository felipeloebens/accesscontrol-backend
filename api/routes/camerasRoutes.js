const express = require('express');
const CamerasController =  require('../controllers/camerasController');

const routes = express.Router();

routes.get('/', (req, res) => CamerasController.camera1(req, res));
routes.get('/imagesCamera1/', CamerasController.imagesCamera1);
routes.post('/', (req, res) => CamerasController.create(req, res));
routes.put('/:id', (req, res) => CamerasController.update(req, res));
routes.delete('/:id', (req, res) => CamerasController.delete(req, res));

module.exports = routes;