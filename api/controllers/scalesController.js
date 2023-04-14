const Joi = require('joi');
const ModbusRTU = require("modbus-serial");
const config = process.env;


class ScalesController {

    constructor() {
        this.data = {};
        this.client = new ModbusRTU();
        this.connected = false;
        this.connParameter = {};
        this.erroCom = false;
      }

    async connect() {
    
        const error = await new Promise((resolve) => {
          this.client.setTimeout(3500);
          this.client.connectTCP(this.connParameter.ip, { port: parseInt(this.connParameter.port) }, (error) => resolve(error));
          this.client.setID(parseInt(this.connParameter.id));
        });
        await this.onConnected(error);
      }
    
      async onConnected(error) {
        if (typeof (error) !== "undefined") {
          
          this.data = { "ip" : this.connParameter.ip, "id" : parseInt(this.connParameter.id), "error" : "no response from device!"};
          this.connected = false;
          console.log(error);
    
          if(error !== null || error !== undefined){
           this.erroCom = true;
          }
    
          return;
        }
    
        this.data = {}
        this.connected = true;

        var j = parseInt(this.connParameter.write);
          switch(j) {
            case 0:
              await this.read();
              break;
            case 6:
              await this.writeSingle();
              break;
            case 16:
              await this.writeMultiple();
              break;
            default:
              this.erroCom = true;
              this.data = {"error" : "write parameter is invalid!"};
          } 
      }
    
      async read() {
        const values = await new Promise((resolve) => {
            this.client.readHoldingRegisters(parseInt(this.connParameter.start), parseInt(this.connParameter.size), (error, values) => {
                if (error) {
                    console.log("Read registers error", error);
                    this.data = { ip : this.connParameter.ip, id : parseInt(this.connParameter.id), error: "on read registers, verify the addresses!", status: "Error" };
                } else {
                    this.data = Object.assign({}, values.data);
                }
    
                resolve(values);
                this.client.close();
            });
        });
    
        return values;
    }

    async weights(req, res) {

        const connModbus = {
            ip : config.IP_SCALES,
            port : config.PORT_SCALES,
            id : 1,
            start : 0,
            size : 10, 
            write : 0
          };

            try {
              this.connParameter = connModbus;
              const readReg = await this.connect();
                  if(this.erroCom){
                    res.status(500).json({ status: "Error"})
                  }else {

                    let rawDataActual = new ArrayBuffer(4);
                    let intViewActual = new Uint16Array(rawDataActual);
                    let fltViewActual = new Uint32Array(rawDataActual);

                    let rawDataLast = new ArrayBuffer(4);
                    let intViewLast = new Uint16Array(rawDataLast);
                    let fltViewLast = new Uint32Array(rawDataLast);

                    intViewActual[0] = this.data[0]; //low
                    intViewActual[1] = this.data[1]; //high

                    intViewLast[0] = this.data[2]; //low
                    intViewLast[1] = this.data[3]; //high

                    let dayString;
                    let monthString;
                    let hourString;
                    let minString;
                    let secondString;

                    if(this.data[4]<10){
                      dayString = '0'+this.data[4];
                    }else{
                      dayString = this.data[4];
                    }

                    if(this.data[5]<10){
                      monthString = '0'+this.data[5];
                    }else{
                      monthString = this.data[5];
                    }

                    if(this.data[7]<10){
                      hourString = '0'+this.data[7];
                    }else{
                      hourString = this.data[7];
                    }

                    if(this.data[8]<10){
                      minString = '0'+this.data[8];
                    }else{
                      minString = this.data[8];
                    }

                    if(this.data[9]<10){
                      secondString = '0'+this.data[9];
                    }else{
                      secondString = this.data[9];
                    }

                    const dateLastWeight = this.data[6]+'/'+monthString+'/'+dayString+" "+hourString+":"+minString+":"+secondString;
                    res.status(200).json({lastValidWeight : fltViewLast[0], dateValidWeight : dateLastWeight, actualWeight : fltViewActual[0] , unit: "Kg", status: "Ok" })
                  }  
              this.erroCom = false;
              } catch (error) {
                console.error(error)
                return res.sendStatus(500);
            }
          
    }


}

module.exports = new ScalesController()