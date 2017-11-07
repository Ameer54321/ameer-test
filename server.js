/**
 * Created by kiroshan on 2017/10/10.
 */
'use strict';
const Hapi = require('hapi');
const MySQL = require('mysql');
const Joi = require('joi');
const Bcrypt = require('bcrypt');
// Create a server with a host and port
const server = new Hapi.Server();
var port = process.env.PORT || 1337;
/*change below to false if in production*/
var istest = false;

var host ='';
var user ='';
var password='';
var database ='';

if(istest == true){
    host = 'localhost';
    user = 'root';
    database = 'super';

}else{
    host = '139.59.187.168';
    user = 'root';
    password = 'R6V08zZhJt';
    database = 'super';
}
const connection = MySQL.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
});
server.connection({
    port: port
});

connection.connect();

/* re-usable functions */


/* define api routes */
server.route({
    method: 'GET',
    path: '/user/all',
    handler: function (request, reply) {
        connection.query('SELECT * FROM dev.oc_customer',
            function (error, results, fields) {
                if (error) throw error;

                reply(results);
            });
    }
});

server.route({
    method: 'GET',
    path: '/user/{uid}',
    handler: function (request, reply) {
        const uid = request.params.uid;

        connection.query('SELECT uid, username, email FROM user WHERE uid = "' + uid + '"',
            function (error, results, fields) {
                if (error) throw error;

                reply(results);
            });
    },
    config: {
        validate: {
            params: {
                uid: Joi.number().integer()
            }
        }
    }
});
/*
*  Route to get all customers assigned to a specific sales rep
*
* */
server.route({
    method: 'GET',
    path: '/api/v1/customers/{r_id}/{c_id}',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{
                    var db = results[0].companydb;
                    connection.query('SELECT customer_id,firstname as name,email,telephone FROM '+db+'.oc_customer WHERE salesrep_id = "' + r_id + '"',
                        function (error, results, fields) {
                            if (error) throw error;
                           // console.log(fields);
                            reply(results);
                        });
                }



            });

    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer(),
                c_id: Joi.number().integer()
            }
        }
    }
});

/*
 *
 * route to retrieve all current appointments for customer
 *
 * */
server.route({
    method: 'GET',
    path: '/api/v1/customer/appointments/{customer_id}/{r_id}/{c_id}',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;
        const customer_id = request.params.customer_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{
                    var db = results[0].companydb;
                    connection.query('SELECT ap.appointment_id,cs.firstname as customer_name,ap.appointment_date,ad.address_1,ad.address_2,ad.city,ad.postcode,nt.note_id,nt.note_content FROM '+db+'.oc_appointment ap left join '+db+'.oc_customer cs on cs.customer_id = ap.customer_id left join '+db+'.oc_address ad on ad.address_id = cs.address_id left join '+db+'.oc_notes nt on nt.appointment_id = ap.appointment_id WHERE ap.salesrep_id = '+r_id+' AND cs.customer_id ='+customer_id+' AND DATE_FORMAT(ap.appointment_date,"%Y-%m-%d") >= DATE_FORMAT(NOW(),"%Y-%m-%d")',
                        function (error, results, fields) {
                            if (error) throw error;
                            // console.log(fields);
                            reply(results);
                        });
                }



            });

    },
    config: {
        validate: {
            params: {
                customer_id: Joi.number().integer(),
                r_id: Joi.number().integer(),
                c_id: Joi.number().integer()

            }
        }
    }
});

/*
 *  Route to get all customer contacts
 *
 * */
server.route({
    method: 'GET',
    path: '/api/v1/customer/contacts/{customer_id}/{c_id}',
    handler: function (request, reply) {
        const customer_id = request.params.customer_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{
                    var db = results[0].companydb;
                    connection.query('SELECT * FROM '+db+'.oc_customer_contact WHERE customer_id = "' + customer_id + '"',
                        function (error, results, fields) {
                            if (error) throw error;
                            // console.log(fields);
                            reply(results);
                        });
                }



            });

    },
    config: {
        validate: {
            params: {
                customer_id: Joi.number().integer(),
                c_id: Joi.number().integer()
            }
        }
    }
});

/*
*
* Route to retrieve all current orders for the current month
*
* */

server.route({
    method: 'GET',
    path: '/api/v1/orders/{r_id}/{c_id}/total/current',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{
                    var db = results[0].companydb;
                    connection.query('SELECT od.order_id,od.customer_id,od.total,od.date_added FROM '+db+'.oc_order od inner join '+db+'.oc_customer cs on cs.customer_id = od.customer_id WHERE cs.salesrep_id = '+r_id+' AND DATE_FORMAT(od.date_added,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m")',
                        function (error, results, fields) {
                            if (error) throw error;
                            // console.log(fields);
                            reply(results);
                        });
                }



            });

    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer(),
                c_id: Joi.number().integer()
            }
        }
    }
});
/*
 *
 * Route to retrieve all pending orders for the current month
 *
 * */

