'use strict';

const config     = require('../config');
const crypto     = require('crypto');
const MySQL      = require('mysql');
const parser     = require('json-parser');
const geonoder   = require('geonoder');
const connection = MySQL.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.pass,
    database: config.database.name
});
connection.connect();

/**
 * Model constructor
 * @param  {object}     database
 */
function CustomersModel(database) {
    this.db         = database;
    this.company_id = 0;
    this.start      = 0;
    this.limit      = 0;
    this.orderby    = "";
    this.sorting    = "";
};

/**
 * Set company id
 * @param  {number}     company_id
 */
CustomersModel.prototype.setCompanyId = function(company_id) {
    this.company_id = company_id;
}

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
CustomersModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
CustomersModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get customers
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomers = function(reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                var dbname = results[0].companydb;
                var select;
                select  = `cs.customer_id,cs.firstname,cs.lastname,cs.email,cs.telephone,cs.fax,cs.address_id,`;
                select += `ca.address_1,ca.address_2,ca.city,ca.postcode,ca.country_id,ca.zone_id AS region_id`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_customer cs`);
                that.db.join(`${dbname}.oc_address ca ON ca.address_id=cs.address_id`);
                that.db.where(`cs.status=1 AND cs.approved=1`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    var response = {
                        status: 200,
                        error: false,
                        customers: results
                    };
                    reply(response);
                });
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

/**
 * Find customers by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.findCustomerByProperty = function(prop, value, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                var dbname = results[0].companydb;
                var select;
                select  = `cs.customer_id,cs.firstname,cs.lastname,cs.email,cs.telephone,cs.fax,cs.address_id,`;
                select += `ca.address_1,ca.address_2,ca.city,ca.postcode,ca.country_id,ca.zone_id AS region_id`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_customer cs`);
                that.db.join(`${dbname}.oc_address ca ON ca.address_id=cs.address_id`);
                that.db.where(`${prop}='${value}' AND cs.status=1 AND cs.approved=1`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    var response = {
                        status: 200,
                        error: false,
                        customers: results
                    };
                    reply(response);
                });
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

