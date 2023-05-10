import axios from 'axios';
import timestampToDate from "../helpers/timestampToDate";
const config = process.env;



function getWeights(time){

    async function getScales(){

            try {

                const getLastRecord = await axios.get(`http://${config.SERVER_URL}:3333/api/database/listWeights`,{ headers : {last : true}});
                const dateLastReg = new Date(getLastRecord.data[0].pass_date);

                
                const getWeightsData = await axios.get(`http://${config.SERVER_URL}:3333/api/scales/weights`);
                const dateLastWeight = new Date(getWeightsData.data.dateValidWeight);

                if(timestampToDate(dateLastReg) !== timestampToDate(dateLastWeight)){
                    const connectionDb = await axios.post(`http://${config.SERVER_URL}:3333/api/database/insertWeight`, {
                        scales : "portaria",
                        weight : getWeightsData.data.lastValidWeight,
                        license : null,
                        pass_date : timestampToDate(dateLastWeight)
                    });
                }
                

            } catch (err) {

                console.log("Error on get weights (weightsService):", err);
            }
    }

    setInterval(getScales, time * 1000);

    
}

module.exports.getWeights = getWeights;


