'use strict';

const config     = require('../config');
const crypto     = require('crypto');
const MySQL      = require('mysql');
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
function StatsModel(database) {
    this.db          = database;
    this.company_id  = 0;
    this.salesrep_id = 0;
    this.start       = 0;
    this.limit       = 0;
};

/**
 * Set company id
 * @param  {number}     company_id
 */
StatsModel.prototype.setCompanyId = function(company_id) {
    this.company_id = company_id;
}

/**
 * Set salesrep id
 * @param  {number}     salesrep_id
 */
StatsModel.prototype.setSalesRepId = function(salesrep_id) {
    this.salesrep_id = salesrep_id;
}

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
StatsModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Get appointment statistics
 * @param  {function}   reply
 * @return {object}
 */
StatsModel.prototype.getAppointmentStats = function(reply) {
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
                var where  = (that.salesrep_id > 0) ? `ap.salesrep_id=${that.salesrep_id}` : ``;
                that.db.select(`COUNT(ap.appointment_id) AS scheduled, COALESCE(COUNT(sc.checkin_id != 0), 0) AS checked_in, DATE_FORMAT(ap.appointment_date,"%Y-%m") AS month`);
                that.db.from(`${dbname}.oc_appointment ap`);
                that.db.join(`${dbname}.oc_salesrep_checkins sc ON sc.appointment_id=ap.appointment_id`, `LEFT`);
                that.db.where(where);
                that.db.group('DATE_FORMAT(appointment_date,"%Y-%m")');
                that.db.order('ap.appointment_date', 'DESC');
                that.db.limit(that.start, that.limit);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        var response  = {
                            status: 200,
                            error: false,
                            stats: results
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

module.exports = StatsModel;