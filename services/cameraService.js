import axios from 'axios';
const config = process.env;



function getDataCam(time){

    async function getCam(){

            const getLastRecord = await axios.get(`http://${config.SERVER_URL}:3333/api/database/listFlow`,{ data : {"last" : true}});
            
            const dateNow = Date.now();
            const dateLastReg = new Date(getLastRecord.data[0].pass_date)
            
            const timestampLastReg = dateLastReg.getTime();
            const difDates = Math.round(((dateNow - timestampLastReg)/1000)/60);
            let minutesGet = 2;
            if(difDates > 2){
                minutesGet = difDates-1;
            }else{
                minutesGet = 2;
            }
            console.log("Minutes: ",minutesGet);

            try {
                const connectionCam = await axios.get(`http://${config.SERVER_URL}:3333/api/cameras/`,{ data : {db : true, "minutes" : minutesGet}});
                
                const arrayVehicles = connectionCam.data[1]['vehicles'];

                const newArrayVehicles = arrayVehicles.filter(object => {
                    const dateReg = new Date(object.pass_date);
                    return dateReg.getTime() !== dateLastReg.getTime();
                  });
                
                if(newArrayVehicles.length >= 1){
                    const connectionDb = await axios.post(`http://${config.SERVER_URL}:3333/api/database/insertVehiclesFlow`, {vehicles : newArrayVehicles});
                }

            } catch (err) {

                console.log("Error on get camera data (cameraService):", err);
            }
    }

    setInterval(getCam, time * 1000);

    
}

module.exports.getDataCam = getDataCam;


