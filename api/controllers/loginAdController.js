const ldap = require('ldapjs');
const jwt = require("jsonwebtoken");
const domainAD = '@fockink.ind.br';
const config = process.env;

class LoginController{
    login(req,res){
        const client = ldap.createClient({
            url: [config.URL_AD],
            timeout: 5000,
            connectTimeout: 10000,
            tlsOptions: { rejectUnauthorized: false }
        });
   
        function errorForReturn(){   
            res.json({
                user : req.body.user,
                name : 'none',
                occupation : 'none',
                permission: 'N',
                levelAccess: 0,
            })    
        }

        const opts = {
            filter: '(&(sAMAccountName='+req.body.user+'))',
            scope: 'sub',
            // This attribute list is what broke your solution
            //attributes:['sAMAccountName','dn']
        };

        try {
            client.bind(req.body.user + domainAD, req.body.pass, function (error) { //first need to bind
                if(error){
                    client.unbind(function(error) {
                        errorForReturn(); // retorna json sem permissão
                    });
                } else {
                    client.search('ou=Usuarios,dc=fockink,dc=local', opts, function(error, search) {   
                        search.on('searchEntry', function(entry) {
                            if(entry.object){
                                const token = jwt.sign(
                                    { user_id: req.body.user},
                                    "" + process.env.TOKEN_KEY,
                                    {
                                      expiresIn: "4h",
                                    }
                                  );
                                  
                                res.json({
                                    user : req.body.user,
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
    
                        search.on('error', function(error) {
                            client.unbind(function(error) {
                                return errorForReturn(); // retorna json sem permissão
                            });
                        });           
                    });
                }
            });
        } catch(error){
            client.unbind(function(error) {
                errorForReturn(); // retorna json sem permissão
            });
        }

     }
}

module.exports = new LoginController();