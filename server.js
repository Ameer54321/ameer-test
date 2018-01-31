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
const comms = require('./comm-functions');
const geonoder = require('geonoder');
const parser = require('json-parser');
// const generatePdf = require('./generate-pdf');

// Create a server with a host and port
const server = new Hapi.Server();
var corsHeaders = require('hapi-cors-headers');
var port = process.env.PORT || 1337;

/*change below to false if in production*/
var istest = false;

// email configuration settings
const emailSettings = {
    api_key: 'njqRVZ3J9J3psHDoFjnTLQ'
};

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
    port: port,
    routes: { cors: true }
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

                    if (results.length > 0) {

                        var db = results[0].companydb;
                        connection.query('SELECT customer_id,firstname as name,email,telephone FROM '+db+'.oc_customer WHERE salesrep_id = "' + r_id + '"',
                            function (error, results, fields) {
                                if (error) throw error;

                                reply(results);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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

                    if (results.length > 0) {

                        var db = results[0].companydb;
                        connection.query('SELECT ap.appointment_id,ap.appointment_name,ap.appointment_description,cs.firstname as customer_name,ap.appointment_date,ad.address_1,ad.address_2,ad.city,ad.postcode,ap.duration_hours,ap.duration_minutes,nt.note_id,nt.note_content FROM '+db+'.oc_appointment ap left join '+db+'.oc_customer cs on cs.customer_id = ap.customer_id left join '+db+'.oc_address ad on ad.address_id = cs.address_id left join '+db+'.oc_notes nt on nt.appointment_id = ap.appointment_id WHERE ap.salesrep_id = '+r_id+' AND cs.customer_id ='+customer_id+' AND DATE_FORMAT(ap.appointment_date,"%Y-%m-%d") >= DATE_FORMAT(NOW(),"%Y-%m-%d")',
                            function (error, results, fields) {
                                if (error) throw error;

                                reply(results);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('SELECT customer_con_id AS contact_id,first_name AS name,last_name AS surname,cellphone_number AS cell,role,email FROM '+db+'.oc_customer_contact WHERE customer_id='+customer_id,
                            function (error, results, fields) {
                                if (error) throw error;

                                reply(results);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('SELECT od.order_id,od.order_status_id,cs.salesrep_id,od.date_added,FORMAT(od.total,2) AS order_total,cs.firstname AS customer_name,CONCAT(cc.first_name," ",cc.last_name) AS contact_name FROM '+db+'.oc_order od INNER JOIN '+db+'.oc_customer cs ON cs.customer_id=od.customer_id LEFT JOIN '+db+'.oc_replogic_order_quote oq ON oq.order_id=od.order_id LEFT JOIN '+db+'.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id WHERE cs.customer_id='+customer_id+' AND od.isReplogic=1',
                            function (error, results, fields) {
                                if (error) throw error;
                                var response = {
                                    'status': 200,
                                    'orders': results
                                };
                                reply(response);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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
 *  Route to get all customer quotes
 *
 * @method GET
 * @path /api/v1/customer/quotes/{customer_id}/{c_id}
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/customer/quotes/{customer_id}/{c_id}',
    handler: function (request, reply) {
        const customer_id = request.params.customer_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('SELECT oq.quote_id,oq.status,oq.date_added,oq.cart,cs.firstname AS customer_name,CONCAT(cc.first_name, " ", cc.last_name) AS contact_name FROM '+db+'.oc_replogic_order_quote oq INNER JOIN '+db+'.oc_customer cs ON cs.customer_id=oq.customer_id INNER JOIN '+db+'.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id WHERE oq.status IN (0,2) AND cs.customer_id='+customer_id,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    for (var i=0; i<results.length; i++) {
                                        results[i].cart = parser.parse(results[i].cart);
                                    }
                                    var response = {
                                        'status': 200,
                                        'quotes': results
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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
 *  Route to get single customer details
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/customer/{customer_id}/{c_id}',
    handler: function (request, reply) {
        const customer_id = request.params.customer_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {
                        var db = results[0].companydb;
                        connection.query('SELECT cs.firstname,cs.lastname,cs.email,cs.telephone,cs.fax,cs.address_id,ca.address_1,ca.address_2,ca.city,ca.postcode FROM ' + db + '.oc_customer cs INNER JOIN ' + db + '.oc_address ca ON ca.address_id=cs.address_id WHERE cs.customer_id=' + customer_id,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {
                                    var response = {
                                        'status': 200,
                                        'customer': results[0]
                                    };
                                    reply(response);
                                }
                            });
                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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
 *  Route to update customer details
 *
 */
server.route({
    method: 'PUT',
    path: '/api/v1/customer',
    handler: function (request, reply) {
        const customer_id = request.payload.customer_id;
        const c_id = request.payload.c_id;
        const email = request.payload.email;
        const telephone = request.payload.telephone;
        const fax = request.payload.fax;
        const address_id = request.payload.address_id;
        const address_1 = request.payload.address_1;
        const address_2 = request.payload.address_2;
        const city = request.payload.city;
        const postcode = request.payload.postcode;

        connection.query('SELECT companydb FROM super.companies WHERE company_id=' + c_id,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('UPDATE ' + db + '.oc_customer SET email="' + email + '",telephone="' + telephone + '",fax="' + fax + '" WHERE customer_id=' + customer_id,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    connection.query('UPDATE ' + db + '.oc_address SET address_1="' + address_1 + '",address_2="' + address_2 + '",city="' + city + '",postcode="' + postcode + '" WHERE address_id=' + address_id,
                                        function (error, results, fields) {
                                            if (error) {
                                                throw error;
                                            } else {
                                                var response = {
                                                    'status': 200,
                                                    'message': 'successfully updated customer details'
                                                };
                                                reply(response);
                                            }
                                        });
                                }
                            });
                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            payload: {
                customer_id: Joi.number().integer().required(),
                c_id: Joi.number().integer().required(),
                email: Joi.string().email().required(),
                telephone: Joi.string().required(),
                fax: Joi.string(),
                address_id: Joi.number().integer().required(),
                address_1: Joi.string().required(),
                address_2: Joi.string(),
                city: Joi.string().required(),
                postcode: Joi.string().required()
            }
        }
    }
});


/***********************************************************************************************************************
 *                                          Order Related API Routes
 ***********************************************************************************************************************/


/**
 *
 * Route to create an order [quote]
 */
server.route({
    method: 'POST',
    path: '/api/v1/orders/create',
    handler: function(request, reply) {
        const r_id = request.payload.r_id;
        const c_id = request.payload.c_id;
        const customer_id = request.payload.customer_id;
        const contact_id = request.payload.contact_id;
        const cart = request.payload.cart;

        connection.query('SELECT companydb, companyname FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        const companyName = results[0].companyname;
                        const db = results[0].companydb;
                        const cartJson = JSON.stringify(cart);

                        // insert order quote information
                        connection.query("INSERT INTO "+db+".oc_replogic_order_quote (salesrep_id, customer_id, customer_contact_id, cart, date_added) VALUES ("+r_id+", "+customer_id+", "+contact_id+", '"+cartJson+"', NOW())",
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                  // get newly inserted quote id
                                  const quote_id = results.insertId;

                                  // get company config settings [address, email, logo, name]
                                  connection.query('SELECT st.key, st.value FROM '+db+'.oc_setting st WHERE st.key="config_address" OR st.key="config_email" OR st.key="config_image" OR st.key="config_name"',
                                  function (error, results, fields) {
                                      if (error) {
                                          throw error;
                                      } else {

                                          // company details
                                          const company = {};
                                          for (var i=0; i<results.length; i++) {
                                              if (results[i].value.length > 0) {
                                                  var key = results[i].key.replace('config_', '');
                                                  company[key] = results[i].value;
                                              }
                                          }

                                          // build select query
                                          var query = "";
                                          query += "SELECT qt.quote_id,qt.cart,DATE_FORMAT(qt.date_added, '%M %d, %Y') AS quote_date,";
                                          query += "CONCAT(rp.salesrep_name, ' ',rp.salesrep_lastname) AS rep_name,rp.email AS rep_email,";
                                          query += "cs.firstname AS customer_name,cs.email AS customer_email,CONCAT(cc.first_name, ' ',cc.last_name) AS cust_contact_name,ca.address_1,";
                                          query += "ca.address_2,ca.city,'South Africa' AS country,ca.postcode,rm.email AS manager_email ";
                                          query += "FROM "+db+".oc_replogic_order_quote qt ";
                                          query += "INNER JOIN "+db+".oc_salesrep rp ON rp.salesrep_id=qt.salesrep_id ";
                                          query += "INNER JOIN "+db+".oc_customer cs ON cs.customer_id=qt.customer_id ";
                                          query += "INNER JOIN "+db+".oc_customer_contact cc ON cc.customer_con_id=qt.customer_contact_id ";
                                          query += "INNER JOIN "+db+".oc_address ca ON ca.address_id=cs.address_id ";
                                          query += "INNER JOIN "+db+".oc_team rt ON rt.team_id=rp.sales_team_id ";
                                          query += "INNER JOIN "+db+".oc_user rm ON rm.user_id=rt.sales_manager ";
                                          query += "WHERE qt.quote_id="+quote_id;

                                          // get customer email from database to send order confirmation
                                          connection.query(query,
                                              function (error, results, fields) {
                                                  if (error) {
                                                      throw error;
                                                  } else {
                                                      if (results.length > 0) {

                                                          // customer
                                                          var customer = {
                                                              name: results[0].customer_name,
                                                              email: results[0].customer_email,
                                                              contact: {
                                                                  name: results[0].cust_contact_name
                                                              },
                                                              address: {
                                                                  line1: results[0].address_1,
                                                                  line2: results[0].address_2,
                                                                  city: results[0].city,
                                                                  country: results[0].country,
                                                                  postcode: results[0].postcode
                                                              }
                                                          };
                                                          var cart = parser.parse(results[0].cart);
                                                          var rep = {name: results[0].rep_name, email:results[0].rep_email};
                                                          var quote = {
                                                              number: results[0].quote_id,
                                                              total: (cart.cart_total_incl_vat !== undefined) ? cart.cart_total_incl_vat.toFixed(2) : cart.cart_total_price.toFixed(2),
                                                              url: 'http://dashbundle.co.za/emails/quote-online.html?id='+quote_id+'&cid='+c_id,
                                                              date: results[0].quote_date,
                                                              products: cart.cart_items,
                                                              total_excl_vat: cart.cart_total_price.toFixed(2),
                                                              total_incl_vat: (cart.cart_total_incl_vat !== undefined) ? cart.cart_total_incl_vat.toFixed(2) : cart.cart_total_price.toFixed(2),
                                                              vat: (cart.cart_total_vat !== undefined) ? cart.cart_total_vat.toFixed(2) : 0.00.toFixed(2)
                                                          };
                                                          var manager = {email: results[0].manager_email};
                                                          comms.sendQuoteEmails(customer, manager, company, rep, quote, reply);
                                                      } else {
                                                          var response = {
                                                              status: 200,
                                                              quote_id: quote_id,
                                                              message: 'Emails could not be sent!'
                                                          }
                                                          reply(response);
                                                      }
                                                  }
                                              });
                                          }
                                      });
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            payload: {
                r_id: Joi.number().integer().required(),
                c_id: Joi.number().integer().required(),
                customer_id: Joi.number().integer().required(),
                contact_id: Joi.number().integer().required(),
                cart: Joi.object().required()
            }
        }
    }
});



/**
 *
 * Route to retrieve all order quotes
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/orders/{r_id}/{c_id}/quotes',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;
        const filter = request.url.query;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = ' + c_id,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // build select query filter
                        var query = '';
                        if (filter.quote_id !== undefined) {
                            // filter by quote id
                            query += ' AND oq.quote_id='+filter.quote_id;
                        }
                        if (filter.date_added !== undefined) {
                            // filter by date added
                            query += ' AND DATE(oq.date_added) = STR_TO_DATE("'+filter.date_added+'", "%Y-%m-%d")';
                        }
                        if (filter.customer_name !== undefined) {
                            // filter by date added
                            query += ' AND (cs.firstname="'+filter.customer_name+'" OR cs.lastname="'+filter.customer_name+'")';
                        }

                        // query database
                        connection.query('SELECT oq.quote_id,oq.status,oq.cart,oq.date_added,cs.firstname AS customer_name,CONCAT(cc.first_name, " ", cc.last_name) AS contact_name FROM '+db+'.oc_replogic_order_quote oq INNER JOIN '+db+'.oc_customer cs ON cs.customer_id=oq.customer_id INNER JOIN '+db+'.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id WHERE oq.status IN (0,2) AND oq.salesrep_id='+r_id+' '+query,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    for (var i=0; i<results.length; i++) {
                                        results[i].cart = parser.parse(results[i].cart);
                                    }
                                    var response = {
                                        status: 200,
                                        order_quotes: results
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer().required(),
                c_id: Joi.number().integer().required()
            }
        }
    }
});



/**
 *
 * Route to retrieve single order quote details
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/orders/{c_id}/quotes/{quote_id}',
    handler: function (request, reply) {
        const c_id = request.params.c_id;
        const quote_id = request.params.quote_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = ' + c_id,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        const db = results[0].companydb;

                        connection.query('SELECT st.key, st.value FROM '+db+'.oc_setting st WHERE st.key="config_address" OR st.key="config_email" OR st.key="config_image" OR st.key="config_name"', function (error, results, fields) {
                            if (error) {
                                throw error;
                            } else {

                                const company = {};
                                for (var i=0; i<results.length; i++) {
                                    if (results[i].value.length > 0) {
                                        var key = results[i].key.replace('config_', '');
                                        company[key] = results[i].value;
                                    }
                                }
                                var query = '';
                                query += 'SELECT oq.quote_id,oq.status,oq.date_added,oq.cart,cs.email,cs.telephone,CONCAT(ca.address_1," ",ca.address_2," ",ca.city," ",postcode) AS customer_address,';
                                query += 'cs.firstname AS customer_name,CONCAT(cc.first_name, " ", cc.last_name) AS contact_name,ca.address_1 AS customer_addr1,ca.address_2 AS customer_addr2,';
                                query += 'IF(ca.country_id=193, "South Africa","") AS customer_country,ca.city AS customer_city,ca.postcode  AS customer_postcode,CONCAT(sr.salesrep_name," ",sr.salesrep_lastname) AS rep_name ';
                                query += 'FROM '+db+'.oc_replogic_order_quote oq ';
                                query += 'INNER JOIN '+db+'.oc_salesrep sr ON sr.salesrep_id=oq.salesrep_id ';
                                query += 'INNER JOIN '+db+'.oc_customer cs ON cs.customer_id=oq.customer_id ';
                                query += 'INNER JOIN '+db+'.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id ';
                                query += 'INNER JOIN '+db+'.oc_address ca ON ca.customer_id=cs.customer_id ';
                                query += 'INNER JOIN '+db+'.oc_rep_settings rs ON rs.company_id='+c_id+' ';
                                query += 'WHERE oq.quote_id='+quote_id;
                                connection.query(query,
                                    function (error, results, fields) {
                                        if (error) {
                                            throw error;
                                        } else {
                                            results[0].cart = parser.parse(results[0].cart);
                                            var response = {
                                                status: 200,
                                                order_quotes: results,
                                                company: company
                                            };
                                            reply(response);
                                        }
                                    });
                            }
                        });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                quote_id: Joi.number().integer().required(),
                c_id: Joi.number().integer().required()
            }
        }
    }
});



/**
 *
 * Route to retrieve number of quotes awaiting approval
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/orders/{r_id}/{c_id}/quotes/count/pending',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = ' + c_id,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // quotes awaiting approval
                        connection.query('SELECT COUNT(oq.quote_id) AS qty FROM '+db+'.oc_replogic_order_quote oq WHERE oq.status=0 AND oq.salesrep_id='+r_id+' AND DATE_FORMAT(oq.date_added,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m")',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    var response = {
                                        status: 200,
                                        count: results[0].qty
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer().required(),
                c_id: Joi.number().integer().required()
            }
        }
    }
});



/**
 *
 * Route to retrieve total of quotes awaiting approval
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/orders/{r_id}/{c_id}/quotes/total/pending',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = ' + c_id,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // quotes awaiting approval
                        connection.query('SELECT cart FROM '+db+'.oc_replogic_order_quote oq WHERE oq.status=0 AND oq.salesrep_id='+r_id+' AND DATE_FORMAT(oq.date_added,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m")',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    var total = 0;

                                    for (var i=0; i<results.length; i++) {
                                        var cart = parser.parse(results[i].cart);
                                        total += cart.cart_total_price;
                                    }
                                    var response = {
                                        status: 200,
                                        total: total
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer().required(),
                c_id: Joi.number().integer().required()
            }
        }
    }
});



/**
 *
 * Route to retrieve number of approved quotes
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/orders/{r_id}/{c_id}/quotes/count/approved',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = ' + c_id,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // quotes awaiting approval
                        connection.query('SELECT COUNT(oq.quote_id) AS qty FROM '+db+'.oc_replogic_order_quote oq WHERE oq.status=1 AND oq.salesrep_id='+r_id+' AND DATE_FORMAT(oq.date_added,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m")',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    var response = {
                                        status: 200,
                                        count: results[0].qty
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer().required(),
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
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('SELECT od.order_id,od.customer_id,od.total,od.date_added FROM '+db+'.oc_order od inner join '+db+'.oc_customer cs on cs.customer_id = od.customer_id WHERE cs.salesrep_id = '+r_id+' AND DATE_FORMAT(od.date_added,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m")',
                            function (error, results, fields) {
                                if (error) throw error;
                                reply(results);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('SELECT od.order_id,od.customer_id,od.total,od.date_added FROM '+db+'.oc_order od inner join '+db+'.oc_customer cs on cs.customer_id = od.customer_id WHERE cs.salesrep_id = '+r_id+' AND DATE_FORMAT(od.date_added,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m") AND od.order_status_id = 1',
                            function (error, results, fields) {
                                if (error) throw error;

                                reply(results);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;
                        connection.query('SELECT SUM(od.total) AS total FROM '+db+'.oc_order od inner join '+db+'.oc_customer cs on cs.customer_id = od.customer_id WHERE cs.salesrep_id = '+r_id+' AND DATE_FORMAT(od.date_added,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m") AND od.order_status_id=15',
                            function (error, results, fields) {
                                if (error) throw error;

                                reply(results);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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
 * Route to retrieve all orders
 *
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
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('SELECT od.order_id,od.order_status_id,cs.salesrep_id,od.date_added,FORMAT(od.total,2) AS order_total,cs.firstname AS customer_name,CONCAT(cc.first_name," ",cc.last_name) AS contact_name FROM '+db+'.oc_order od INNER JOIN '+db+'.oc_customer cs ON cs.customer_id=od.customer_id LEFT JOIN '+db+'.oc_replogic_order_quote oq ON oq.order_id=od.order_id LEFT JOIN '+db+'.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id WHERE cs.salesrep_id='+r_id+' AND od.isReplogic=1',
                            function (error, results, fields) {
                                if (error) throw error;

                                var response = {
                                    'status': 200,
                                    'orders': results
                                };
                                reply(response);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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
 * Route to count all processed orders
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/orders/{r_id}/{c_id}/count/processed',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('SELECT COUNT(od.order_id) AS qty FROM '+db+'.oc_order od INNER JOIN '+db+'.oc_customer cs ON cs.customer_id = od.customer_id WHERE cs.salesrep_id = '+r_id+' AND od.isReplogic=1 AND DATE_FORMAT(od.date_added,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m") AND od.order_status_id = 15',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {
                                    var response = {
                                        'status': 200,
                                        'count': results[0].qty
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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
 * Route to retrieve single order details
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/order/{c_id}/{order_id}',
    handler: function (request, reply) {
        const order_id = request.params.order_id;
        const c_id = request.params.c_id;

        // get company db
        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // get order details
                        var query = '';
                        query += 'SELECT od.order_id,od.order_status_id,od.customer_id,';
                        query += 'cs.firstname AS customer,cs.email,cs.telephone,CONCAT(ca.address_1," ",ca.address_2,", ",ca.city," ",ca.postcode) AS address,';
                        query += 'CONCAT(od.shipping_firstname," ",od.shipping_lastname) AS shipping_contact,';
                        query += 'CONCAT(od.shipping_address_1," ",od.shipping_address_2,", ",od.shipping_city," ",od.shipping_postcode) AS shipping_address,od.total,od.date_added,ot.code,ot.value ';
                        query += 'FROM '+db+'.oc_order_total ot, '+db+'.oc_order od ';
                        query += 'LEFT JOIN '+db+'.oc_customer cs ON cs.customer_id=od.customer_id ';
                        query += 'LEFT JOIN '+db+'.oc_address ca ON ca.address_id=cs.address_id ';
                        query += 'WHERE od.order_id='+order_id+' AND ot.order_id='+order_id;
                        connection.query(query,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    const orders = [];

                                    if (results.length > 0) {
                                        var orderDetails = {};
                                        orderDetails.order_id = results[0].order_id;
                                        orderDetails.order_status_id = results[0].order_status_id;
                                        orderDetails.customer_id = results[0].customer_id;
                                        orderDetails.customer = results[0].customer;
                                        orderDetails.date_added = results[0].date_added;
                                        orderDetails.email = results[0].email;
                                        orderDetails.telephone = results[0].telephone;
                                        orderDetails.address = results[0].address;
                                        orderDetails.shipping_contact = results[0].shipping_contact;
                                        orderDetails.shipping_address = results[0].shipping_address;
                                        for (var i=0; i<results.length; i++) {
                                            if (results[i].code !== "shipping") {
                                                if (results[i].code === "tax") {
                                                    orderDetails.vat = results[i].value;
                                                } else {
                                                    orderDetails[results[i].code] = results[i].value;
                                                }
                                            } else orderDetails.shipping_rate = results[i].value;
                                        }
                                        orderDetails.total_excl_vat = (orderDetails.vat !== undefined) ? orderDetails.total - orderDetails.vat : orderDetails.total;
                                        orderDetails.total = results[0].total;
                                        orders[0] = orderDetails;
                                    }

                                    // get order products
                                    connection.query('SELECT op.product_id,op.name,op.model,op.quantity,op.price,op.total,op.tax,pr.sku,IF(pr.image="","",CONCAT(st.value, "image/",pr.image)) AS product_image_src FROM '+db+'.oc_setting st, '+db+'.oc_order_product op INNER JOIN '+db+'.oc_product pr ON pr.product_id=op.product_id WHERE op.order_id='+order_id+' AND st.key="config_url"',
                                        function (error, results, fields) {
                                            if (error) {
                                                throw error;
                                            } else {
                                                var response = {
                                                    'status': 200,
                                                    'orders': orders,
                                                    'order_lines': results
                                                }
                                                reply(response);
                                            }
                                        });
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                order_id: Joi.number().integer(),
                c_id: Joi.number().integer()
            }
        }
    }
});


/***********************************************************************************************************************
 *                                          Customer Related API Routes
 ***********************************************************************************************************************/



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

        /////////////////////////////////////////////////////////
        //          CUSTOMER TABLE FIELDS (PAYLOAD)
        /////////////////////////////////////////////////////////
        const c_id = request.payload.c_id;
        const rep_id = request.payload.r_id;
        const company_name = request.payload.company_name;
        const telephone = request.payload.telephone;
        const fax = (request.payload.fax) ? request.payload.fax : "";
        const email = request.payload.email;

        // hard-coded fields/values
        const customer_group_id = 1;
        const store_id = 0;
        const language_id = 1;
        const address_id = 0; // will be updated on after the address insert later on (below)
        const firstname = company_name; // since customer is a company rather the actual person
        const lastname = company_name; // since customer is a company rather the actual person
        const password = 'Replogic'; // general initial password
        const newsletter = 0;
        const ip = 0;
        const custom_field = "";
        const status = 1;
        const approved = 0;
        const safe = 0;
        const token = "";
        const code = "";

        // password encryption
        const salt = Bcrypt.genSaltSync();
        const encryptedPassword = Bcrypt.hashSync(password, salt);

        /////////////////////////////////////////////////////////
        //          ADDRESS TABLE FIELDS (PAYLOAD)
        /////////////////////////////////////////////////////////
        const address_1 = request.payload.address_1;
        const address_2 = (request.payload.address_2) ? request.payload.address_2 : "";
        const city = request.payload.city;
        const postcode = request.payload.postcode;
        const country_id = request.payload.country_id;
        const zone_id = request.payload.region_id;

        // get latitude and longitude from address
        const address = address_1+ ' '+address_2+' '+city+' '+postcode;

        // select company by id
        connection.query('SELECT companydb FROM super.companies WHERE company_id = ' + c_id,
            function(error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        const db = results[0].companydb;

                        // insert into the customer table
                        connection.query('INSERT INTO ' + db + '.oc_customer (customer_group_id,salesrep_id,store_id,language_id,firstname,lastname,email,telephone,fax,password,salt,newsletter,address_id,custom_field,ip,status,approved,safe,token,code,date_added) VALUES (' + customer_group_id + ',' + rep_id + ',' + store_id + ',' + language_id + ',"' + firstname + '","' + lastname + '","' + email + '","' + telephone + '","' + fax + '","' + encryptedPassword + '","' + salt + '",' + newsletter + ',' + address_id + ',"' + custom_field + '","' + ip + '",' + status + ',' + approved + ',' + safe + ',"' + token + '","' + code + '", NOW())',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    // hard-coded and dynamic fields/values
                                    const customer_id = results.insertId;
                                    const address_custom_field = "";

                                    // get GPS coordinates for the address specified
                                    geonoder.toCoordinates(address, geonoder.providers.google, function(lat, long) {

                                        // insert into the customer address table
                                        connection.query('INSERT INTO ' + db + '.oc_address (customer_id,firstname,lastname,company,address_1,address_2,city,postcode,country_id,zone_id,custom_field,latitude,longitude) VALUES (' + customer_id + ',"' + firstname + '","' + lastname + '","' + company_name + '","' + address_1 + '","' + address_2 + '","' + city + '","' + postcode + '",' + country_id + ',' + zone_id + ',"' + address_custom_field + '","'+lat+'","'+long+'")',
                                            function (error, results, fields) {
                                                if (error) {
                                                    throw error;
                                                } else {

                                                    var address_id = results.insertId;

                                                    // update customer table with the address id
                                                    connection.query('UPDATE ' + db + '.oc_customer SET address_id=' + address_id + ' WHERE customer_id=' + customer_id,
                                                        function (error, results, fields) {
                                                            if (error) throw error;

                                                            /**
                                                             * @TODO:
                                                             * if successful customer insert, send email to company admin
                                                             * to notify about the customer that needs approval
                                                             */
                                                            if (results) {
                                                                var response = {
                                                                    'status': 200,
                                                                    'message': 'customer created successfully',
                                                                    'customer_id': customer_id,
                                                                    'customer_address_id': address_id
                                                                };
                                                                reply(response);
                                                            }
                                                        });
                                                }
                                            });
                                    });

                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            payload: {
                c_id: Joi.number().integer().required(),
                r_id: Joi.number().integer().required(),
                company_name: Joi.string().required(),
                telephone: Joi.string().required(),
                fax: Joi.string(),
                email: Joi.string().email().required(),
                address_1: Joi.string().required(),
                address_2: Joi.string(),
                city: Joi.string().required(),
                postcode: Joi.string().required(),
                country_id: Joi.number().integer().required(),
                region_id: Joi.number().integer().required()
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
        const c_id = request.payload.c_id;
        const customer_id = request.payload.customer_id;
        const firstname = request.payload.firstname;
        const surname = request.payload.surname;
        const mobile_number = request.payload.mobile_number;
        const telephone = request.payload.telephone;
        const email = request.payload.email;
        const role = request.payload.role;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = ' + c_id,
            function(error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // insert into the customer contact table
                        connection.query('INSERT INTO ' + db + '.oc_customer_contact (first_name,last_name,email,telephone_number,cellphone_number,customer_id,role) VALUES ("' + firstname + '", "' + surname + '", "' + email + '", "' + telephone + '", "' + mobile_number + '", "' + customer_id + '", "' + role + '")',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    var response = {
                                        'status': 200,
                                        'message': 'customer contact created successfully',
                                        'customer_contact_id': results.insertId

                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            payload: {
                c_id: Joi.number().integer().required(),
                customer_id: Joi.number().integer().required(),
                firstname: Joi.string().required(),
                surname: Joi.string().required(),
                mobile_number: Joi.string().min(0).allow('').allow(null),
                telephone: Joi.string().min(0).allow('').allow(null),
                email: Joi.string().email().required(),
                role: Joi.string().min(0).allow('').allow(null)
            }
        }
    }
});


/***********************************************************************************************************************
 *                                          Appointment Related API Routes
 ***********************************************************************************************************************/


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
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;
                        var duration = duration_hours+":"+duration_minutes;

                        connection.query('SELECT ap.* FROM '+db+'.oc_appointment ap WHERE ap.appointment_date>="'+appointmentdate+'" AND ap.appointment_date<=DATE_ADD("2017-12-06 18:18:31", INTERVAL "'+duration+'" HOUR_MINUTE)',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    if (results[0]) {
                                        // matching appointment is found at the same datetime
                                        var response = {
                                            status: 400,
                                            message: "Can't have multiple appointments for the same time"
                                        };
                                        reply(response);
                                    } else {

                                        connection.query('INSERT INTO '+db+'.oc_appointment (appointment_name,appointment_description,appointment_date,duration_hours,duration_minutes,salesrep_id,customer_id) VALUES ("' + title + '","' + description + '","' + appointmentdate + '",' + duration_hours + ',' + duration_minutes + ',' + r_id + ',' + customer_id + ')',
                                            function (error, results, fields) {
                                                if (error) {
                                                    throw error;
                                                } else {
                                                    var response = {
                                                        status: 'success',
                                                        appointment_id: results.insertId,
                                                        message: 'appointment created successfully'
                                                    };
                                                    reply(response);
                                                }
                                            });
                                    }
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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

/***********************************************************************************************************************
 *                                      Appointment Related Routes
 ***********************************************************************************************************************/


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
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('SELECT ap.appointment_id,ap.appointment_name,ap.appointment_description,cs.firstname as customer_name,ap.appointment_date,ad.address_1,ad.address_2,ad.city,ad.postcode,nt.note_id,nt.note_content,sc.checkin_id,sc.checkin,sc.checkout FROM '+db+'.oc_appointment ap left join '+db+'.oc_customer cs on cs.customer_id = ap.customer_id left join '+db+'.oc_address ad on ad.address_id = cs.address_id left join '+db+'.oc_notes nt on nt.appointment_id = ap.appointment_id LEFT JOIN '+db+'.oc_salesrep_checkins sc on sc.appointment_id=ap.appointment_id WHERE ap.salesrep_id = '+r_id+' AND DATE_FORMAT(ap.appointment_date,"%Y-%m-%d") = DATE_FORMAT(NOW(),"%Y-%m-%d")',
                            function (error, results, fields) {
                                if (error) throw error;

                                reply(results);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });

    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer().required(),
                c_id: Joi.number().integer().required()
            }
        }
    }
});


/**
 *
 * Route to retrieve all appointments for this week
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/appointments/{r_id}/{c_id}/week',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('SELECT ap.appointment_id,ap.appointment_name,ap.appointment_description,cs.firstname as customer_name,ap.appointment_date,ad.address_1,ad.address_2,ad.city,ad.postcode,nt.note_id,nt.note_content,sc.checkin_id,sc.checkin,sc.checkout FROM '+db+'.oc_appointment ap LEFT JOIN '+db+'.oc_customer cs ON cs.customer_id = ap.customer_id LEFT JOIN '+db+'.oc_address ad ON ad.address_id = cs.address_id LEFT JOIN '+db+'.oc_notes nt ON nt.appointment_id = ap.appointment_id LEFT JOIN '+db+'.oc_salesrep_checkins sc ON sc.appointment_id = ap.appointment_id WHERE ap.salesrep_id = '+r_id+' AND YEARWEEK(ap.appointment_date) = YEARWEEK(CURDATE()) ORDER BY ap.appointment_date',
                            function (error, results, fields) {
                                if (error) throw error;

                                var response = {
                                    status: 200,
                                    appointments: results
                                };
                                reply(response);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });

    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer().required(),
                c_id: Joi.number().integer().required()
            }
        }
    }
});


/**
 *
 * Route to retrieve all appointments for this month
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/appointments/{r_id}/{c_id}/month',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('SELECT ap.appointment_id,ap.appointment_name,ap.appointment_description,cs.firstname as customer_name,ap.appointment_date,ad.address_1,ad.address_2,ad.city,ad.postcode,nt.note_id,nt.note_content,sc.checkin_id,sc.checkin,sc.checkout FROM '+db+'.oc_appointment ap LEFT JOIN '+db+'.oc_customer cs on cs.customer_id = ap.customer_id LEFT JOIN '+db+'.oc_address ad on ad.address_id = cs.address_id LEFT JOIN '+db+'.oc_notes nt on nt.appointment_id = ap.appointment_id LEFT JOIN '+db+'.oc_salesrep_checkins sc on sc.appointment_id = ap.appointment_id WHERE ap.salesrep_id = '+r_id+' AND YEAR(ap.appointment_date) = YEAR(CURDATE()) AND MONTH(ap.appointment_date)=MONTH(CURDATE()) ORDER BY ap.appointment_date',
                            function (error, results, fields) {
                                if (error) throw error;

                                var response = {
                                    status: 200,
                                    appointments: results
                                };
                                reply(response);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });

    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer().required(),
                c_id: Joi.number().integer().required()
            }
        }
    }
});



/**
 * Route to retrieve all appointments
 *
 * @method GET
 * @path /api/v1/appointments/{r_id}/{c_id}
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/appointments/{r_id}/{c_id}',
    handler: function (request, reply) {
        const r_id = request.params.r_id;
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query('SELECT ap.appointment_id,ap.appointment_name,ap.appointment_description,cs.customer_id,cs.firstname as customer_name,ap.appointment_date,ad.address_1,ad.address_2,ad.city,ad.postcode,nt.note_id,nt.note_content,sc.checkin_id,sc.checkin,sc.checkout FROM '+db+'.oc_appointment ap LEFT JOIN '+db+'.oc_customer cs ON cs.customer_id = ap.customer_id LEFT JOIN '+db+'.oc_address ad ON ad.address_id = cs.address_id LEFT JOIN '+db+'.oc_notes nt ON nt.appointment_id = ap.appointment_id LEFT JOIN '+db+'.oc_salesrep_checkins sc ON sc.appointment_id = ap.appointment_id WHERE ap.salesrep_id ='+r_id,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {
                                    var response = {
                                        'status': 200,
                                        'appointments': results
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                r_id: Joi.number().integer().required(),
                c_id: Joi.number().integer().required()
            }
        }
    }
});



/**
 *
 * Route to retrieve a single appointment details
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/appointment/{c_id}/{appointment_id}',
    handler: function (request, reply) {
        const companyId = request.params.c_id;
        const appointmentId = request.params.appointment_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id='+companyId,
            function (error, results, fields) {
                if (error){
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // get appointment details
                        connection.query('SELECT ap.appointment_id,cs.customer_id,cs.firstname as customer_name,ap.appointment_date,ap.duration_hours,ap.duration_minutes,ad.address_1,ad.address_2,ad.city,ad.postcode,nt.note_id,nt.note_content,sc.checkin_id,sc.checkin,sc.checkout FROM '+db+'.oc_appointment ap LEFT JOIN '+db+'.oc_customer cs ON cs.customer_id = ap.customer_id LEFT JOIN '+db+'.oc_address ad ON ad.address_id = cs.address_id LEFT JOIN '+db+'.oc_notes nt ON nt.appointment_id = ap.appointment_id LEFT JOIN '+db+'.oc_salesrep_checkins sc ON sc.appointment_id = ap.appointment_id WHERE ap.appointment_id ='+appointmentId,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {
                                    var response = {
                                        'status': 200,
                                        'appointments': results
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                c_id: Joi.number().integer().required(),
                appointment_id: Joi.number().integer().required()
            }
        }
    }
});


/**
 *
 * Route to add a new appointment note
 *
 */
server.route({
    method: 'POST',
    path: '/api/v1/appointments/note/create',
    handler: function (request, reply) {
        const c_id = request.payload.c_id;
        const r_id = request.payload.r_id;
        const title = request.payload.title;
        const content = request.payload.content;
        const appointment_id = request.payload.appointment_id;

        // get company db
        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // insert appointment note into database
                        connection.query('INSERT INTO '+db+'.oc_notes (note_title,note_content,appointment_id,salesrep_id) VALUES ("' + title + '", "' + content + '", ' + appointment_id + ', ' + r_id + ')',
                            function (error, results, fields) {
                                if (error) throw error;

                                var response = {
                                    'status': 200,
                                    'note_id': results.insertId,
                                    'message': 'appointment note created successfully'
                                }
                                reply(response);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            payload: {
                c_id: Joi.number().integer().required(),
                r_id: Joi.number().integer().required(),
                title: Joi.string().required(),
                content: Joi.string().required(),
                appointment_id: Joi.number().integer().required()
            }
        }
    }
});


/**
 *
 * Route to update and appointment note
 *
 */
server.route({
    method: 'PUT',
    path: '/api/v1/appointments/note',
    handler: function (request, reply) {
        const c_id = request.payload.c_id;
        const note_id = request.payload.note_id;
        const title = request.payload.title;
        const content = request.payload.content;

        // get company db
        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // update appointment note
                        connection.query('UPDATE '+db+'.oc_notes SET note_title="'+title+'", note_content="'+content+'" WHERE note_id='+ note_id,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    var response = {
                                        'status': 200,
                                        'message': 'appointment note updated successfully'
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            payload: {
                c_id: Joi.number().integer().required(),
                note_id: Joi.number().integer().required(),
                title: Joi.string(),
                content: Joi.string()
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

        connection.query('SELECT u.uid, u.salt, u.password, u.companyId, u.realId, c.companyname, c.companydb FROM super.user u INNER JOIN super.companies c ON c.company_id=u.companyId WHERE u.username="'+username+'"', function(error, results, fields) {
            if(error){
                throw error;
            } else {
                var orgPassword = Bcrypt.compareSync(password, results[0].password);
                if (orgPassword === true){

                    const db = results[0].companydb;
                    const companyName = results[0].companyname;
                    const companyId = results[0].companyId;
                    const repId = results[0].realId;
                    const userId = results[0].uid;

                    /**
                     * @include tax (or VAT) details on login */
                    connection.query('SELECT st.key, st.value, tr.name, tr.rate, sr.salesrep_name FROM '+db+'.oc_setting st, '+db+'.oc_tax_rate tr, '+db+'.oc_salesrep sr WHERE st.key="tax_status" AND sr.salesrep_id='+repId,
                        function (error, results, fields) {

                            if (error) {
                                throw error;
                            } else {

                                var response = {
                                    'status': 200,
                                    'message': 'login succesful',
                                    'c_id': companyId,
                                    'uid' : userId,
                                    'r_id': repId,
                                    'company_name': companyName,
                                    'rep_name': results[0].salesrep_name,
                                    'tax_status': results[0].value,
                                    'tax_name': results[0].name,
                                    'tax_rate': results[0].rate.toFixed(2)
                                };
                                reply(response);

                            }
                        });
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


/**
 *
 * Route to reset password for a user
 *
 */
server.route({
    method: 'POST',
    path: '/api/v1/user/resetpassword',
    handler: function (request, reply) {

        const email = request.payload.email;

        // validate email against database | check if user exists or not
        connection.query('SELECT u.uid, u.salt, u.password, u.companyId, u.realId, c.companyname, c.companydb FROM super.user u INNER JOIN super.companies c ON c.company_id=u.companyId WHERE u.email="'+email+'"',
            function(error, results, fields) {
                if (error){
                    throw error;
                } else {

                    if (results.length > 0) {

                        // auto-generate new password
                        const newPassword = generatePassword(6, false);
                        const db = results[0].companydb;
                        const repId = results[0].realId;

                        // encryption
                        var salt = Bcrypt.genSaltSync();
                        var encryptedPassword = Bcrypt.hashSync(newPassword, salt);

                        connection.query("UPDATE super.user SET password='"+encryptedPassword+"', salt='"+salt+"' WHERE uid="+results[0].uid,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    if (results) {

                                        connection.query("SELECT rm.email AS manager_email FROM "+db+".oc_salesrep sr INNER JOIN "+db+".oc_team rt ON rt.team_id=sr.sales_team_id INNER JOIN "+db+".oc_user rm ON rm.user_id=rt.sales_manager WHERE sr.salesrep_id="+repId,
                                            function (error, results, fields) {
                                                if (error) {
                                                    throw error;
                                                } else {

                                                    if (results.length > 0) {
                                                        var support_desk = {contact: "support@cloudlogic.co.za"};
                                                        var manager = {email: results[0].manager_email};
                                                        comms.sendResetPassword(email, newPassword, support_desk, manager, reply);
                                                    } else {
                                                        var response = {
                                                            status: 400,
                                                            message: 'An unexpected error has occurred!'
                                                        };
                                                        reply(response);
                                                    }
                                                }
                                            });

                                    } else {
                                        var response = {
                                            status: 400,
                                            message: 'An unexpected error has occurred!'
                                        };
                                        reply(response);
                                    }
                                }
                            });

                    }else{
                        var response = {
                            'response': 400,
                            'message': 'User does not exist'
                        };
                        reply(response);
                    }

                }
            });
    },
    config: {
        validate: {
            payload: {
                email: Joi.string().email().required()
            }
        }
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


/***********************************************************************************************************************
 *                                          Sales Rep Related API Routes
 ***********************************************************************************************************************/

 /**
  *
  * Route to search users
  *
  */
server.route({
    method: 'GET',
    path: '/api/v1/users/search/{term}',
    handler: function (request, reply) {
        const term = request.params.term;
        connection.query("SELECT * FROM super.user WHERE email='"+term+"'",
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {
                    var response = {
                        status: 200,
                        data: results
                    };
                    reply(response);
                }
            });
    },
    config: {
        validate: {
            params: {
                term: Joi.string().email()
            }
        }
    }
});

/**
 *
 * Route to register a sales rep
 * Sends a welcome email with new auto-generated login password
 *
 */
server.route({
    method: 'POST',
    path: '/api/v1/salesrep/register',
    handler: function (request, reply) {

        const companyId = request.payload.company_id;
        const realId = request.payload.rep_id;
        const username = request.payload.username;
        const email = request.payload.email;
        const password = generatePassword(6, false);    // Auto-generate new password

        // Pass encryption
        var salt = Bcrypt.genSaltSync();
        var encryptedPassword = Bcrypt.hashSync(password, salt);

        connection.query('SELECT companydb FROM super.companies WHERE company_id='+companyId,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        const db = results[0].companydb;

                        /*
                         * Validate User by Email Address
                         * - check if email address already exists under the same company
                         */
                         connection.query('SELECT * FROM super.user WHERE email="'+email+'"',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {
                                    if (results.length > 0) {
                                        var response = {
                                            status: 400,
                                            message: 'Email address specified already exists!'
                                        };
                                        reply(response);
                                    } else {
                                        // Do database insert for new user into super.user
                                        connection.query('INSERT INTO super.user (username,email,password,salt, companyId, realId) VALUES ("' + username + '","' + email + '","' + encryptedPassword + '","' + salt + '", "' + companyId + '", "' + realId + '")',
                                            function (error, results, fields) {
                                                if (error) {
                                                    throw error;
                                                } else {
                                                    if (results) {
                                                        connection.query("SELECT rm.email AS manager_email FROM "+db+".oc_salesrep sr INNER JOIN "+db+".oc_team rt ON rt.team_id=sr.sales_team_id INNER JOIN "+db+".oc_user rm ON rm.user_id=rt.sales_manager WHERE sr.salesrep_id="+realId,
                                                            function (error, results, fields) {
                                                                if (error) {
                                                                    throw error;
                                                                } else {

                                                                    if (results.length > 0) {
                                                                        var support_desk = {contact: "support@cloudlogic.co.za"};
                                                                        var manager = {email: results[0].manager_email};
                                                                        comms.sendWelcomeEmail(email, password, support_desk, manager, reply);
                                                                    } else {
                                                                        var response = {
                                                                            status: 400,
                                                                            message: 'An unexpected error has occurred!'
                                                                        };
                                                                        reply(response);
                                                                    }
                                                                }
                                                            });

                                                    } else {
                                                        var response = {
                                                            status: 400,
                                                            message: 'An unexpected error has occurred!'
                                                        };
                                                        reply(response);
                                                    }
                                                }
                                            });
                                    }
                                }
                            });
                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
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
 *
 * Route to update sales rep details
 *
 */
server.route({
    method: 'PUT',
    path: '/api/v1/salesrep',
    handler: function (request, reply) {
        const c_id = request.payload.c_id;
        const r_id = request.payload.r_id;
        const firstName = request.payload.firstname;
        const lastName = request.payload.lastname;
        const cell = request.payload.cell;
        const tel = request.payload.tel;
        const email = request.payload.email;
        const teamId = request.payload.team_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = '+c_id,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // update sales rep database table
                        connection.query("UPDATE "+db+".oc_salesrep SET salesrep_name='"+firstName+"', salesrep_lastname='"+lastName+"', cell='"+cell+"', tel='"+tel+"', email='"+email+"', sales_team_id="+teamId+" WHERE salesrep_id="+r_id,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    // update super user database table
                                    connection.query("UPDATE super.user SET username='"+email+"', email='"+email+"' WHERE realId="+r_id+" AND companyId="+c_id,
                                        function (error, results, fields) {
                                            if (error) {
                                                throw error;
                                            } else {
                                                var response = {
                                                    status: 200,
                                                    message: 'Sales rep details successfully updated'
                                                };
                                                reply(response);
                                            }
                                        });
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            payload: {
                c_id: Joi.number().integer().required(),
                r_id: Joi.number().integer().required(),
                firstname: Joi.string().required(),
                lastname: Joi.string().required(),
                cell: Joi.string().required(),
                tel: Joi.string().required(),
                email: Joi.string().email().required(),
                team_id: Joi.number().integer().required()
            }
        }
    }
});

/**
 *
 * Route to delete sales rep
 *
 */
server.route({
   method: 'DELETE',
   path: '/api/v1/salesrep',
   handler: function (request, reply) {
       const companyId = request.payload.c_id;
       const repId = request.payload.r_id;
       connection.query("SELECT companydb FROM super.companies WHERE company_id="+companyId,
           function (error, results, fields) {
               if (error) {
                   throw error;
               } else {
                   if (results.length > 0) {
                       const db = results[0].companydb;
                       connection.query("DELETE "+db+".oc_salesrep,super.user FROM "+db+".oc_salesrep JOIN super.user WHERE salesrep_id="+repId+" AND realId="+repId,
                           function (error, results, fields) {
                               if (error) {
                                   throw error;
                               } else {
                                    var response = {
                                        status: 200,
                                        message: 'Sales Rep successfully deleted'
                                    };
                                    reply(response);
                               }
                           });
                   } else {
                       var response = {
                           'status': 400,
                           'error': 'Invalid company ID provided'
                       };
                       reply(response);
                   }
               }
           });
   },
   config: {
       validate: {
           payload: {
               c_id: Joi.number().integer().required(),
               r_id: Joi.number().integer().required()
           }
       }
   }
});


/**
 *
 * Route to log check-in for a sales rep customer visit
 *
 */
server.route({
    method: 'POST',
    path: '/api/v1/salesrep/checkin',
    handler: function (request, reply) {
        const companyId = request.payload.c_id;
        const repId = request.payload.r_id;
        const customerId = request.payload.customer_id;
        const location = request.payload.location;
        const start = request.payload.start;
        const end = request.payload.end;
        const checkIn = request.payload.checkin;
        const checkInLocation = request.payload.checkin_location;
        const appointmentId = request.payload.appointment_id;

        // get company db
        connection.query("SELECT companydb FROM super.companies WHERE company_id="+companyId,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // get gps coordinates for the address specified
                        geonoder.toCoordinates(checkInLocation, geonoder.providers.google, function(lat, long) {

                            // record sales rep check-in
                            connection.query("INSERT INTO " + db + ".oc_salesrep_checkins (salesrep_id,customer_id,appointment_id,location,start,end,checkin,checkin_location,latitude,longitude) VALUES (" + repId + "," + customerId + "," + appointmentId + ", '" + location + "','" + start + "','" + end + "','" + checkIn + "','" + checkInLocation + "', '"+lat+"', '"+long+"')",
                                function (error, results, fields) {
                                    if (error) {
                                        throw error;
                                    } else {

                                        var response = {
                                            status: 200,
                                            checkin_id: results.insertId,
                                            message: 'Successfully checked in'
                                        };
                                        reply(response);
                                    }
                                });
                        });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            payload: {
                c_id: Joi.number().integer().required(),
                r_id: Joi.number().integer().required(),
                customer_id: Joi.number().integer().required(),
                location: Joi.string().required(),
                start: Joi.string().required(),
                end: Joi.string().required(),
                checkin: Joi.string().required(),
                checkin_location: Joi.string().required(),
                appointment_id: Joi.number().integer().required()
            }
        }
    }
});



/**
 *
 * Route to log check-out for a sales rep customer visit
 *
 */
server.route({
    method: 'POST',
    path: '/api/v1/salesrep/checkout',
    handler: function (request, reply) {
        const companyId = request.payload.c_id;
        const checkInId = request.payload.checkin_id;
        const checkOut = request.payload.checkout;
        const remarks = request.payload.remarks;

        // get company db
        connection.query("SELECT companydb FROM super.companies WHERE company_id="+companyId,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query("UPDATE "+db+".oc_salesrep_checkins SET checkout='"+checkOut+"', remarks='"+remarks+"' WHERE checkin_id="+checkInId,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    var response = {
                                        status: 200,
                                        message: 'Successfully checked out'
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            payload: {
                c_id: Joi.number().integer().required(),
                checkin_id: Joi.number().integer().required(),
                checkout: Joi.string().required(),
                remarks: Joi.string()
            }
        }
    }
});



/**
 *
 * Route to retrieve sales rep customer visits
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/salesrep/{r_id}/{c_id}/{customer_id}/visits',
    handler: function (request, reply) {
        const companyId = request.params.c_id;
        const repId = request.params.r_id;
        const customerId = request.params.customer_id;

        // get company db
        connection.query("SELECT companydb FROM super.companies WHERE company_id="+companyId,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // get sales rep visits
                        connection.query("SELECT rc.checkin_id,rc.start,rc.end,rc.checkin,rc.checkout,rc.location,rc.checkin_location,rc.remarks,rc.latitude,rc.longitude FROM "+db+".oc_salesrep_checkins rc INNER JOIN "+db+".oc_customer cs ON cs.customer_id=rc.customer_id WHERE rc.salesrep_id="+repId+" AND cs.customer_id="+customerId,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    var response = {
                                        status: 200,
                                        visits: results
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                c_id: Joi.number().integer().required(),
                r_id: Joi.number().integer().required(),
                customer_id: Joi.number().integer().required()
            }
        }
    }
});



/**
 *
 * Route to retrieve sales rep customer visits for today
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/salesrep/{r_id}/{c_id}/{customer_id}/visits/today',
    handler: function (request, reply) {
        const companyId = request.params.c_id;
        const repId = request.params.r_id;
        const customerId = request.params.customer_id;

        // get company db
        connection.query("SELECT companydb FROM super.companies WHERE company_id="+companyId,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // get sales rep visits
                        connection.query('SELECT rc.checkin_id,rc.start,rc.end,rc.checkin,rc.checkout,rc.location,rc.checkin_location,rc.remarks,rc.latitude,rc.longitude FROM '+db+'.oc_salesrep_checkins rc INNER JOIN '+db+'.oc_customer cs ON cs.customer_id=rc.customer_id WHERE rc.salesrep_id='+repId+' AND cs.customer_id='+customerId+' AND DATE_FORMAT(rc.checkin,"%Y-%m-%d") = DATE_FORMAT(NOW(),"%Y-%m-%d")',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {
                                    var response = {
                                        status: 200,
                                        visits: results
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                c_id: Joi.number().integer().required(),
                r_id: Joi.number().integer().required(),
                customer_id: Joi.number().integer().required()
            }
        }
    }
});



/**
 *
 * Route to retrieve sales rep customer visits for this week
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/salesrep/{r_id}/{c_id}/{customer_id}/visits/week',
    handler: function (request, reply) {
        const companyId = request.params.c_id;
        const repId = request.params.r_id;
        const customerId = request.params.customer_id;

        // get company db
        connection.query("SELECT companydb FROM super.companies WHERE company_id="+companyId,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // get sales rep visits
                        connection.query('SELECT rc.checkin_id,rc.start,rc.end,rc.checkin,rc.checkout,rc.location,rc.checkin_location,rc.remarks,rc.latitude,rc.longitude FROM '+db+'.oc_salesrep_checkins rc INNER JOIN '+db+'.oc_customer cs ON cs.customer_id=rc.customer_id WHERE rc.salesrep_id='+repId+' AND cs.customer_id='+customerId+' AND YEARWEEK(rc.checkin) = YEARWEEK(CURDATE())',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {
                                    var response = {
                                        status: 200,
                                        visits: results
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                c_id: Joi.number().integer().required(),
                r_id: Joi.number().integer().required(),
                customer_id: Joi.number().integer().required()
            }
        }
    }
});



/**
 *
 * Route to retrieve sales rep customer visits for this month
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/salesrep/{r_id}/{c_id}/{customer_id}/visits/month',
    handler: function (request, reply) {
        const companyId = request.params.c_id;
        const repId = request.params.r_id;
        const customerId = request.params.customer_id;

        // get company db
        connection.query("SELECT companydb FROM super.companies WHERE company_id="+companyId,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // get sales rep visits
                        connection.query('SELECT rc.checkin_id,rc.start,rc.end,rc.checkin,rc.checkout,rc.location,rc.checkin_location,rc.remarks,rc.latitude,rc.longitude FROM '+db+'.oc_salesrep_checkins rc INNER JOIN '+db+'.oc_customer cs ON cs.customer_id=rc.customer_id WHERE rc.salesrep_id='+repId+' AND cs.customer_id='+customerId+' AND YEAR(rc.checkin) = YEAR(CURDATE()) AND MONTH(rc.checkin)=MONTH(CURDATE())',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {
                                    var response = {
                                        status: 200,
                                        visits: results
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                c_id: Joi.number().integer().required(),
                r_id: Joi.number().integer().required(),
                customer_id: Joi.number().integer().required()
            }
        }
    }
});



/**
 *
 * Route to retrieve sales rep visits to a specific customer
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/salesrep/{r_id}/{c_id}/visits/customer/{customer_id}',
    handler: function (request, reply) {
        const companyId = request.params.c_id;
        const repId = request.params.r_id;
        const customerId = request.params.customer_id;

        // get company db
        connection.query("SELECT companydb FROM super.companies WHERE company_id="+companyId,
            function (error, results, fields) {
                if (error) {
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        connection.query("SELECT rc.checkin_id,rc.start,rc.end,rc.checkin,rc.checkout,rc.location,rc.checkin_location,rc.remarks,cs.customer_id,cs.firstname AS customer_firstname,cs.lastname AS customer_lastname FROM "+db+".oc_salesrep_checkins rc INNER JOIN "+db+".oc_customer cs ON cs.customer_id=rc.customer_id WHERE rc.salesrep_id="+repId+" AND rc.customer_id="+customerId,
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    var response = {
                                        status: 200,
                                        visits: results
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                c_id: Joi.number().integer().required(),
                r_id: Joi.number().integer().required(),
                customer_id: Joi.number().integer().required()
            }
        }
    }
});


/***********************************************************************************************************************
 *                                          Company Related API Routes
 ***********************************************************************************************************************/


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
 *
 * Route to list all active products
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/products/{c_id}',
    handler: function (request, reply) {
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // get all active products
                        connection.query('SELECT pr.product_id,pr.sku,pr.stock_status_id,pd.name,pr.price,IF(pr.image="","",CONCAT(st.value,"image/",pr.image)) AS product_image_src,pr.tax_class_id AS vat_status_id FROM '+db+'.oc_setting st, '+db+'.oc_product pr INNER JOIN '+db+'.oc_product_description pd ON pd.product_id=pr.product_id INNER JOIN '+db+'.oc_product_to_customer_group pc ON pc.product_id=pr.product_id INNER JOIN '+db+'.oc_customer cs ON cs.customer_group_id=pc.customer_group_id WHERE pr.status=1 AND st.key="config_url" GROUP BY pr.product_id',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    var response = {
                                        'status': 200,
                                        'products': results
                                    };
                                    reply(response);
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                c_id: Joi.number().integer().required()
            }
        }
    }
});


/**
 *
 * Route to list active products by category
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/products/{c_id}/{category_id}',
    handler: function (request, reply) {
        const c_id = request.params.c_id;
        const category_id = request.params.category_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // get active products by specified category
                        connection.query('SELECT pr.product_id,pr.sku,pr.stock_status_id,pd.name,pr.price,IF(pr.image="","",CONCAT(st.value,"image/",pr.image)) AS product_image_src,pr.tax_class_id AS vat_status_id FROM '+db+'.oc_setting st, '+db+'.oc_product pr INNER JOIN '+db+'.oc_product_description pd ON pd.product_id=pr.product_id INNER JOIN '+db+'.oc_product_to_customer_group pc ON pc.product_id=pr.product_id INNER JOIN '+db+'.oc_customer cs ON cs.customer_group_id=pc.customer_group_id INNER JOIN '+db+'.oc_product_to_category ct ON ct.product_id=pr.product_id WHERE ct.category_id='+category_id+' AND pr.status=1 AND st.key="config_url" GROUP BY pr.product_id',
                            function (error, results, fields) {
                                if (error) throw error;

                                var response = {
                                    'status': 200,
                                    'products': results
                                };
                                reply(response);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                c_id: Joi.number().integer().required(),
                category_id: Joi.number().integer().required()
            }
        }
    }
});


/**
 *
 * Route to list all product categories
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/products/{c_id}/categories',
    handler: function (request, reply) {
        const c_id = request.params.c_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else{

                    if (results.length > 0) {

                        var db = results[0].companydb;
                        connection.query('SELECT ct.category_id,cd.name,ct.parent_id FROM '+db+'.oc_category ct INNER JOIN '+db+'.oc_category_description cd ON cd.category_id=ct.category_id INNER JOIN '+db+'.oc_category_to_customer_group cc ON cc.category_id=ct.category_id INNER JOIN '+db+'.oc_customer cs ON cs.customer_group_id=cc.customer_group_id GROUP BY ct.category_id',
                            function (error, results, fields) {
                                if (error) throw error;

                                var response = {
                                    'status': 200,
                                    'categories': results
                                };
                                reply(response);
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                c_id: Joi.number().integer().required()
            }
        }
    }
});


/**
 *
 * Route to get product by id
 *
 */
server.route({
    method: 'GET',
    path: '/api/v1/product/{product_id}/{c_id}',
    handler: function (request, reply) {
        const c_id = request.params.c_id;
        const product_id = request.params.product_id;

        connection.query('SELECT companydb FROM super.companies WHERE company_id = "' + c_id + '"',
            function (error, results, fields) {
                if (error){
                    throw error;
                } else {

                    if (results.length > 0) {

                        var db = results[0].companydb;

                        // get all active products
                        connection.query('SELECT pr.product_id,pr.sku,pr.stock_status_id,pd.name,pr.price,IF(pr.image="","",CONCAT(st.value,"image/",pr.image)) AS product_image_src FROM '+db+'.oc_setting st, '+db+'.oc_product pr INNER JOIN '+db+'.oc_product_description pd ON pd.product_id=pr.product_id INNER JOIN '+db+'.oc_product_to_customer_group pc ON pc.product_id=pr.product_id INNER JOIN '+db+'.oc_customer cs ON cs.customer_group_id=pc.customer_group_id WHERE pr.product_id='+product_id+' AND st.key="config_url" GROUP BY pr.product_id',
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {

                                    if (results.length > 0) {

                                        const productDetails = results[0];

                                        // get product attributes
                                        connection.query('SELECT at.attribute_id,ad.name AS attribute_name,pa.text AS attribute_value,at.sort_order FROM '+db+'.oc_product_attribute pa INNER JOIN '+db+'.oc_attribute at ON at.attribute_id=pa.attribute_id INNER JOIN '+db+'.oc_attribute_description ad ON ad.attribute_id=at.attribute_id WHERE pa.product_id='+product_id,
                                            function (error, results, fields) {
                                                if (error) {
                                                    throw error;
                                                } else {
                                                    var response = {
                                                        'status': 200,
                                                        'product': productDetails,
                                                        'product_attributes': results
                                                    };
                                                    reply(response);
                                                }
                                            });
                                    } else {
                                        var response = {
                                            'status': 200,
                                            'product': {},
                                            'product_attributes': []
                                        };
                                        reply(response);
                                    }
                                }
                            });

                    } else {
                        var response = {
                            'status': 400,
                            'error': 'Invalid company ID provided'
                        };
                        reply(response);
                    }
                }
            });
    },
    config: {
        validate: {
            params: {
                c_id: Joi.number().integer().required(),
                product_id: Joi.number().integer().required()
            }
        }
    }
});



server.ext('onPreResponse', corsHeaders);
server.start(function(err){
    if (err) {
    throw err;
}


console.log('Server running at:', server.info.uri);

});