/**
 * Get customer contacts
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomerContacts = function(id, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                var dbname = results[0].companydb;
                var select;
                select = `customer_con_id AS contact_id,first_name AS name,last_name AS surname,cellphone_number AS cell,role,email`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_customer_contact`);
                that.db.where(`customer_id=${id}`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    var response = {
                        status: 200,
                        error: false,
                        contacts: results
                    };
                    reply(response);
                });
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

/**
 * Get customer visits
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomerVisits = function(id, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                var dbname = results[0].companydb;
                var select;
                select  = `rc.checkin_id,rc.start,rc.end,rc.checkin,rc.checkout,rc.location,rc.checkin_location,rc.remarks,rc.latitude,rc.longitude,rc.salesrep_id,`;
                select += `ap.type,ap.appointment_name,ap.appointment_description`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_salesrep_checkins rc`);
                that.db.join(`${dbname}.oc_appointment ap ON ap.appointment_id=rc.appointment_id`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=rc.customer_id`);
                that.db.where(`cs.customer_id=${id}`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    var response = {
                        status: 200,
                        error: false,
                        visits: results
                    };
                    reply(response);
                });
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

/**
 * Get customer orders
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomerOrders = function(id, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                var dbname = results[0].companydb;
                var select;
                select  = `od.order_id,od.order_status_id,cs.salesrep_id,od.date_added,FORMAT(od.total,2) AS order_total,`;
                select += `cs.firstname AS customer_name,CONCAT(cc.first_name," ",cc.last_name) AS contact_name`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_order od`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=od.customer_id`, `LEFT`);
                that.db.join(`${dbname}.oc_replogic_order_quote oq ON oq.order_id=od.order_id`, `LEFT`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`, `LEFT`);
                that.db.where(`cs.customer_id=${id} AND od.isReplogic=1`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    var response = {
                        status: 200,
                        error: false,
                        orders: results
                    };
                    reply(response);
                });
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

/**
 * Get customer orders
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomerQuotes = function(id, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                var dbname = results[0].companydb;
                var select;
                select  = `oq.quote_id,oq.status,oq.date_added,oq.cart,`;
                select += `cs.firstname AS customer_name,CONCAT(cc.first_name, " ", cc.last_name) AS contact_name`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_replogic_order_quote oq`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=oq.customer_id`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`, `LEFT`);
                that.db.where(`cs.customer_id=${id} AND oq.status IN (0,2)`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (results.length > 0) {
                        for (var i=0; i<results.length; i++) {
                            results[i].cart = parser.parse(results[i].cart);
                        }
                    }
                    var response = {
                        status: 200,
                        error: false,
                        quotes: results
                    };
                    reply(response);
                });
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

/**
 * Get customer appointments
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomerAppointments = function(id, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                var dbname = results[0].companydb;
                var select;
                select  = `ap.appointment_id,ap.appointment_name,ap.appointment_description,ap.appointment_date,ap.type,ap.duration_hours,ap.duration_minutes,`;
                select += `IF(type="Existing Business" AND ap.appointment_address IS NULL,CONCAT(ad.address_1," ",ad.address_2," ",ad.city," ",ad.postcode),ap.appointment_address) AS appointment_address,`;
                select += `cs.customer_id,cs.firstname as customer_name,`;
                select += `nt.note_id,nt.note_content,`;
                select += `sc.checkin_id,sc.checkin,sc.checkout`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_appointment ap`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=ap.customer_id`, `LEFT`);
                that.db.join(`${dbname}.oc_address ad ON ad.address_id=cs.address_id`, `LEFT`);
                that.db.join(`${dbname}.oc_notes nt ON nt.appointment_id=ap.appointment_id`, `LEFT`);
                that.db.join(`${dbname}.oc_salesrep_checkins sc ON sc.appointment_id=ap.appointment_id`, `LEFT`);
                that.db.where(`cs.customer_id=${id} AND DATE_FORMAT(ap.appointment_date,"%Y-%m-%d") >= DATE_FORMAT(NOW(),"%Y-%m-%d")`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    var response = {
                        status: 200,
                        error: false,
                        appointments: results
                    };
                    reply(response);
                });
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

/**
 * Get a single customer
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomer = function(id, reply) {
    this.findCustomerByProperty('cs.customer_id', id, reply);
};

/**
 * Create new customer
 * @param {object}      newCustomer
 * @param {function}    reply
 * @return {object}
 */
