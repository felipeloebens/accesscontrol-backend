import AxiosDigestAuth from '@mhoc/axios-digest-auth';
import csvToJson from 'csvtojson';
import formatDate from "../../helpers/formatDate";
import path from 'path';
const Client = require("ftp")
const util = require('util');
const fs = require('fs');
const moment = require('moment');
const config = process.env;

class CamerasController {

    async camera1(req, res) {
        let startDate;
        let finalDate;
        let jsonString;
        let jsonData = [];
        let jsonDataDb = [];
        let dateString;

        const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        const actualDate = moment.utc(dateNow).toDate();

        if(req.headers.startdate && req.headers.finaldate){
          startdate = moment.utc(req.headers.startdate).toDate();
          finaldate = moment.utc(req.headers.finaldate).toDate();
        }else{
          finalDate = actualDate;
        }

        if(req.headers.minutes && (!req.headers.initialdate && !req.headers.finaldate)){
          startDate = moment.utc(dateNow).subtract(req.headers.minutes, 'minutes').toDate();
        }else if(!req.headers.initialdate && !req.headers.finaldate){
          startDate = moment.utc(dateNow).subtract(180, 'minutes').toDate();
        }

        const digestAuth = new AxiosDigestAuth({
            username: config.USER_CAM,
            password: config.PASS_CAM,
          });

        const urlCamQuery =`http://${config.IP_CAM1}:80/cgi-bin/recordUpdater.cgi?action=exportAsyncFileByConditon&condition.startTime=${moment(startDate).format("X")}&condition.endTime=${moment(finalDate).format("X")}&filename=teste03&format=CSV&code=utf-8&name=TrafficSnapEventInfo`
        const urlCamState = `http://${config.IP_CAM1}:80/cgi-bin/recordUpdater.cgi?action=getFileExportState&name=TrafficSnapEventInfo`
        const urlCamCsv = `http://${config.IP_CAM1}:80/cgi-bin/trafficRecord.cgi?action=downloadFile&Type=TrafficSnapEventInfo&filename=teste03`

        try {
        const responseQuery = await digestAuth.request({
          method: "GET",
          url: urlCamQuery,
        });

          if(util.inspect(responseQuery).includes("statusMessage: 'OK'")){
            try {
            let stateQuery = 10;
            while(stateQuery === 10){
              const responseState = await digestAuth.request({
                method: "GET",
                url: urlCamState,
              });

              if(util.inspect(responseState.data).includes("state=0")){
                try {
                  stateQuery = 0;
                  const responseCsv = await digestAuth.request({
                    method: "GET",
                    url: urlCamCsv,
                  });

                  const json = await csvToJson().fromString(responseCsv.data);
                  jsonString = JSON.stringify(json, null, 2);
                  
                  const jsonDataAux = JSON.parse(jsonString);
                  
                  let dataFlow = {};
                  jsonDataAux.forEach(element => {

                    dateString = formatDate(element['Hora']);
                    dataFlow = {
                      id : null,
                      license : element['Nº placa'],
                      id_gate : 1,
                      pass_date : dateString,
                      way : "entering",
                    }
                    jsonDataDb.push(dataFlow);
              
                  });
                   
                } catch (e) { 
                  return res.status(500).json({status : 'Error on get CSV data'});
                }              
              }
            }
              jsonData.push({status :"Ok"});
              if(req.headers.db === "true"){
                jsonData.push({vehicles : jsonDataDb});
              }else{
                jsonData.push({vehicles : JSON.parse(jsonString)});
              }
              return res.status(200).send(jsonData);
            } catch (e) {
              return res.status(500).json({status : 'Error on verify state'});
            }
          }else{
            return res.status(500).json({status : 'Error on query'});
          }
        } catch (e) {
          return res.status(500).json({status : 'Error on query route'});
        }
        
      }

    async imagesCamera1(req, res) {
      const convert = (imgPath) => {
        // read image file
        fs.readFile(imgPath, (err, data)=>{
            // error handle
            if(err) {
                throw err;
            }
            
            // get image file extension name
            const extensionName = path.extname(imgPath);
            
            // convert image file to base64-encoded string
            const base64Image = Buffer.from(data, 'binary').toString('base64');
            
            // combine all strings
            const base64ImageStr = `data:image/${extensionName.split('.').pop()};base64,${base64Image}`;
            returnValue(base64ImageStr)
            return base64ImageStr;
        })
       
    }


    
      let imageName = '';
      let myDir = '';
      let dataFromImage = {};
      const client = new Client();
      client.on('ready', function() {
        const strYear = req.query.pass_date.slice(0, 4);
        const strMonth = req.query.pass_date.slice(5, 7);
        const strDay = req.query.pass_date.slice(8, 10);
        const strHour = req.query.pass_date.slice(11, 13);
        const strMin = req.query.pass_date.slice(14, 16);
        let license = ''
        myDir = "/Portaria/"+strYear+"-"+strMonth+"-"+strDay+"/"+strHour+"/"+strMin+"/";
        if(req.query.license === "SEM PLACA"){
          license = "Sem placa";
        }else{
          license = req.query.license;
        }

        client.list("/Portaria/"+strYear+"-"+strMonth+"-"+strDay+"/"+strHour+"/"+strMin+"/",(err, list) => {
            if (err) console.dir(err);
            dataFromImage = list.find(c => c.name.includes(license));
            imageName = dataFromImage.name;            
            
            client.get(myDir+imageName, (err, stream) => {
              if(err) throw err;
              stream.once('close', () => client.end())
              stream.pipe(fs.createWriteStream('./temp/imagemModal.png'));
            })
        });
    });
      
    await client.connect({ host: "10.0.0.7", user: "felipe.loebens", password: "Automac@1" });

    setTimeout(() => {
      convert('./temp/imagemModal.png');
    }, 200)

    const returnValue = (value) => {
        return res.status(200).send(value);
    }
    }
}

module.exports = new CamerasController()