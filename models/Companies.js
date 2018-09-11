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
function CompaniesModel(database) {
    this.db = database;
    this.start = 0;
    this.limit = 0;
    this.orderby = "";
    this.sorting = "";
};

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
CompaniesModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
CompaniesModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get companies
 * @param  {function}
 * @return {object}
 */
CompaniesModel.prototype.getCompanies = function(reply) {
    this.db.select(`company_id,companydb,companyname`);
    this.db.from(`super.companies`);
    this.db.order(this.orderby, this.sorting);
    this.db.limit(this.start, this.limit);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                companies: results
            };
            reply(response);
        }
    });
};

/**
 * Find company by property
 * @param  {multitype}
 * @param  {multitype}
 * @param  {function}
 * @return {object}
 */
CompaniesModel.prototype.findCompanyByProperty = function(prop, value, reply) {
    this.db.select(`companydb,companyname`);
    this.db.from(`super.companies`);
    this.db.where(`${prop}='${value}'`);
    this.db.order(this.orderby, this.sorting);
    this.db.limit(this.start, this.limit);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                companies: results
            };
            reply(response);
        }
    });
};

/**
 * Get single company
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CompaniesModel.prototype.getCompany = function(id, reply) {
    this.findCompanyByProperty('company_id', id, reply);
};

/**
 * Create company
 * @param {object}  newCompany
 * @return {object}
 */
CompaniesModel.prototype.addCompany = function(newCompany, reply) {
    var columns = `companyname,companydb`;
    var values = `'${newCompany.name}','${newCompany.db}'`;
    connection.query(this.db.insert(`super.companies`, columns, values),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                message: 'success',
                company: {
                    company_id: results.insertId
                }
            };
            reply(response);
        }
    });
};

/**
 * Update company details
 * @param  {number}     id
 * @param  {object}     updatedCompany
 * @param  {function}   reply
 * @return {object}
 */
CompaniesModel.prototype.updateAppointment = function(id, updatedCompany, reply) {
    var set = `companyname='${updatedCompany.name}',companydb='${updatedCompany.db}'`;
    var condition = `company_id=${id}`;
    connection.query(this.db.update(`super.companies`, set, condition),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                message: 'success',
                company: {
                    company_id: results.insertId
                }
            };
            reply(response);
        }
    });
};

/**
 * Delete company
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
CompaniesModel.prototype.deleteCompany = function(id, reply) {
    connection.query(this.db.delete(`super.companies`, `company_id=${id}`),
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
};

module.exports = CompaniesModel;