CustomersModel.prototype.addCustomer = function(newCustomer, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            /**
             * Check if company is found
             */
            if (results.length > 0) {
                const dbname = results[0].companydb;
                var columns = `customer_group_id,salesrep_id,store_id,language_id,firstname,lastname,email,telephone,fax,password,salt,newsletter,address_id,custom_field,ip,status,approved,safe,token,code,date_added`;
                var values = `${newCustomer.customer_group_id},${newCustomer.rep_id},${newCustomer.store_id},${newCustomer.language_id},'${newCustomer.firstname}','${newCustomer.lastname}','${newCustomer.email}','${newCustomer.telephone}','${newCustomer.fax}','${newCustomer.password}','${newCustomer.salt}',${newCustomer.newsletter},${newCustomer.address_id},'${newCustomer.custom_field}','${newCustomer.ip}',${newCustomer.status},${newCustomer.approved},${newCustomer.safe},'${newCustomer.token}','${newCustomer.code}', NOW()`;
                connection.query(that.db.insert(`${dbname}.oc_customer`, columns, values),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        const customerId = results.insertId;
                        const addressCustomField = "";
                        // get GPS coordinates for the address specified
                        geonoder.toCoordinates(newCustomer.address, geonoder.providers.google, function(lat, long) {
                            // insert into the customer address table
                            var latitude = (lat != "null" && lat != null) ? lat : "";
                            var longitude = (long != "null" && lat != null) ? long : "";
                            var columns = `customer_id,firstname,lastname,company,address_1,address_2,city,postcode,country_id,zone_id,custom_field,latitude,longitude`;
                            var values = `${customerId},'${newCustomer.firstname}','${newCustomer.lastname}','${newCustomer.company_name}','${newCustomer.address_1}','${newCustomer.address_2}','${newCustomer.city}','${newCustomer.postcode}',${newCustomer.country_id},${newCustomer.region_id},'${addressCustomField}','${latitude}','${longitude}'`;
                            connection.query(that.db.insert(`${dbname}.oc_address`, columns, values),
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {
                                    const addressId = results.insertId;
                                    // update customer table with the address id
                                    var set = `address_id=${addressId}`;
                                    var condition = `customer_id=${customerId}`;
                                    connection.query(that.db.update(`${dbname}.oc_customer`, set, condition),
                                    function (error, results, fields) {
                                        if (error) {
                                            throw error;
                                        } else {
                                            var response = {
                                                status: 200,
                                                error: false,
                                                message: "success",
                                                customer: {
                                                    customer_id: customerId,
                                                    address_id: addressId
                                                }
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
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

/**
 * Get a single customer
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.getCustomer = function(id, reply) {
    this.findCustomerByProperty('cs.customer_id', id, reply);
};

/**
 * Create new customer
 * @param {number}      id
 * @param {object}      newContact
 * @param {function}    reply
 * @return {object}
 */
CustomersModel.prototype.addCustomerContact = function(id, newContact, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            /**
             * Check if company is found
             */
            if (results.length > 0) {
                const dbname = results[0].companydb;
                var columns = `first_name,last_name,email,telephone_number,cellphone_number,customer_id,role`;
                var values = `'${newContact.first_name}','${newContact.email}','${newContact.last_name}','${newContact.telephone}','${newContact.cell}',${id},'${newContact.role}'`;
                connection.query(that.db.insert(`${dbname}.oc_customer_contact`, columns, values),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            message: "success",
                            contact: {
                                contact_id: results.insertId
                            }
                        };
                        reply(response);
                    }
                });
                
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

/**
 * Update customer details
 * @param  {number}     id
 * @param  {object}     updatedCustomer
 * @param  {function}   reply
 * @return {object}
 */
CustomersModel.prototype.updateCustomer = function(id, updatedCustomer, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                const dbname = results[0].companydb;
                var set = `email='${updatedCustomer.email}',telephone='${updatedCustomer.telephone}',fax='${updatedCustomer.fax}'`;
                var condition = `customer_id=${id}`;
                connection.query(that.db.update(`${dbname}.oc_customer`, set, condition),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var set = `address_1='${updatedCustomer.address_1}',address_2='${updatedCustomer.address_2}',city='${updatedCustomer.city}',postcode='${updatedCustomer.postcode}',zone_id=${updatedCustomer.region_id},country_id=${updatedCustomer.country_id}`;
                        var condition = `address_id=${updatedCustomer.address_id}`;
                        connection.query(that.db.update(`${dbname}.oc_address`, set, condition),'.oc_address SET  WHERE address_id='+address_id,
                        function (error, results, fields) {
                            if (error) {
                                throw error;
                            } else {
                                var response = {
                                    status: 200,
                                    error: false,
                                    message: "success"
                                };
                                reply(response);
                            }
                        });
                    }
                });
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

/**
 * Delete customer
 * @param  {number}
 * @param  {function}
 * @return {object}
 */
CustomersModel.prototype.deleteCustomer = function(id, reply) {
    var that = this;
    this.db.select(`companydb`);
    this.db.from(`super.companies`);
    this.db.where(`company_id=${this.company_id}`);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                var dbname = results[0].companydb;
                connection.query(that.db.delete(`${dbname}.oc_customer`, `customer_id=${id}`),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            message: "success"
                        };
                        reply(response);
                    }
                });
            } else {
                // company not found
                var response = {
                    status: 400,
                    error: true,
                    message: "Invalid company identifier"
                };
                reply(response);
            }
        }
    });
};

module.exports = CustomersModel;
