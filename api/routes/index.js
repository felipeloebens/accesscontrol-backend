
const databaseRoutes =  require('./databaseRoutes')
const loginAdRoutes =  require('./loginAdRoutes')
const camerasRoutes =  require('./camerasRoutes')
const scalesRoutes =  require('./scalesRoutes')
const express = require('express');

const routes = express.Router();

routes.use('/database', databaseRoutes);
routes.use('/loginad', loginAdRoutes);
routes.use('/cameras', camerasRoutes);
routes.use('/scales', scalesRoutes);

module.exports = routes;