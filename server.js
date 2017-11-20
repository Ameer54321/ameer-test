/**
 * Created by kiroshan on 2017/10/10.
 */
'use strict';
const Hapi = require('hapi');
const MySQL = require('mysql');
const Joi = require('joi');
const Bcrypt = require('bcrypt-nodejs');
const generatePassword = require('password-generator');
const emailClient = require('./email_client');

// Create a server with a host and port
const server = new Hapi.Server();
var port = process.env.PORT || 1337;

/*change below to false if in production*/
var istest = false;

// email configuration settings
const emailSettings = {
    api_key: 'njqRVZ3J9J3psHDoFjnTLQ'
}

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


/**
 *
 * Route to get all users
 *
 */
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


/**
 *
 * Route to get a single user by id
 *
 */
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


/**
 *
 *  Route to get all customers assigned to a specific sales rep
 *
 */
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

/**
 *
 * route to retrieve all current appointments for customer
 *
 */
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


/**
 *  Route to get all customer contacts
 *
 */
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
                    connection.query('SELECT first_name as name,last_name as surname,cellphone_number as cell,role,email FROM '+db+'.oc_customer_contact WHERE customer_id = "' + customer_id + '"',
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



/**
 *  Route to get all customer orders
 *
 * @method GET
 * @path /api/v1/customer/orders/{customer_id}/{c_id}
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/customer/orders/{customer_id}/{c_id}',
    handler: function (request, reply) {
        const customer_id = request.params.customer_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{
                    var db = results[0].companydb;
                    connection.query('SELECT od.order_id, od.order_status_id, cs.salesrep_id FROM '+db+'.oc_order od INNER JOIN '+db+'.oc_customer cs ON cs.customer_id = od.customer_id WHERE cs.customer_id = '+customer_id+' AND od.isReplogic=1',
                        function (error, results, fields) {
                            if (error) throw error;
                            var response = {
                                'status': 200,
                                'orders': results
                            };
                            reply(response);
                        });
                }
            });
    },
    config: {
        validate: {
            params: {
                customer_id: Joi.number().integer().required(),
                c_id: Joi.number().integer().required()
            }
        }
    }
});


/**
 *
 * Route to retrieve all current orders for the current month
 *
 */
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


/**
 *
 * Route to retrieve all pending orders for the current month
 *
 */
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


/**
 * Route to retrieve all orders
 *
 * @method GET
 * @params
 *          r_id <integer>  Sales rep id
 *          c_id <integer>  Company id
 * @path /api/v1/orders/{r_id}/{c_id}
 */
server.route({
    method: 'GET',
    path: '/api/v1/orders/{r_id}/{c_id}',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{
                    var db = results[0].companydb;
                    connection.query('SELECT od.order_id, od.order_status_id, cs.salesrep_id FROM '+db+'.oc_order od INNER JOIN '+db+'.oc_customer cs ON cs.customer_id = od.customer_id WHERE cs.salesrep_id = '+r_id+' AND od.isReplogic=1',
                        function (error, results, fields) {
                            if (error) throw error;

                            var response = {
                                'status': 200,
                                'orders': results
                            }
                            reply(response);
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



/**
 * Route to create new customer
 *
 * @method POST
 * @path /api/v1/customers/create
 */
server.route({
    method: 'POST',
    path: '/api/v1/customers/create',
    handler: function (request, reply) {
        const rep_id = request.payload.rep_id;
        const firstname = request.payload.firstname;
        const surname = request.payload.surname;
        const company_name = request.payload.company_name;
        const mobile_number = request.payload.mobile_number;
        const alt_contact_number = request.payload.alt_contact_number;
        const email = request.payload.email;

        connection.query('INSERT INTO dev.oc_replogic_customer (salesrep_id,firstname,lastname,company_name,mobile_number,alt_contact_number,email) VALUES ("' + rep_id + '", "' + firstname + '", "' + surname + '", "' + company_name + '", "' + mobile_number + '", "' + alt_contact_number + '", "' + email + '")',
            function (error, results, fields) {
                if (error) throw error;

                var response = {
                    'status': 200,
                    'message': 'customer created successfully',
                    'customer_id': results.insertId

                }
                reply(response);
            });
    },
    config: {
        validate: {
            payload: {
                rep_id: Joi.number().integer().required(),
                firstname: Joi.string().alphanum().required(),
                surname: Joi.string().alphanum().required(),
                company_name: Joi.string().alphanum().required(),
                mobile_number: Joi.string().alphanum().required(),
                alt_contact_number: Joi.string().alphanum(),
                email: Joi.string().email()
            }
        }
    }
});



/**
 * Route to create new customer contact
 *
 * @method POST
 * @path /api/v1/customers/contact/create
 */
server.route({
    method: 'POST',
    path: '/api/v1/customers/contact/create',
    handler: function (request, reply) {
        const customer_id = request.payload.customer_id;
        const firstname = request.payload.firstname;
        const surname = request.payload.surname;
        const mobile_number = request.payload.mobile_number;
        const telephone = request.payload.telephone;
        const email = request.payload.email;
        const role = request.payload.role;

        connection.query('INSERT INTO dev.oc_customer_contact (first_name,last_name,email,telephone_number,cellphone_number,customer_id,role) VALUES ("' + firstname + '", "' + surname + '", "' + email + '", "' + telephone + '", "' + mobile_number + '", "' + customer_id + '", "' + role + '")',
            function (error, results, fields) {
                if (error) throw error;

                var response = {
                    'status': 200,
                    'message': 'customer contact created successfully',
                    'customer_contact_id': results.insertId

                }
                reply(response);
            });
    },
    config: {
        validate: {
            payload: {
                customer_id: Joi.number().integer().required(),
                firstname: Joi.string().alphanum().required(),
                surname: Joi.string().alphanum().required(),
                mobile_number: Joi.string().alphanum().required(),
                telephone: Joi.string().alphanum().required(),
                email: Joi.string().email().required(),
                role: Joi.string().alphanum()
            }
        }
    }
});



/*
*
*
* route to add a new appointment
*
* */
server.route({
    method: 'POST',
    path: '/api/v1/create/appointment',
    handler: function (request, reply) {
        const title = request.payload.title;
        const c_id = request.payload.c_id;
        const r_id = request.payload.r_id;
        const customer_id = request.payload.customer_id;
        const appointmentdate = request.payload.appointmentdate;
        const duration_hours = request.payload.duration_hours;
        const duration_minutes = request.payload.duration_minutes;
        const description = request.payload.description;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{
                    var db = results[0].companydb;
                    connection.query('INSERT INTO '+db+'.oc_appointment (appointment_name,appointment_description,appointment_date,duration_hours,duration_minutes,salesrep_id,customer_id) VALUES ("' + title + '","' + description + '","' + appointmentdate + '",' + duration_hours + ',' + duration_minutes + ',' + r_id + ',' + customer_id + ')',
                        function (error, results, fields) {
                            if (error) throw error;
                            // console.log(fields);
                            var response = {
                                'status': 'success',
                                'message': 'appointment created successfully'

                            }
                            reply(results);
                        });
                }



            });

    }


     /*   connection.query('INSERT INTO user (username,email,password,salt) VALUES ("' + username + '","' + email + '","' + encryptedPassword + '","' + salt + '")',
            function (error, results, fields) {
                if (error) throw error;

                reply(results);
            });
    }*/
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
                    console.log(results);
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


/**
 * Route to register a sales rep
 * Sends a welcome email with new auto-generated login password
 *
 * @method POST
 * @path salesrep/register
 * @data:
 *          <company_id> Company id
 *          <rep_id> Sales rep id
 *          <username> Sales rep username
 *          <email> Sales rep email address
 */
server.route({
    method: 'POST',
    path: '/api/v1/salesrep/register',
    handler: function (request, reply) {

        const companyId = request.payload.company_id;
        const realId = request.payload.rep_id;
        const username = request.payload.username;
        const email = request.payload.email;
        const password = generatePassword(10, false);    // Auto-generate new password

        // Pass encryption
        var salt = Bcrypt.genSaltSync();
        var encryptedPassword = Bcrypt.hashSync(password, salt);

        connection.query('INSERT INTO user (username,email,password,salt, companyId, realId) VALUES ("' + username + '","' + email + '","' + encryptedPassword + '","' + salt + '", "' + companyId + '", "' + realId + '")',
            function (error, results, fields) {
                if (error) throw error;

                // if successful database insert, send email to sales rep
                if (results) {

                    // build email message object for the email to be sent to sales rep
                    var data = {
                        "html": "<h1>Welcome to Dashlogic!</h1><p>Your new password: " + password + "</p>",
                        "text": "Welcome to Dashlogic! Your new password: " + password,
                        "subject": "Welcome to Dashlogic",
                        "sender": "info@dashlogic.co.za",
                        "recipient": email
                    };

                    // send email to sales rep
                    emailClient.send(emailSettings.api_key, data, function(res) {
                        // email successfully sent
                        var response = {
                            "status": 200,
                            "user_id": results.insertId,
                            "message": "user created and email sent successfully",
                            "email_results": {
                                "status": res[0].status,
                                "id": res[0]._id,
                                "recipient": res[0].email,
                                "error": res[0].reject_reason
                            }
                        };
                        reply(response);
                    }, function(error) {
                        // email failed to send
                        var response = {
                            "status": 203,
                            "user_id": results.insertId,
                            "message": "user created but email failed to send",
                            "email_results": {
                                "status": "error",
                                "id": null,
                                "recipient": null,
                                "error": error.name + ': ' + error.message
                            }
                        };
                        reply(response);
                    });
                }
            });
    },
    config: {
        validate: {
            payload: {
                username: Joi.string().email(),
                email: Joi.string().email(),
                company_id: Joi.number().integer(),
                rep_id: Joi.number().integer()
            }
        }
    }
});


/**
 * Route to add a company
 * Returns newly created company id
 *
 * @method POST
 * @path /api/v1/company/create
 */
server.route({
    method: 'POST',
    path: '/api/v1/company/create',
    handler: function (request, reply) {
        const companyName = request.payload.company_name;
        const companyDb = request.payload.company_db;

        connection.query('INSERT INTO companies (companyname, companydb) VALUES ("' + companyName + '","' + companyDb + '")',
            function (error, results, fields) {
                if (error) throw error;

                var response = {
                    "status": 200,
                    "message": "company successfully created",
                    "company_id": results.insertId
                };
                reply(response);
            });
    }
});


/***********************************************************************************************************************
 *                                          Product Related API Routes
 ***********************************************************************************************************************/


/**
 * Route to list all products
 *
 * @method POST
 * @path /api/v1/products/{customer_id}/{r_id}/{c_id}
 */
server.route({
    method: 'GET',
    path: '/api/v1/products/{customer_id}/{r_id}/{c_id}/{category_id}',
    handler: function (request, reply) {
        const customerId = request.params.customer_id;
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;
        const category_id = request.params.category_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{

                    var db = results[0].companydb;
                    connection.query('SELECT pr.product_id, pd.name, pr.price FROM '+db+'.oc_product pr INNER JOIN '+db+'.oc_product_description pd ON pd.product_id=pr.product_id INNER JOIN '+db+'.oc_product_to_customer_group pc ON pc.product_id=pr.product_id INNER JOIN '+db+'.oc_customer cs ON cs.customer_group_id=pc.customer_group_id INNER JOIN '+db+'.oc_product_to_category ct ON ct.product_id=pr.product_id WHERE cs.customer_id='+customerId+' AND cs.salesrep_id='+r_id+' AND ct.category_id='+category_id+' GROUP BY pr.product_id',
                        function (error, results, fields) {
                            if (error) throw error;

                            var response = {
                                'status': 200,
                                'products': results
                            };
                            reply(response);
                        });
                }
            });
    }
});


/**
 * Route to list all product categories
 *
 * @method POST
 * @path /api/v1/products/{customer_id}/{r_id}/{c_id}/categories
 */
server.route({
    method: 'GET',
    path: '/api/v1/products/{customer_id}/{r_id}/{c_id}/categories',
    handler: function (request, reply) {
        const customerId = request.params.customer_id;
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{

                    var db = results[0].companydb;
                    connection.query('SELECT ct.category_id, cd.name, ct.parent_id FROM '+db+'.oc_category ct INNER JOIN '+db+'.oc_category_description cd ON cd.category_id=ct.category_id INNER JOIN '+db+'.oc_category_to_customer_group cc ON cc.category_id=ct.category_id INNER JOIN '+db+'.oc_customer cs ON cs.customer_group_id=cc.customer_group_id WHERE cs.customer_id='+customerId+' AND cs.salesrep_id='+r_id,
                        function (error, results, fields) {
                            if (error) throw error;

                            var response = {
                                'status': 200,
                                'categories': results
                            };
                            reply(response);
                        });
                }
            });
    }
});


server.start(function(err){
    if (err) {
    throw err;
}


console.log('Server running at:', server.info.uri);

});