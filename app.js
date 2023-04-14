import { getDataCam } from './services/cameraService';
import { getWeights } from './services/weightsService';
const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const cors = require('cors')
require("dotenv").config();
const app = express();

// SETANDO VARIÁVEIS DA APLICAÇÃO
app.set('port', process.env.PORT || config.get('server.port'));

// MIDDLEWARES
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

// add routes to app
const routes = require("./api/routes/index");
app.use('/api', routes);

getDataCam(80);
getWeights(2);
  
module.exports = app;