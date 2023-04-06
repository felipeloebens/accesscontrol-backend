import AxiosDigestAuth from '@mhoc/axios-digest-auth';
import csvToJson from 'csvtojson';
const util = require('util');
const moment = require('moment');
const config = process.env;

class CamerasController {
    
    async camera1(req, res) {
        let startDate;
        let finalDate;
        let jsonString;
        let jsonData = [];
        let jsonDataDb = [];
        let elemDate;
        let dateString;

        const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        const actualDate = moment.utc(dateNow).toDate();

        if(req.body.startDate && req.body.finalDate){
          startDate = moment.utc(req.body.startDate).toDate();
          finalDate = moment.utc(req.body.finalDate).toDate();
        }else{
          finalDate = actualDate;
        }

        if(req.body.minutes && (!req.body.initialDate && !req.body.finalDate)){
          startDate = moment.utc(dateNow).subtract(req.body.minutes, 'minutes').toDate();
        }else if(!req.body.initialDate && !req.body.finalDate){
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
                    elemDate = new Date(element['Hora']);
                    dateString = moment(elemDate).format('YYYY-MM-DD HH:mm:ss');
                    
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
              if(req.body.db === true){
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
}

module.exports = new CamerasController()