server.route({
    method: 'GET',
    path: '/api/v1/orders/{r_id}/{c_id}/total/pending',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{
                    var db = results[0].companydb;
                    connection.query('SELECT od.order_id,od.customer_id,od.total,od.date_added FROM '+db+'.oc_order od inner join '+db+'.oc_customer cs on cs.customer_id = od.customer_id WHERE cs.salesrep_id = '+r_id+' AND DATE_FORMAT(od.date_added,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m") AND od.order_status_id = 1',
                        function (error, results, fields) {
                            if (error) throw error;
                            // console.log(fields);
                            reply(results);
                        });
                }



            });

    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer(),
                c_id: Joi.number().integer()
            }
        }
    }
});
/*
*
* route to retrieve all proccessed orders for the month
*
* */
server.route({
    method: 'GET',
    path: '/api/v1/orders/{r_id}/{c_id}/total/processed',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{
                    var db = results[0].companydb;
                    connection.query('SELECT od.order_id,od.customer_id,od.total,od.date_added FROM '+db+'.oc_order od inner join '+db+'.oc_customer cs on cs.customer_id = od.customer_id WHERE cs.salesrep_id = '+r_id+' AND DATE_FORMAT(od.date_added,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m") AND od.order_status_id = 15',
                        function (error, results, fields) {
                            if (error) throw error;
                            // console.log(fields);
                            reply(results);
                        });
                }



            });

    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer(),
                c_id: Joi.number().integer()
            }
        }
    }
});

/*
 *
 * route to retrieve all appointments for today
 *
 * */
server.route({
    method: 'GET',
    path: '/api/v1/appointments/{r_id}/{c_id}/today',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{
                    var db = results[0].companydb;
                    connection.query('SELECT ap.appointment_id,cs.firstname as customer_name,ap.appointment_date,ad.address_1,ad.address_2,ad.city,ad.postcode,nt.note_id,nt.note_content FROM '+db+'.oc_appointment ap left join '+db+'.oc_customer cs on cs.customer_id = ap.customer_id left join '+db+'.oc_address ad on ad.address_id = cs.address_id left join '+db+'.oc_notes nt on nt.appointment_id = ap.appointment_id WHERE ap.salesrep_id = '+r_id+' AND DATE_FORMAT(ap.appointment_date,"%Y-%m-%d") = DATE_FORMAT(NOW(),"%Y-%m-%d")',
                        function (error, results, fields) {
                            if (error) throw error;
                            // console.log(fields);
                            reply(results);
                        });
                }



            });

    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer(),
                c_id: Joi.number().integer()
            }
        }
    }
});

 server.route({
    method: 'DELETE',
    path: '/message/{uid}/{mid}',
    handler: function (request, reply) {
        const uid = request.params.uid;
        const mid = request.params.mid;
        connection.query('DELETE FROM messages WHERE uid_fk = "' + uid + '"AND mid = "' + mid + '"',
        function (error, result, fields) {
            if (error) throw error;

            if (result.affectedRows) {
                reply(true);
            } else {
                reply(false);
            }
        });
    },
    config: {
        validate: {
            params: {
                uid: Joi.number().integer(),
                mid: Joi.number().integer()
            }
        }
    }
});

/*
* Route to validate user login
*
* */
server.route({
    method: 'POST',
    path: '/api/v1/user/login',
    handler: function (request, reply){
        const username = request.payload.username;
        const password = request.payload.password;

        connection.query('SELECT uid,salt,password,companyId,realId FROM user WHERE username ="'+username+'"',function(error, results, fields){
            if(error){
                throw error;
            }else{
                var orgPassword = Bcrypt.compareSync(password, results[0].password);
                if(orgPassword === true){

                    var response = {
                        'status': 200,
                        'message': 'login succesful',
                        'c_id': results[0].companyId,
                        'uid' : results[0].uid,
                        'r_id': results[0].realId
                    }
                    reply(response);
                }else{
                    var response = {
                        'response': 400,
                        'message': 'Incorrect username and password'
                    }
                    reply(response);
                }

            }
        });
    }

});

/*
* Route to register users
*
* */
server.route({
    method: 'POST',
    path: '/api/v1/register',
    handler: function (request, reply) {
        const username = request.payload.username;
        const email = request.payload.email;
        const password = request.payload.password;

        //Encryption
        var salt = Bcrypt.genSaltSync();
        var encryptedPassword = Bcrypt.hashSync(password, salt);

        //Decrypt
        var orgPassword = Bcrypt.compareSync(password, encryptedPassword);

        connection.query('INSERT INTO user (username,email,password,salt) VALUES ("' + username + '","' + email + '","' + encryptedPassword + '","' + salt + '")',
        function (error, results, fields) {
            if (error) throw error;

            reply(results);
        });
    },
    config: {
        validate: {
            payload: {
                username: Joi.string().alphanum().min(3).max(30).required(),
                email: Joi.string().email(),
                password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/)
            }
        }
    }
});



server.start(function(err){
    if (err) {
    throw err;
}


console.log('Server running at:', server.info.uri);

});