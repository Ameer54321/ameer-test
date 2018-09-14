'use strict';

const config = require('../config');
const crypto = require('crypto');
const parser = require('json-parser');
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
function ProductsModel(database) {
    this.db = database;
    this.company_id = 0;
    this.start = 0;
    this.limit = 0;
    this.orderby = "";
    this.sorting = "";
    this.group = 1;
    this.image_size = "40x40";
    this.products = null;
};

/**
 * Set company id
 * @param  {number}     company_id
 */
ProductsModel.prototype.setCompanyId = function(company_id) {
    this.company_id = company_id;
}

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
ProductsModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
ProductsModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Set contract pricing [group]
 * @param  {number}     group
 */
ProductsModel.prototype.setGroup = function(group) {
    this.group = group;
}

/**
 * Set product image size
 * @param  {string}     image_size
 */
ProductsModel.prototype.setImageSize = function(image_size) {
    this.image_size = (image_size == null) ? "40x40" : image_size;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {string}     products
 */
ProductsModel.prototype.setFilteredProducts = function(products) {
    this.products = products;
}

/**
 * Get products
 * @param  {function}   reply
 * @return {object}
 */
ProductsModel.prototype.getProducts = function(reply) {
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
                var where = `pr.status=1`;
                where += (that.products == null) ? `` : ` AND pr.product_id IN (${that.products})`;
                if (that.group == null) {
                    that.db.select(`pr.product_id,pr.sku,pr.stock_status_id,pd.name,pr.price,IF(pr.image="","",REPLACE(CONCAT(rs.store_url,"image/cache/",pr.image), ".jpg", "-${that.image_size}.jpg")) AS product_image_src,pr.tax_class_id AS vat_status_id`);
                    that.db.from(`${dbname}.oc_product pr`);
                    that.db.join(`${dbname}.oc_product_description pd ON pd.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_customer_group pc ON pc.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_rep_settings rs ON rs.company_id=${that.company_id}`, `LEFT`);
                    that.db.join(`${dbname}.oc_customer cs ON cs.customer_group_id=pc.customer_group_id`, `LEFT`);
                    that.db.where(where);
                    that.db.group(`pr.product_id`);
                    that.db.order(that.orderby, that.sorting);
                    that.db.limit(that.start, that.limit);
                } else {
                    that.db.select(`pr.product_id,pr.sku,pr.stock_status_id,pd.name,IF(gp.price>=0,gp.price,pr.price) AS price,IF(pr.image="","",REPLACE(CONCAT(rs.store_url,"image/cache/",pr.image), ".jpg", "-${that.image_size}.jpg")) AS product_image_src,pr.tax_class_id AS vat_status_id`);
                    that.db.from(`${dbname}.oc_product pr`);
                    that.db.join(`${dbname}.oc_product_description pd ON pd.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_customer_group pc ON pc.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_rep_settings rs ON rs.company_id=${that.company_id}`, `LEFT`);
                    that.db.join(`${dbname}.oc_product_to_customer_group_prices gp ON gp.product_id=pr.product_id AND gp.customer_group_id=${that.group}`, `LEFT`);
                    that.db.join(`${dbname}.oc_customer cs ON cs.customer_group_id=pc.customer_group_id`, `LEFT`);
                    that.db.where(where);
                    that.db.group(`pr.product_id`);
                    that.db.order(that.orderby, that.sorting);
                    that.db.limit(that.start, that.limit);
                }
                
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            products: results
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
 * Find products by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
ProductsModel.prototype.findProductByProperty = function(prop, value, reply) {
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
                var where = `pr.status=1`;
                where += (that.products == null) ? `` : ` AND pr.product_id IN (${that.products})`;
                if (prop == "group" || prop == "customer_group_id") {
                    that.db.select(`pr.product_id,pr.sku,pr.stock_status_id,pd.name,IF(gp.price>=0,gp.price,pr.price) AS price,IF(pr.image="","",REPLACE(CONCAT(rs.store_url,"image/cache/",pr.image), ".jpg", "-${that.image_size}.jpg")) AS product_image_src,pr.tax_class_id AS vat_status_id`);
                    that.db.from(`${dbname}.oc_product pr`);
                    that.db.join(`${dbname}.oc_product_description pd ON pd.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_customer_group pc ON pc.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_rep_settings rs ON rs.company_id=${that.company_id}`, `LEFT`);
                    that.db.join(`${dbname}.oc_product_to_customer_group_prices gp ON gp.product_id=pr.product_id AND gp.customer_group_id=${value}`, `LEFT`);
                    that.db.join(`${dbname}.oc_customer cs ON cs.customer_group_id=pc.customer_group_id`, `LEFT`);
                    that.db.where(where);
                    that.db.group(`pr.product_id`);
                    that.db.order(that.orderby, that.sorting);
                    that.db.limit(that.start, that.limit);
                } else {
                    where += ` AND pr.${prop}='${value}'`;
                    that.db.select(`pr.product_id,pr.sku,pr.stock_status_id,pd.name,pr.price,IF(pr.image="","",REPLACE(CONCAT(rs.store_url,"image/cache/",pr.image), ".jpg", "-${that.image_size}.jpg")) AS product_image_src,pr.tax_class_id AS vat_status_id`);
                    that.db.from(`${dbname}.oc_product pr`);
                    that.db.join(`${dbname}.oc_product_description pd ON pd.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_customer_group pc ON pc.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_rep_settings rs ON rs.company_id=${that.company_id}`, `LEFT`);
                    that.db.join(`${dbname}.oc_customer cs ON cs.customer_group_id=pc.customer_group_id`, `LEFT`);
                    that.db.where(where);
                    that.db.group(`pr.product_id`);
                    that.db.order(that.orderby, that.sorting);
                    that.db.limit(that.start, that.limit);
                }
                console.log(that.db.get());
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        if (results.length === 1 && prop === "product_id") {
                            const productDetails = results[0];
                            // get product attributes
                            that.db.select(`at.attribute_id,ad.name AS attribute_name,pa.text AS attribute_value,at.sort_order`);
                            that.db.from(`${dbname}.oc_product_attribute pa`);
                            that.db.join(`${dbname}.oc_attribute at ON at.attribute_id=pa.attribute_id`);
                            that.db.join(`${dbname}.oc_attribute_description ad ON ad.attribute_id=at.attribute_id`);
                            that.db.where(`pa.product_id=${productDetails.product_id}`);
                            connection.query(that.db.get(),
                                function (error, results, fields) {
                                    if (error) {
                                        throw error;
                                    } else {
                                        var response = {
                                            status: 200,
                                            error: false,
                                            products: productDetails,
                                            product_attributes: results
                                        };
                                        reply(response);
                                    }
                                });
                        } else {
                            var response = {
                                status: 200,
                                error: false,
                                products: results
                            };
                            reply(response);
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
 * Get product by category
 * @param  {number}     category_id
 * @param  {function}   reply
 * @return {object}
 */
ProductsModel.prototype.getProductsByCategory = function(category_id, reply) {
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
                var where = `ct.category_id=${category_id} AND pr.status=1`;
                where += (that.products == null) ? `` : ` AND pr.product_id IN (${that.products})`;
                if (that.group == null) {
                    that.db.select(`pr.product_id,pr.sku,pr.stock_status_id,pd.name,pr.price,IF(pr.image="","",REPLACE(CONCAT(rs.store_url,"image/cache/",pr.image), ".jpg", "-${that.image_size}.jpg")) AS product_image_src,pr.tax_class_id AS vat_status_id`);
                    that.db.from(`${dbname}.oc_product pr`);
                    that.db.join(`${dbname}.oc_product_description pd ON pd.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_customer_group pc ON pc.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_category ct ON ct.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_rep_settings rs ON rs.company_id=${that.company_id}`, `LEFT`);
                    that.db.join(`${dbname}.oc_customer cs ON cs.customer_group_id=pc.customer_group_id`, `LEFT`);
                    that.db.where(where);
                    that.db.group(`pr.product_id`);
                    that.db.order(that.orderby, that.sorting);
                    that.db.limit(that.start, that.limit);
                } else {
                    that.db.select(`pr.product_id,pr.sku,pr.stock_status_id,pd.name,IF(gp.price>=0,gp.price,pr.price) AS price,IF(pr.image="","",REPLACE(CONCAT(rs.store_url,"image/cache/",pr.image), ".jpg", "-${that.image_size}.jpg")) AS product_image_src,pr.tax_class_id AS vat_status_id`);
                    that.db.from(`${dbname}.oc_product pr`);
                    that.db.join(`${dbname}.oc_product_description pd ON pd.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_customer_group pc ON pc.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_product_to_category ct ON ct.product_id=pr.product_id`);
                    that.db.join(`${dbname}.oc_rep_settings rs ON rs.company_id=${that.company_id}`, `LEFT`);
                    that.db.join(`${dbname}.oc_product_to_customer_group_prices gp ON gp.product_id=pr.product_id AND gp.customer_group_id=${that.group}`, `LEFT`);
                    that.db.join(`${dbname}.oc_customer cs ON cs.customer_group_id=pc.customer_group_id`, `LEFT`);
                    that.db.where(where);
                    that.db.group(`pr.product_id`);
                    that.db.order(that.orderby, that.sorting);
                    that.db.limit(that.start, that.limit);
                }
                
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response = {
                            status: 200,
                            error: false,
                            products: results
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
 * Get a single product
 * @param  {number}
 * @param  {function}   reply
 * @return {object}
 */
ProductsModel.prototype.getProduct = function(id, reply) {
    this.findProductByProperty('product_id', id, reply);
};

/**
 * Get product categories
 * @param  {function}   reply
 * @return {object}
 */
ProductsModel.prototype.getProductCategories = function(reply) {
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
                that.db.select(`ct.category_id,cd.name,ct.parent_id`);
                that.db.from(`${dbname}.oc_category ct`);
                that.db.join(`${dbname}.oc_category_description cd ON cd.category_id=ct.category_id`);
                that.db.join(`${dbname}.oc_category_to_customer_group cc ON cc.category_id=ct.category_id`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_group_id=cc.customer_group_id`);
                that.db.group(`ct.category_id`);
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
                            categories: results
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

module.exports = ProductsModel;
