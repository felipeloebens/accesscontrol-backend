
const databaseRoutes =  require('./databaseRoutes')
const loginAdRoutes =  require('./loginAdRoutes')
const camerasRoutes =  require('./camerasRoutes')
const express = require('express');

const routes = express.Router();

routes.use('/database', databaseRoutes);
routes.use('/loginad', loginAdRoutes);
routes.use('/cameras', camerasRoutes);

module.exports = routes;