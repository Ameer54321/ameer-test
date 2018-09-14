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
function CountriesModel(database) {
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
CountriesModel.prototype.setCompanyId = function(company_id) {
    this.company_id = company_id;
}

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
CountriesModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
CountriesModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get countries
 * @param  {function} reply
 * @return {object}
 */
CountriesModel.prototype.getCountries = function(reply) {
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
                that.db.select(`c.country_id,c.name,c.iso_code_2,c.iso_code_3`);
                that.db.from(`${dbname}.oc_country c`);
                that.db.where(`c.status=1`);
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
                            countries: results
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
 * Find country by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
CountriesModel.prototype.findCountryByProperty = function(prop, value, reply) {
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
                that.db.select(`c.country_id,c.name,c.iso_code_2,c.iso_code_3`);
                that.db.from(`${dbname}.oc_country c`);
                that.db.where(`${prop}='${value}' AND c.status=1`);
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
                            countries: results
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
 * Get single country
 * @param  {number}     id
 * @param  {function}
 * @return {object}
 */
CountriesModel.prototype.getCountry = function(id, reply) {
    this.findCountryByProperty('country_id', id, reply);
};

/**
 * Get provinces by country id
 * @param  {number}     id     [country id]
 * @param  {function}   reply
 * @return {object}
 */
CountriesModel.prototype.getProvinces = function(id, reply) {
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
                that.db.select(`z.zone_id AS region_id,z.country_id,z.name,z.code`);
                that.db.from(`${dbname}.oc_zone z`);
                that.db.where(`z.status=1 AND z.country_id=${id}`);
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
                            provinces: results
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

module.exports = CountriesModel;