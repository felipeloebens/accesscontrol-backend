import axios from 'axios';
const config = process.env;



function getDataCam(time){

    async function getCam(){

            try {
                const connectionCam = await axios.get('http://localhost:3333/api/cameras/',{ data : {db : true, "minutes" : 6000}});
                
                const arrayVehicles = connectionCam.data[1]['vehicles'];

                const connectionDb = await axios.post('http://localhost:3333/api/database/insertVehiclesFlow', {vehicles : arrayVehicles});
                console.log(connectionDb.data);

            } catch (err) {

                console.log("Error on get camera data (cameraService):", err);
            }
    }

    // setInterval(getCam, time * 1000);

    
}

module.exports.getDataCam = getDataCam;


