const ldap = require('ldapjs');
const jwt = require("jsonwebtoken");
const domainAD = '@fockink.ind.br';
import CryptoJS from "crypto-js";
const config = process.env;


class LoginController{
    login(req,res){

        const usernameAd = CryptoJS.AES.decrypt(req.body.user, 'Secret user');
        const usernameAdOriginal = usernameAd.toString(CryptoJS.enc.Utf8);

        const passwordAd = CryptoJS.AES.decrypt(req.body.pass, 'Secret pass');
        const passwordOriginal = passwordAd.toString(CryptoJS.enc.Utf8);
        const client = ldap.createClient({
            url: [config.URL_AD],
            timeout: 5000,
            connectTimeout: 10000,
            tlsOptions: { rejectUnauthorized: false }
        });
   
        function errorForReturn(){   
            res.json({
                user : usernameAdOriginal,
                name : 'none',
                occupation : 'none',
                permission: 'N',
                levelAccess: 0,
            })    
        }

        const opts = {
            filter: '(&(sAMAccountName='+usernameAdOriginal+'))',
            scope: 'sub',
            // This attribute list is what broke your solution
            //attributes:['sAMAccountName','dn']
        };

        try {

            client.bind(usernameAdOriginal + domainAD, passwordOriginal, function (error) { //first need to bind
                if(error){
                    client.unbind(function(error) {
                        errorForReturn(); // retorna json sem permissão
                    });
                } else {
                    client.search('ou=Usuarios,dc=fockink,dc=local', opts, function(error, search) {   
                        search.on('searchEntry', function(entry) {
                            if(entry.object){
                                const token = jwt.sign(
                                    { user_id: usernameAdOriginal},
                                    "" + process.env.TOKEN_KEY,
                                    {
                                      expiresIn: "4h",
                                    }
                                  );
                                  
                                res.json({
                                    user : usernameAdOriginal,
                                    name : entry.object.name || entry.object.cn,
                                    occupation : entry.object.title,
                                    permission: 'S',
                                    levelAccess: 1,
                                    token: token
                                })
                            }
                            client.unbind(function(error) {

                            });
                        });
    
                        try{
                        search.on('error', function(error) {
                            client.unbind(function(error) {
                                return errorForReturn(); // retorna json sem permissão
                            });
                        });           
                    }catch(error){
                        res.json({
                            error : "Connection error with Windows AD",
                        })
                    }
                    });
                }
            });
        } catch(error){
            client.unbind(function(error) {
                errorForReturn(); // retorna json sem permissão
            });
        }
     }

     checkToken(req, res){

        req.body.token
        return res.status(200).json({permission : "S"});

     }
}

module.exports = new LoginController();