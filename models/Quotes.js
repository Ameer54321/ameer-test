'use strict';

const config = require('../config');
const crypto = require('crypto');
const parser = require('json-parser');
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
function QuotesModel(database) {
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
QuotesModel.prototype.setCompanyId = function(company_id) {
    this.company_id = company_id;
}

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
QuotesModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
QuotesModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get quotes
 * @param  {function}   reply
 * @return {object}
 */
QuotesModel.prototype.getQuotes = function(reply) {
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
                that.db.select(`oq.*,cs.firstname AS customer_name,CONCAT(cc.first_name,' ',cc.last_name) AS contact_name`);
                that.db.from(`${dbname}.oc_replogic_order_quote oq`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=oq.customer_id`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`);
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
 * Find quotes by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
QuotesModel.prototype.findQuoteByProperty = function(prop, value, reply) {
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
                var select = `oq.*,cs.firstname AS customer_name,CONCAT(cc.first_name,' ',cc.last_name) AS contact_name`;
                var selectCount = `COUNT(*) AS qty`;
                var selectTotal = `oq.cart`;
                var where;
                if (`${value}`.toLowerCase() === "pending") {
                    value = 0;
                }
                if (`${value}`.toLowerCase() === "approved") {
                    value = 1;
                }
                if (`${value}`.toLowerCase() === "declined") {
                    value = 2;
                }
                switch (prop) {
                    case "count":
                        select = selectCount;
                        where = `oq.status=${value} AND DATE_FORMAT(oq.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        break;

                    case "total":
                        select = selectTotal;
                        where = `oq.status=${value} AND DATE_FORMAT(oq.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        break;

                    default:
                        if (typeof value === "string")
                            where = `oq.${prop}='${value}' AND DATE_FORMAT(oq.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        else
                            where = `oq.${prop}=${value}`;
                        break;
                }
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
 * Get single quote
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
QuotesModel.prototype.getQuote = function(id, reply) {
    this.findQuoteByProperty('quote_id', id, reply);
};

/**
 * Create new quote
 * @param  {object}     newQuote
 * @param  {function}   reply
 * @return {object}
 */
QuotesModel.prototype.addQuote = function(newQuote, reply, request) {
    var that = this;
    this.db.select(`companydb,companyname`);
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
                const companyName = results[0].companyname;
                const cartJson = JSON.stringify(newQuote.cart);
                var columns = `salesrep_id,customer_id,customer_contact_id,cart,date_added`;
                var values = `${newQuote.rep_id},${newQuote.customer_id},${newQuote.contact_id},'${cartJson}',NOW()`;
                connection.query(that.db.insert(`${dbname}.oc_replogic_order_quote`, columns, values),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        // get newly inserted quote id
                        const quoteId = results.insertId;
                        // get company config settings [address, email, logo, name]
                        that.db.select(`st.key,st.value`);
                        that.db.from(`${dbname}.oc_setting st`);
                        that.db.where(`st.key='config_address' OR st.key='config_email' OR st.key='config_image' OR st.key='config_name'`);
                        connection.query(that.db.get(),
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
                                var select;
                                select  = `qt.quote_id,qt.cart,DATE_FORMAT(qt.date_added, '%M %d, %Y') AS quote_date,`;
                                select += `CONCAT(rp.salesrep_name, ' ',rp.salesrep_lastname) AS rep_name,rp.email AS rep_email,`;
                                select += `cs.firstname AS customer_name,cs.email AS customer_email,CONCAT(cc.first_name, ' ',cc.last_name) AS cust_contact_name,ca.address_1,`;
                                select += `ca.address_2,ca.city,'South Africa' AS country,ca.postcode,rm.email AS manager_email `;
                                that.db.select(select);
                                that.db.from(`${dbname}.oc_replogic_order_quote qt`);
                                that.db.join(`${dbname}.oc_salesrep rp ON rp.salesrep_id=qt.salesrep_id`);
                                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=qt.customer_id`);
                                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=qt.customer_contact_id`);
                                that.db.join(`${dbname}.oc_address ca ON ca.address_id=cs.address_id`);
                                that.db.join(`${dbname}.oc_team rt ON rt.team_id=rp.sales_team_id`);
                                that.db.join(`${dbname}.oc_user rm ON rm.user_id=rt.sales_manager`);
                                that.db.where(`qt.quote_id=${quoteId}`);
                                // get customer email from database to send order confirmation
                                connection.query(that.db.get(),
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
                                                url: config.email.quote_url+'quote-online.html?id='+quoteId+'&cid='+that.company_id,
                                                date: results[0].quote_date,
                                                products: cart.cart_items,
                                                total_excl_vat: cart.cart_total_price.toFixed(2),
                                                total_incl_vat: (cart.cart_total_incl_vat !== undefined) ? cart.cart_total_incl_vat.toFixed(2) : cart.cart_total_price.toFixed(2),
                                                vat: (cart.cart_total_vat !== undefined) ? cart.cart_total_vat.toFixed(2) : 0.00.toFixed(2)
                                            };
                                            var manager = {email: results[0].manager_email};
                                            comms.sendQuoteEmails(customer, manager, company, rep, quote, reply, request);
                                        } else {
                                            var response = {
                                                status: 200,
                                                error: false,
                                                message: "Emails could not be sent",
                                                quote: {
                                                    quote_id: quoteId
                                                }
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
 * Delete quote
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
QuotesModel.prototype.deleteQuote = function(id, reply) {
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
                connection.query(that.db.delete(`${dbname}.oc_replogic_order_quote`, `quote_id=${id}`),
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

module.exports = QuotesModel;
