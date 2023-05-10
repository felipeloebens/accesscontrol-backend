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

        this.dataAux = {};
        this.clientAux = new ModbusRTU();
        this.connectedAux = false;
        this.connParameterAux = {};
        this.erroComAux = false;
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
            default:
              this.erroCom = true;
              this.data = {"error" : "write parameter is invalid!"};
          } 
      }
    
      async read() {
        const values = await new Promise((resolve) => {
            this.client.readHoldingRegisters(parseInt(this.connParameter.start), parseInt(this.connParameter.size), (error, values) => {
                if (error) {
                    console.log("Read registers error scale port 502", error);
                    this.client.close();
                    this.data = { ip : this.connParameter.ip, id : parseInt(this.connParameter.id), error: "on read registers, verify the addresses!", status: "Error" };
                } else {
                    this.data = Object.assign({}, values.data);
                }
                resolve(values);
            });
        });
        this.client.close();
        return values;
    }


    async connectAux() {
      const error = await new Promise((resolve) => {
        this.clientAux.setTimeout(3500);
        this.clientAux.connectTCP(this.connParameterAux.ip, { port: parseInt(this.connParameterAux.port) }, (error) => resolve(error));
        this.clientAux.setID(parseInt(this.connParameterAux.id));
      });
      await this.onConnectedAux(error);
    }
  
    async onConnectedAux(error) {
      if (typeof (error) !== "undefined") {
        this.dataAux = { "ip" : this.connParameterAux.ip, "id" : parseInt(this.connParameterAux.id), "error" : "no response from device!"};
        this.connectedAux = false;
        console.log(error);
  
        if(error !== null || error !== undefined){
         this.erroComAux = true;
        }
  
        return;
      }
  
      this.dataAux = {}
      this.connectedAux = true;

      var j = parseInt(this.connParameterAux.write);
        switch(j) {
          case 0:
            await this.readAux();
            break;
          default:
            this.erroComAux = true;
            this.dataAux = {"error" : "write parameter is invalid!"};
        } 
    }
  
    async readAux() {
      const values = await new Promise((resolve) => {
          this.clientAux.readHoldingRegisters(parseInt(this.connParameterAux.start), parseInt(this.connParameterAux.size), (error, values) => {
              if (error) {
                  console.log("Read registers error scale port 503", error);
                  this.clientAux.close();
                  this.dataAux = { ip : this.connParameterAux.ip, id : parseInt(this.connParameterAux.id), error: "on read registers, verify the addresses!", status: "Error" };
              } else {
                  this.dataAux = Object.assign({}, values.data);
              }
              resolve(values);
          });
      });
      this.clientAux.close();
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


    async display(req, res) {
      const connModbus = {
          ip : config.IP_SCALES,
          port : config.PORT_SCALES_DISPLAY,
          id : 1,
          start : 0,
          size : 2, 
          write : 0
        };

          try {
            this.connParameterAux = connModbus;
            const readReg = await this.connectAux();
                if(this.erroComAux){
                  res.status(500).json({ status: "Error"})
                }else {

                  let rawDataActual = new ArrayBuffer(4);
                  let intViewActual = new Uint16Array(rawDataActual);
                  let fltViewActual = new Uint32Array(rawDataActual);

                  intViewActual[0] = this.data[0]; //low
                  intViewActual[1] = this.data[1]; //high

                  res.status(200).json({ actualWeight : fltViewActual[0] , unit: "Kg", status: "Ok" })
                }  
            this.erroComAux = false;
            } catch (error) {
              console.error(error)
              return res.sendStatus(500);
          }
        
  }


}

module.exports = new ScalesController()