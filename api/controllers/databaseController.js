const Joi = require('joi');
const oracledb = require('oracledb');
const config = process.env;
import timestampToDate from "../../helpers/timestampToDate";

function connectDatabase(){
    const conn = oracledb.getConnection({
        user: config.USER_ORACLE,
        password: config.PASS_ORACLE,
        connectString: config.STRING_ORACLE
    });
    return conn;
}

class DatabaseController {

    async listFlow(req, res) {
    
        let connection;
        let data;

        try {
            connection = await connectDatabase();
        } catch (err) {
            return res.status(500).json({error : err.message});
        } finally {
            if (connection) {
                
                if(req.headers.last === "true"){
                    data = await connection.execute(`SELECT * FROM ADMPESAGEM.VEHICLES_FLOW WHERE ID=(select max(ID) FROM ADMPESAGEM.VEHICLES_FLOW)	`);
                }else if(req.headers.startdate && req.headers.finaldate ){
                    data = await connection.execute(`SELECT * FROM ADMPESAGEM.VEHICLES_FLOW WHERE PASS_DATE BETWEEN TO_DATE('${req.headers.startdate}', 'YYYY/MM/DD HH24:MI:SS') AND TO_DATE('${req.headers.finaldate}', 'YYYY/MM/DD HH24:MI:SS') ORDER BY PASS_DATE DESC`);
                }else{
                    data = await connection.execute(`SELECT * FROM ADMPESAGEM.VEHICLES_FLOW`);
                }
                let returnData = [];

                data.rows.forEach(object => {
                    let way;
                    if(object[4] === "entering"){
                        way = "Entrando";
                    }
                    returnData.push({
                        id: object[0],
                        license: object[1].toUpperCase(),
                        id_gate: object[2],
                        pass_date: timestampToDate(object[3]),
                        way: way,
                    })
                });

                return res.status(200).json(returnData);
            try {
                await connection.close(); 
            } catch (err) {
                return res.status(500).json({error : err.message});
            }
            }
        }
    }

    async listWeights(req, res) {
    
        let connection;
        let data;

        try {
            connection = await connectDatabase();
        } catch (err) {
            return res.status(500).json({error : err.message});
        } finally {
            if (connection) {

                if(req.headers.last === "true"){
                    data = await connection.execute(`SELECT * FROM ADMPESAGEM.SCALES WHERE ID=(select max(ID) FROM ADMPESAGEM.SCALES)`);
                }else if(req.headers.startdate && req.headers.finaldate){
                    data = await connection.execute(`SELECT * FROM ADMPESAGEM.SCALES WHERE PASS_DATE BETWEEN TO_DATE('${req.headers.startdate}', 'YYYY/MM/DD HH24:MI:SS') AND TO_DATE('${req.headers.finaldate}', 'YYYY/MM/DD HH24:MI:SS') ORDER BY PASS_DATE DESC`);
                }else{
                    data = await connection.execute(`SELECT * FROM ADMPESAGEM.SCALES`);
                }
                let returnData = [];

                data.rows.forEach(object => {
                    returnData.push({
                        id: object[0],
                        scales: object[1],
                        weight: object[2]+ " Kg",
                        license: object[3],
                        pass_date: timestampToDate(object[4]),
                        
                    })
                });

                return res.status(200).json(returnData);
            try {
                await connection.close(); 
            } catch (err) {
                return res.status(500).json({error : err.message});
            }
            }
        }
    }

    async listGates(req, res) {
    
        let connection

        try {
            connection = await connectDatabase();
        } catch (err) {
            return res.status(500).json({error : err.message});
        } finally {
            if (connection) {
                const data = await connection.execute(`SELECT * FROM ADMPESAGEM.GATES`,);
                let returnData = [];

                data.rows.forEach(object => {
                    returnData.push({
                        id: object[0],
                        location: object[1],
                        name: object[2],
                        camera_ip: object[3],
                        camera_mac: object[4],
                    })
                });

                return res.status(200).json(returnData);
            try {
                await connection.close(); 
            } catch (err) {
                return res.status(500).json({error : err.message});
            }
            }
        }
    }

    async insertGate(req, res) {
    
        let connection
        try {
            connection = await connectDatabase();
        } catch (err) {
            return res.status(500).json({error : err.message});
        } finally {
            if (connection) {
                const data = await connection.execute(`INSERT INTO ADMPESAGEM.GATES VALUES(:id, :location, :name, :camera_ip, :camera_mac)`, [null , req.body.location, req.body.name, req.body.camera_ip, req.body.camera_mac], {autoCommit: true});
                return res.status(200).json(data);
            try {
                await connection.close(); 
            } catch (err) {
                return res.status(500).json({error : err.message});
            }
            }
        }
    }

    async insertWeight(req, res) {
    
        let connection

        try {
            connection = await connectDatabase();
        } catch (err) {
            return res.status(500).json({error : err.message});
        } finally {
            if (connection) {
                const data = await connection.execute(`INSERT INTO ADMPESAGEM.SCALES VALUES(:id, :scales, :weight, :license, TO_DATE(:pass_date, 'YYYY/MM/DD HH24:MI:SS'))`, [null , req.body.scales, req.body.weight, req.body.license, req.body.pass_date], {autoCommit: true});
                return res.status(200).json(data);
            try {
                await connection.close(); 
            } catch (err) {
                return res.status(500).json({error : err.message});
            }
            }
        }
    }

    
    async updateWeight(req, res) {
    
        let connection
        try {
            connection = await connectDatabase();
        } catch (err) {
            return res.status(500).json({error : err.message});
        } finally {
            if (connection) {
                const data = await connection.execute(`UPDATE ADMPESAGEM.SCALES SET license=:license WHERE id=:id`, {id : req.body.id, license : req.body.license}, {autoCommit: true});
                return res.status(200).json(data);
            try {
                await connection.close(); 
            } catch (err) {
                return res.status(500).json({error : err.message});
            }
            }
        }
    }

    async insertVehiclesFlow(req, res) {
    
        // const testInsert = { id : null, license : req.headers.license, id_gate : req.headers.id_gate, pass_date : req.headers.pass_date, way : req.headers.way};
        let connection

        try {
            connection = await connectDatabase();
        } catch (err) {
            return res.status(500).json({error : err.message});
        } finally {
            if (connection && req.body.vehicles) {
                console.log(req.body.vehicles);
                const data = await connection.executeMany(`INSERT INTO ADMPESAGEM.VEHICLES_FLOW VALUES(:id, :license, :id_gate, TO_DATE(:pass_date, 'YYYY/MM/DD HH24:MI:SS'), :way)`, req.body.vehicles, {autoCommit: true});
                return res.status(200).json(data);
            try {
                await connection.close(); 
            } catch (err) {
                return res.status(500).json({error : err.message});
            }
            }else{
                return res.status(500).json({error : "verify parameters on JSON!"});
            }
        }
    }

}

module.exports = new DatabaseController()