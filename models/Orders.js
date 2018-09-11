'use strict';

const config = require('../config');
const crypto = require('crypto');
const MySQL = require('mysql');
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
function OrdersModel(database) {
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
OrdersModel.prototype.setCompanyId = function(company_id) {
    this.company_id = company_id;
}

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
OrdersModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
OrdersModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get orders
 * @param  {function}   reply
 * @return {object}
 */
OrdersModel.prototype.getOrders = function(reply) {
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
                select  = `od.order_id,od.order_status_id,cs.salesrep_id,od.date_added,FORMAT(od.total,2) AS order_total,`
                select += `cs.firstname AS customer_name,CONCAT(cc.first_name," ",cc.last_name) AS contact_name`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_order od`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=od.customer_id`);
                that.db.join(`${dbname}.oc_replogic_order_quote oq ON oq.order_id=od.order_id`, `LEFT`);
                that.db.join(`${dbname}.oc_customer_contact cc ON cc.customer_con_id=oq.customer_contact_id`, `LEFT`);
                that.db.where(`od.isReplogic=1`);
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
 * Find orders by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
OrdersModel.prototype.findOrderByProperty = function(prop, value, reply) {
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
                select  = `od.order_id,od.order_status_id,od.customer_id,`
                select += `cs.firstname AS customer,cs.email,cs.telephone,CONCAT(ca.address_1," ",ca.address_2,", ",ca.city," ",ca.postcode) AS address,`;
                select += `CONCAT(od.shipping_firstname," ",od.shipping_lastname) AS shipping_contact,`;
                select += `CONCAT(od.shipping_address_1," ",od.shipping_address_2,", ",od.shipping_city," ",od.shipping_postcode) AS shipping_address,od.total,od.date_added,ot.code,ot.value`;
                var where;
                var selectCount = `COUNT(*) AS qty`;
                var selectTotal = `FORMAT(COALESCE(SUM(od.total), 0), 2) AS total`;
                if (`${prop}` === "status") {
                    prop = "order_status_id";
                }
                if (`${value}`.toLowerCase() === "pending") {
                    value = config.statuses.orders.pending;
                }
                if (`${value}`.toLowerCase() === "processing") {
                    value = config.statuses.orders.processing;
                }
                if (`${value}`.toLowerCase() === "confirmed") {
                    value = config.statuses.orders.confirmed;
                }
                if (`${value}`.toLowerCase() === "canceled" || `${value}`.toLowerCase() === "cancelled") {
                    value = config.statuses.orders.cancelled;
                }
                switch (`${prop}`) {
                    case "count":
                        select = selectCount;
                        where  = `od.isReplogic=1 AND od.order_status_id=${value} AND DATE_FORMAT(od.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        break;

                    case "total":
                        select = selectTotal;
                        if (`${value}`.toLowerCase() === "current") {
                            where = `od.isReplogic=1 AND DATE_FORMAT(od.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        } else {
                            where = `od.isReplogic=1 AND od.order_status_id=${value} AND DATE_FORMAT(od.date_added,"%Y-%m")=DATE_FORMAT(NOW(),"%Y-%m")`;
                        }
                        break;

                    default:
                        where = `od.${prop}='${value}' AND od.isReplogic=1`;
                        break;
                }
                that.db.select(select);
                that.db.from(`${dbname}.oc_order_total ot, ${dbname}.oc_order od`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=od.customer_id`, `LEFT`);
                that.db.join(`${dbname}.oc_address ca ON ca.address_id=cs.address_id`, `LEFT`);
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
 * Get a single order
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
OrdersModel.prototype.getOrder = function(id, reply) {
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
                select  = `od.order_id,od.order_status_id,od.customer_id,`
                select += `cs.firstname AS customer,cs.email,cs.telephone,CONCAT(ca.address_1," ",ca.address_2,", ",ca.city," ",ca.postcode) AS address,`;
                select += `CONCAT(od.shipping_firstname," ",od.shipping_lastname) AS shipping_contact,`;
                select += `CONCAT(od.shipping_address_1," ",od.shipping_address_2,", ",od.shipping_city," ",od.shipping_postcode) AS shipping_address,od.total,od.date_added,ot.code,ot.value`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_order_total ot, ${dbname}.oc_order od`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=od.customer_id`, `LEFT`);
                that.db.join(`${dbname}.oc_address ca ON ca.address_id=cs.address_id`, `LEFT`);
                that.db.where(`od.order_id=${id} AND ot.order_id=${id} AND od.isReplogic=1`);
                that.db.group(`od.order_id`);
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
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
                        // get order lines/products
                        that.db.select(`op.product_id,op.name,op.model,op.quantity,op.price,op.total,op.tax,pr.sku,IF(pr.image="","",CONCAT(st.value, "image/",pr.image)) AS product_image_src`);
                        that.db.from(`${dbname}.oc_setting st, ${dbname}.oc_order_product op`);
                        that.db.join(`${dbname}.oc_product pr ON pr.product_id=op.product_id`);
                        that.db.where(`op.order_id=${id} AND st.key='config_url'`);
                        connection.query(that.db.get(),
                            function (error, results, fields) {
                                if (error) {
                                    throw error;
                                } else {
                                    var response = {
                                        status: 200,
                                        error: false,
                                        orders: orders,
                                        order_lines: results
                                    }
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

module.exports = OrdersModel;