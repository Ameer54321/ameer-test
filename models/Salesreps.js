'use strict';

const config = require('../config');
const crypto = require('crypto');
const parser = require('json-parser');
const geonoder = require('geonoder');
const MySQL = require('mysql');
const comms = require('../functions/communications');
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
function SalesrepsModel(database) {
    this.db = database;
    this.company_id = 0;
    this.start = 0;
    this.limit = 0;
    this.orderby = "";
    this.sorting = "";
};

/**
 * Set company id
 * @param  {number}     company_id
 */
SalesrepsModel.prototype.setCompanyId = function(company_id) {
    this.company_id = company_id;
}

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
SalesrepsModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
SalesrepsModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get sales reps
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesreps = function(reply) {
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
                select  = `sr.salesrep_id,sr.salesrep_name,sr.cell,sr.tel,`;
                select += `sr.email,co.company_id,co.companyname,st.team_id,st.team_name`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_salesrep sr`);
                that.db.join(`super.user usr ON usr.realId=sr.salesrep_id`);
                that.db.join(`super.companies co ON co.company_id=usr.companyId`);
                that.db.join(`${dbname}.oc_team st ON st.team_id=sr.sales_team_id`, `LEFT`);
                that.db.group(`sr.salesrep_id`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            salesreps: results
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
 * Find sales reps by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.findSalesrepByProperty = function(prop, value, reply) {
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
                select  = `sr.salesrep_id,sr.salesrep_name,sr.cell,sr.tel,`;
                select += `sr.email,co.company_id,co.companyname,st.team_id,st.team_name`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_salesrep sr`);
                that.db.join(`super.user usr ON usr.realId=sr.salesrep_id`);
                that.db.join(`super.companies co ON co.company_id=usr.companyId`);
                that.db.join(`${dbname}.oc_team st ON st.team_id=sr.sales_team_id`, `LEFT`);
                that.db.where(`${prop}='${value}'`);
                that.db.group(`sr.salesrep_id`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            salesreps: results
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
 * Get single sales rep
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrep = function(id, reply) {
    this.findSalesrepByProperty('sr.salesrep_id', id, reply);
};

/**
 * Get appointments associated with sales rep
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepAppointments = function(id, reply) {
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
                select  = `ap.appointment_id,ap.appointment_name,ap.appointment_description,ap.appointment_date,ap.type,IF(type="Existing Business" AND ap.appointment_address IS NULL,CONCAT(ad.address_1," ",ad.address_2," ",ad.city," ",ad.postcode),ap.appointment_address) AS appointment_address,`;
                select += `IF(type="New Business",pc.prospect_id,cs.customer_id) AS customer_id,IF(type="New Business",pc.name,cs.firstname) AS customer_name,nt.note_id,nt.note_content,sc.checkin_id,sc.checkin,sc.checkout`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_appointment ap`);
                that.db.join(`${dbname}.oc_salesrep_checkins sc ON sc.appointment_id=ap.appointment_id`, `LEFT`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=ap.customer_id`, `LEFT`);
                that.db.join(`${dbname}.oc_address ad ON ad.address_id=cs.address_id`, `LEFT`);
                that.db.join(`${dbname}.oc_notes nt on nt.appointment_id=ap.appointment_id`, `LEFT`);
                that.db.join(`${dbname}.oc_prospective_customer pc ON pc.prospect_id=ap.customer_id`, `LEFT`);
                that.db.where(`ap.salesrep_id=${id} AND YEAR(ap.appointment_date) = YEAR(CURDATE()) AND MONTH(ap.appointment_date)=MONTH(CURDATE())`);
                that.db.order(`ap.appointment_date`);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            appointments: results
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
 * Get appointments by type associated with sales rep
 * @param  {number}     id
 * @param  {string}     type
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepAppointmentsByType = function(id, type, reply) {
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
                var where = `ap.salesrep_id=${id}`;
                switch (type) {
                    case "today":
                        where += ` AND DATE_FORMAT(ap.appointment_date,"%Y-%m-%d")=DATE_FORMAT(NOW(),"%Y-%m-%d")`;
                        break;

                    case "week":
                        where += ` AND YEARWEEK(ap.appointment_date)=YEARWEEK(CURDATE())`;
                        break;

                    case "month":
                        where += ` AND YEAR(ap.appointment_date)=YEAR(CURDATE()) AND MONTH(ap.appointment_date)=MONTH(CURDATE())`;
                        break;

                    default:
                        if ((new Date(type)).toString() !== "Invalid Date") {
                            where += ` AND CAST(ap.appointment_date AS DATE)='${type}'`;
                        }
                        break;
                }
                var dbname = results[0].companydb;
                var select;
                select  = `ap.appointment_id,ap.appointment_name,ap.appointment_description,ap.appointment_date,ap.type,IF(type="Existing Business" AND ap.appointment_address IS NULL,CONCAT(ad.address_1," ",ad.address_2," ",ad.city," ",ad.postcode),ap.appointment_address) AS appointment_address,`;
                select += `IF(type="New Business",pc.prospect_id,cs.customer_id) AS customer_id,IF(type="New Business",pc.name,cs.firstname) AS customer_name,nt.note_id,nt.note_content,sc.checkin_id,sc.checkin,sc.checkout`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_appointment ap`);
                that.db.join(`${dbname}.oc_salesrep_checkins sc ON sc.appointment_id=ap.appointment_id`, `LEFT`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=ap.customer_id`, `LEFT`);
                that.db.join(`${dbname}.oc_address ad ON ad.address_id=cs.address_id`, `LEFT`);
                that.db.join(`${dbname}.oc_notes nt on nt.appointment_id=ap.appointment_id`, `LEFT`);
                that.db.join(`${dbname}.oc_prospective_customer pc ON pc.prospect_id=ap.customer_id`, `LEFT`);
                that.db.where(where);
                that.db.order(`ap.appointment_date`);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            appointments: results
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
 * Get customers associated with sales rep
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepCustomers = function(id, reply) {
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
                select = `cs.customer_id,cs.firstname,cs.lastname,cs.email,cs.telephone,cs.fax,cs.address_id,`;
                select += `ca.address_1,ca.address_2,ca.city,ca.postcode,ca.country_id,ca.zone_id AS region_id`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_customer cs`);
                that.db.join(`${dbname}.oc_address ca ON ca.address_id=cs.address_id`);
                that.db.where(`cs.salesrep_id=${id} AND cs.status=1 AND cs.approved=1`);
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
 * Get customer visits associated with sales rep
 * @param  {number}     id
 * @param  {number}     customer_id
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepCustomerAppointments = function(id, customer_id, reply) {
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
                select  = `ap.appointment_id,ap.appointment_name,ap.appointment_description,ap.appointment_date,ap.type,IF(type="Existing Business" AND ap.appointment_address IS NULL,CONCAT(ad.address_1," ",ad.address_2," ",ad.city," ",ad.postcode),ap.appointment_address) AS appointment_address,`;
                select += `IF(type="New Business",pc.prospect_id,cs.customer_id) AS customer_id,IF(type="New Business",pc.name,cs.firstname) AS customer_name,nt.note_id,nt.note_content,sc.checkin_id,sc.checkin,sc.checkout`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_appointment ap`);
                that.db.join(`${dbname}.oc_salesrep_checkins sc ON sc.appointment_id=ap.appointment_id`, `LEFT`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=ap.customer_id`, `LEFT`);
                that.db.join(`${dbname}.oc_address ad ON ad.address_id=cs.address_id`, `LEFT`);
                that.db.join(`${dbname}.oc_notes nt on nt.appointment_id=ap.appointment_id`, `LEFT`);
                that.db.join(`${dbname}.oc_prospective_customer pc ON pc.prospect_id=ap.customer_id`, `LEFT`);
                that.db.where(`ap.salesrep_id=${id} AND cs.customer_id=${customer_id} AND DATE_FORMAT(ap.appointment_date,"%Y-%m-%d") >= DATE_FORMAT(NOW(),"%Y-%m-%d")`);
                that.db.order(`ap.appointment_date`);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            appointments: results
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
 * Get customer visits associated with sales rep
 * @param  {number}     id
 * @param  {number}     customer_id
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepCustomerVisits = function(id, customer_id, reply) {
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
                select  = `rc.checkin_id,rc.start,rc.end,rc.checkin,rc.checkout,rc.location,rc.checkin_location,rc.remarks,rc.latitude,rc.longitude,`;
                select += `ap.type,ap.appointment_name,ap.appointment_description`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_salesrep_checkins rc`);
                that.db.join(`${dbname}.oc_appointment ap ON ap.appointment_id=rc.appointment_id`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=rc.customer_id`);
                that.db.where(`rc.salesrep_id=${id} AND cs.customer_id=${customer_id}`);
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
 * Get customer visits by type associated with sales rep
 * @param  {number}     id
 * @param  {number}     customer_id
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepCustomerVisitsByType = function(id, customer_id, type, reply) {
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
                var where = `rc.salesrep_id=${id} AND cs.customer_id=${customer_id}`;
                switch (type) {
                    case "today":
                        where += ` AND DATE_FORMAT(rc.checkin,"%Y-%m-%d")=DATE_FORMAT(NOW(),"%Y-%m-%d")`;
                        break;

                    case "week":
                        where += ` AND YEARWEEK(rc.checkin)=YEARWEEK(CURDATE())`;
                        break;

                    case "month":
                        where += ` AND YEAR(rc.checkin)=YEAR(CURDATE()) AND MONTH(rc.checkin)=MONTH(CURDATE())`;
                        break;

                    default:
                        if ((new Date(type)).toString() !== "Invalid Date") {
                            where += ` AND CAST(rc.checkin AS DATE)='${type}'`;
                        }
                        break;
                }
                var dbname = results[0].companydb;
                var select;
                select  = `rc.checkin_id,rc.start,rc.end,rc.checkin,rc.checkout,rc.location,rc.checkin_location,rc.remarks,rc.latitude,rc.longitude,`;
                select += `ap.type,ap.appointment_name,ap.appointment_description`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_salesrep_checkins rc`);
                that.db.join(`${dbname}.oc_appointment ap ON ap.appointment_id=rc.appointment_id`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=rc.customer_id`);
                that.db.where(where);
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
 * Get orders associated with sales rep
 * @param  {number}     id
 * @param  {number}     customer_id
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepCustomerOrders = function(id, customer_id, reply) {
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
                that.db.select(`od.order_id,od.order_status_id,cs.salesrep_id,od.date_added,FORMAT(od.total,2) AS order_total,cs.firstname AS customer_name,CONCAT(cc.first_name," ",cc.last_name) AS contact_name`);
                that.db.from(`${dbname}.oc_order od`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=od.customer_id`);
                that.db.join(`${dbname}.oc_replogic_order_quote oq ON oq.order_id=od.order_id`, `LEFT`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`, `LEFT`);
                that.db.where(`cs.salesrep_id=${id} AND cs.customer_id=${customer_id} AND od.isReplogic=1 AND od.order_status_id IN (1,15)`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            orders: results
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
 * Get customer orders by property associated with sales rep
 * @param  {number}     id
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepCustomerOrdersByProperty = function(id, customer_id, prop, value, reply) {
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
                var select = `od.order_id,od.order_status_id,cs.salesrep_id,od.date_added,FORMAT(od.total,2) AS order_total,cs.firstname AS customer_name,CONCAT(cc.first_name," ",cc.last_name) AS contact_name`;
                var where = `cs.salesrep_id=${id} AND od.customer_id=${customer_id} AND od.isReplogic=1`;
                if (prop === "status") {
                    switch (`${value}`.toLowerCase()) {
                        case "pending":
                            where += ` AND od.order_status_id=1`;
                            break;

                        case "processing":
                            where += ` AND od.order_status_id=2`;
                            break;

                        case "shipped":
                            where += ` AND od.order_status_id=3`;
                            break;

                        case "complete":
                            where += ` AND od.order_status_id=5`;
                            break;

                        case "canceled":
                            where += ` AND od.order_status_id=7`;
                            break;

                        case "refunded":
                            where += ` AND od.order_status_id=11`;
                            break;

                        case "processed":
                            where += ` AND od.order_status_id=15`;
                            break;

                        case "out of stock":
                            where += ` AND od.order_status_id=17`;
                            break;

                        default:
                            where += ` AND od.order_status_id IN (1,15)`;
                            break;
                    }
                } else {
                    where += ` AND od.o${prop}='${value}'`;
                }
                
                that.db.select(select);
                that.db.from(`${dbname}.oc_order od`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=od.customer_id`);
                that.db.join(`${dbname}.oc_replogic_order_quote oq ON oq.order_id=od.order_id`, `LEFT`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`, `LEFT`);
                that.db.where(where);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            orders: results
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
 * Get orders associated with sales rep
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepOrders = function(id, reply) {
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
                that.db.select(`od.order_id,od.order_status_id,cs.salesrep_id,od.date_added,FORMAT(od.total,2) AS order_total,cs.firstname AS customer_name,CONCAT(cc.first_name," ",cc.last_name) AS contact_name`);
                that.db.from(`${dbname}.oc_order od`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=od.customer_id`);
                that.db.join(`${dbname}.oc_replogic_order_quote oq ON oq.order_id=od.order_id`, `LEFT`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`, `LEFT`);
                that.db.where(`cs.salesrep_id=${id} AND od.isReplogic=1`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            orders: results
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
 * Get orders by property associated with sales rep
 * @param  {number}     id
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepOrdersByProperty = function(id, prop, value, reply) {
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
                var select = `od.order_id,od.order_status_id,cs.salesrep_id,od.date_added,FORMAT(od.total,2) AS order_total,cs.firstname AS customer_name,CONCAT(cc.first_name," ",cc.last_name) AS contact_name`;
                var selectCount = `COUNT(*) AS qty`;
                var selectTotal = `FORMAT(COALESCE(SUM(od.total), 0), 2) AS total`;
                var where = `cs.salesrep_id=${id} AND od.isReplogic=1`;
                if (`${prop}`.toLowerCase() === "status" || `${prop}`.toLowerCase() === "count" || `${prop}`.toLowerCase() === "total") {
                    switch (`${value}`.toLowerCase()) {
                        case "pending":
                            where += ` AND od.order_status_id=${config.statuses.orders.pending}`;
                            break;

                        case "processing":
                            where += ` AND od.order_status_id=${config.statuses.orders.processing}`;
                            break;

                        case "confirmed":
                            where += ` AND od.order_status_id=${config.statuses.orders.confirmed}`;
                            break;

                        case "canceled":
                        case "cancelled":
                            where += ` AND od.order_status_id=${config.statuses.orders.cancelled}`;
                            break;

                        default:
                            where += ` AND od.order_status_id IN (${config.statuses.orders.pending},${config.statuses.orders.confirmed})`;
                            break;
                    }
                    if (prop === "count") {
                        select = selectCount;
                        where += ` AND DATE_FORMAT(od.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                    } else if (prop === "total") {
                        select = selectTotal;
                        if (`${value}`.toLowerCase() === "current") {
                            where += ` AND DATE_FORMAT(od.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        } else {
                            where += ` AND DATE_FORMAT(od.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        }
                    }
                } else {
                    where += ` AND od.${prop}='${value}'`;
                }
                
                that.db.select(select);
                that.db.from(`${dbname}.oc_order od`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=od.customer_id`);
                that.db.join(`${dbname}.oc_replogic_order_quote oq ON oq.order_id=od.order_id`, `LEFT`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`, `LEFT`);
                that.db.where(where);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            orders: results
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
 * Get quotes associated with sales rep
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepQuotes = function(id, reply) {
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
                that.db.select(`oq.quote_id,oq.status,oq.cart,oq.date_added,cs.firstname AS customer_name,CONCAT(cc.first_name, " ", cc.last_name) AS contact_name`);
                that.db.from(`${dbname}.oc_replogic_order_quote oq`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=oq.customer_id`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`);
                that.db.where(`oq.salesrep_id=${id} AND oq.status IN (0,2)`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
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
 * Get quotes associated with sales rep
 * @param  {number}     id
 * @param  {number}     customer_id
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepCustomerQuotes = function(id, customer_id, reply) {
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
                var select = `oq.quote_id,oq.status,oq.date_added,oq.cart,cs.firstname AS customer_name,CONCAT(cc.first_name, " ", cc.last_name) AS contact_name`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_replogic_order_quote oq`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=oq.customer_id`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`);
                that.db.where(`oq.salesrep_id=${id} AND oq.status IN (0,2) AND cs.customer_id=${customer_id}`);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
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
 * Get quotes by property associated with sales rep
 * @param  {number}     id
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepCustomerQuotesByProperty = function(id, customer_id, prop, value, reply) {
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
                var select = `oq.quote_id,oq.status,oq.cart,oq.date_added,cs.firstname AS customer_name,CONCAT(cc.first_name, " ", cc.last_name) AS contact_name`;
                var where = `oq.salesrep_id=${id} AND oq.customer_id=${customer_id}`;
                switch (prop) {
                    case "status":
                        if (`${value}`.toLowerCase() === "pending") {
                            where += ` AND oq.status=0`;
                        }
                        if (`${value}`.toLowerCase() === "approved") {
                            where += ` AND oq.status=1`;
                        }
                        if (`${value}`.toLowerCase() === "declined") {
                            where += ` AND oq.status=2`;
                        }
                        break;

                    default:
                        where += ` AND oq.${prop}='${value}'`;
                        break;
                }
                var dbname = results[0].companydb;
                that.db.select(select);
                that.db.from(`${dbname}.oc_replogic_order_quote oq`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=oq.customer_id`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`);
                that.db.where(where);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
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
 * Get quotes by property associated with sales rep
 * @param  {number}     id
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.getSalesrepQuotesByProperty = function(id, prop, value, reply) {
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
                var select = `oq.quote_id,oq.status,oq.cart,oq.date_added,cs.firstname AS customer_name,CONCAT(cc.first_name, " ", cc.last_name) AS contact_name`;
                var selectCount = `COUNT(*) AS qty`;
                var selectTotal = `oq.cart`;
                var where = `oq.salesrep_id=${id}`;
                switch (`${prop}`) {
                    case "count":
                        select = selectCount;
                        if (`${value}`.toLowerCase() === "pending") {
                            where += ` AND oq.status=${config.statuses.quotes.pending} AND DATE_FORMAT(oq.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        }
                        if (`${value}`.toLowerCase() === "converted") {
                            where += ` AND oq.status=${config.statuses.quotes.converted} AND DATE_FORMAT(oq.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        }
                        if (`${value}`.toLowerCase() === "denied") {
                            where += ` AND oq.status=${config.statuses.quotes.denied} AND DATE_FORMAT(oq.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        }
                        break;

                    case "total":
                        select = selectTotal;
                        if (`${value}`.toLowerCase() === "pending") {
                            where += ` AND oq.status=${config.statuses.quotes.pending} AND DATE_FORMAT(oq.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        }
                        if (`${value}`.toLowerCase() === "converted") {
                            where += ` AND oq.status=${config.statuses.quotes.converted} AND DATE_FORMAT(oq.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        }
                        if (`${value}`.toLowerCase() === "denied") {
                            where += ` AND oq.status=${config.statuses.quotes.denied} AND DATE_FORMAT(oq.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        } else {
                            where += ` AND oq.status IN (${config.statuses.quotes.pending},${config.statuses.quotes.converted}) AND DATE_FORMAT(oq.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        }
                        break;

                    default:
                        if (`${prop}`.toLowerCase() === "status" && `${value}`.toLowerCase() === "pending") {
                            where += ` AND oq.status=${config.statuses.quotes.pending}`;
                        } else if (`${prop}`.toLowerCase() === "status" && `${value}`.toLowerCase() === "converted") {
                            where += ` AND oq.status=${config.statuses.quotes.converted}`;
                        } else if (`${prop}`.toLowerCase() === "status" && `${value}`.toLowerCase() === "denied") {
                            where += ` AND oq.status=${config.statuses.quotes.denied}`;
                        } else {
                            where += ` AND oq.${prop}='${value}'`;
                        }
                        break;
                }
                var dbname = results[0].companydb;
                that.db.select(select);
                that.db.from(`${dbname}.oc_replogic_order_quote oq`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=oq.customer_id`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`);
                that.db.where(where);
                that.db.order(that.orderby, that.sorting);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response;
                        if (prop === "total") {
                            var total = 0;
                            if (results.length > 0) {
                                for (var i=0; i<results.length; i++) {
                                    var cart = parser.parse(results[i].cart);
                                    total += cart.cart_total_price;
                                }
                            }
                            response = {
                                status: 200,
                                error: false,
                                quotes: [{total: total.toFixed(2)}]
                            };
                        } else if (prop === "count") {
                            response = {
                                status: 200,
                                error: false,
                                quotes: [{qty: results[0].qty}]
                            };
                        } else {
                            if (results.length > 0) {
                                for (var i=0; i<results.length; i++) {
                                    results[i].cart = parser.parse(results[i].cart);
                                }
                            }
                            response = {
                                status: 200,
                                error: false,
                                quotes: results
                            };
                        }
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
 * Sales rep check in
 * @param  {number}     id
 * @param  {object}     data
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.checkIn = function(id, data, reply) {
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
                that.db.select(`*`);
                that.db.from(`${dbname}.oc_appointment ap`);
                that.db.join(`${dbname}.oc_salesrep_checkins rc ON rc.appointment_id=ap.appointment_id`);
                that.db.where(`ap.appointment_id=${data.appointment_id}`);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        if (results.length > 0) {
                            var response = {
                                status: 400,
                                error: true,
                                message: "Appointment already has a check in"
                            };
                            reply(response);
                        } else {
                            // get gps coordinates for the address specified
                            geonoder.toCoordinates(data.checkin_location, geonoder.providers.google, function(lat, long) {
                                // record sales rep check-in
                                var columns = `salesrep_id,customer_id,appointment_id,location,start,end,checkin,checkin_location,latitude,longitude`;
                                var values = `${id},${data.customer_id},${data.appointment_id},'${data.location}','${data.start}','${data.end}','${data.checkin}','${data.checkin_location}','${lat}','${long}'`;
                                connection.query(that.db.insert(`${dbname}.oc_salesrep_checkins`, columns, values),
                                function (error, results, fields) {
                                    if (error) {
                                        throw error;
                                    } else {
                                        var response = {
                                            status: 200,
                                            error: false,
                                            message: "success",
                                            checkin: {
                                                checkin_id: results.insertId
                                            }
                                        };
                                        reply(response);
                                    }
                                });
                            });
                        }
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
 * Sales rep check out
 * @param  {number}     id
 * @param  {object}     data
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.checkOut = function(id, data, reply) {
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
                var set = `checkout='${data.checkout}',remarks='${data.remarks}'`;
                var condition = `checkin_id=${checkin_id} AND salesrep_id=${id}`;
                connection.query(that.db.update(`${dbname}.oc_salesrep_checkins`, set, condition),
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
 * Change sales rep password
 * @param  {number}     id
 * @param  {object}     data
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.changePassword = function(id, data, reply) {
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
                var set = `password='${data.password}', salt='${data.salt}'`;
                var condition = `email='${data.email}' AND realId=${id}`;
                connection.query(that.db.update(`super.user`, set, condition),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var set = `prompt_change_password=0`;
                        var condition = `salesrep_id=${id}`;
                        connection.query(that.db.update(`${dbname}.oc_salesrep`, set, condition),
                        function (error, results, fields) {
                            if (error) {
                                throw error;
                            } else {
                                that.db.select(`rm.email AS manager_email`);
                                that.db.from(`${dbname}.oc_salesrep sr`);
                                that.db.join(`${dbname}.oc_team rt ON rt.team_id=sr.sales_team_id`);
                                that.db.join(`${dbname}.oc_user rm ON rm.user_id=rt.sales_manager`);
                                that.db.where(`sr.salesrep_id=${id}`);
                                connection.query(that.db.get(),
                                function (error, results, fields) {
                                    if (error) {
                                        throw error;
                                    } else {
                                        if (results.length > 0) {
                                            var supportDesk = {contact: config.support.email};
                                            var manager = {email: results[0].manager_email};
                                            comms.sendChangePassword(data.email, supportDesk, manager, reply);
                                        } else {
                                            var response = {
                                                status: 200,
                                                error: false,
                                                message: "Update success",
                                                email_results: {
                                                    error: "Email not sent to user"
                                                }
                                            };
                                            reply(response);
                                        }
                                    }
                                });
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
 * Create new sales rep
 * @param  {number}     id
 * @param  {object}     data
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.addSalesrep = function(id, data, reply) {
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
                /*
                 * Validate User by Email Address
                 * - check if email address already exists under the same company
                 */
                that.db.select(`*`);
                that.db.from(`email='${email}'`);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        if (results.length > 0) {
                            var response = {
                                status: 400,
                                error: true,
                                message: "Email address specified already exists"
                            };
                            reply(response);
                        } else {
                            // Do database insert for new user into super.user
                            var columns = `username,email,password,salt,companyId,realId`;
                            var values = `'${data.username}','${data.email}','${data.password}','${data.salt}',${that.company_id},${id}`;
                            connection.query(that.db.insert(`super.user`, columns, values),
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {
                                    if (results) {
                                        that.db.select(`rm.email AS manager_email`);
                                        that.db.from(`${dbname}.oc_salesrep sr`);
                                        that.db.join(`${dbname}.oc_team rt ON rt.team_id=sr.sales_team_id`);
                                        that.db.join(`${dbname}.oc_user rm ON rm.user_id=rt.sales_manager`);
                                        that.db.where(`sr.salesrep_id=${id}`);
                                        connection.query(that.db.get(),
                                        function (error, results, fields) {
                                            if (error) {
                                                throw error;
                                            } else {
                                                if (results.length > 0) {
                                                    var support_desk = {contact: config.support.email};
                                                    var manager = {email: results[0].manager_email};
                                                    comms.sendWelcomeEmail(data.email, data.password_plain, support_desk, manager, reply);
                                                } else {
                                                    var response = {
                                                        status: 400,
                                                        error: true,
                                                        message: "An unexpected error has occurred"
                                                    };
                                                    reply(response);
                                                }
                                            }
                                        });
                                    } else {
                                        var response = {
                                            status: 400,
                                            error: true,
                                            message: "An unexpected error has occurred"
                                        };
                                        reply(response);
                                    }
                                }
                            });
                        }
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
 * Create new sales rep
 * @param  {number}     id
 * @param  {object}     data
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.updateSalesrep = function(id, data, reply) {
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
                // update sales rep database table
                var set = `salesrep_name='${data.firstname}',salesrep_lastname='${data.lastname}',cell='${data.cell}',tel='${data.tel}',email='"${data.email}',sales_team_id=${data.team_id}`;
                var condition = `salesrep_id=${id}`;
                connection.query(that.db.update(`${dbname}.oc_salesrep`, set, condition),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        // update super user database table
                        var set = `username='${data.email}',email='${data.email}'`;
                        var condition = `realId=${id} AND companyId=${that.company_id}`;
                        connection.query(that.db.update(`super.user`, set, condition),
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
 * Create new sales rep
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
SalesrepsModel.prototype.deleteSalesrep = function(id, reply) {
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
                var from = `${dbname}.oc_salesrep`;
                var join = `super.user`;
                var condition = `salesrep_id=${id} AND realId=${id}`;
                connection.query(that.db.multidelete(`${dbname}.oc_salesrep,super.user`, from, join, condition),
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

module.exports = SalesrepsModel;