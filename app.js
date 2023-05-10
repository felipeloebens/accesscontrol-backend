import { getDataCam } from './services/cameraService';
import { getWeights } from './services/weightsService';
import Stream from 'node-rtsp-stream';
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


  
Stream = new Stream({
    name: "cameraPortaria",
    // streamUrl: "rtsp://YOUR_IP:PORT",
    streamUrl: "rtsp://admin:automac123@10.10.51.26:554/cam/realmonitor?channel=1&subtype=0",
    wsPort: 3006,
    ffmpegOptions: { // options ffmpeg flags
      "-f": "mpegts", // output file format.
      "-codec:v": "mpeg1video", // video codec
      "-b:v": "550k", // video bit rate
      "-stats": "",
      "-r": 22, // frame rate
      "-s": "640x480", // video size
      "-bf": 0,
    },
  });


getDataCam(80);
getWeights(2);

module.exports = app;