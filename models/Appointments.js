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
function AppointmentsModel(database) {
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
AppointmentsModel.prototype.setCompanyId = function(company_id) {
    this.company_id = company_id;
}

/**
 * Set result limit. Define starting index and limit
 * @param  {number}     start
 * @param  {number}     limit
 */
AppointmentsModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
AppointmentsModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get appointments
 * @param  {function}   reply
 * @return {object}
 */
AppointmentsModel.prototype.getAppointments = function(reply) {
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
 * Find appointment by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {function}   reply
 * @return {object}
 */
AppointmentsModel.prototype.findAppointmentByProperty = function(prop, value, reply) {
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
                var select = `ap.appointment_id,ap.appointment_name,ap.appointment_description,ap.appointment_date,ap.type,IF(type="Existing Business" AND ap.appointment_address IS NULL,CONCAT(ad.address_1," ",ad.address_2," ",ad.city," ",ad.postcode),ap.appointment_address) AS appointment_address,`;
                select += `IF(type="New Business",pc.prospect_id,cs.customer_id) AS customer_id,IF(type="New Business",pc.name,cs.firstname) AS customer_name,nt.note_id,nt.note_content,sc.checkin_id,sc.checkin,sc.checkout`;
                that.db.select(select);
                that.db.from(`${dbname}.oc_appointment ap`);
                that.db.join(`${dbname}.oc_salesrep_checkins sc ON sc.appointment_id=ap.appointment_id`, `LEFT`);
                that.db.join(`${dbname}.oc_customer cs ON cs.customer_id=ap.customer_id`, `LEFT`);
                that.db.join(`${dbname}.oc_address ad ON ad.address_id=cs.address_id`, `LEFT`);
                that.db.join(`${dbname}.oc_notes nt on nt.appointment_id=ap.appointment_id`, `LEFT`);
                that.db.join(`${dbname}.oc_prospective_customer pc ON pc.prospect_id=ap.customer_id`, `LEFT`);
                that.db.where(`${prop}='${value}'`);
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
 * Get single appointment
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
AppointmentsModel.prototype.getAppointment = function(id, reply) {
    this.findAppointmentByProperty('ap.appointment_id', id, reply);
};

/**
 * Create/add appointment note
 * @param  {number}     id
 * @param  {number}     rep_id [description]
 * @param  {object}     newNote
 * @param  {function}   reply
 * @return {object}
 */
AppointmentsModel.prototype.createAppointmentNote = function(id, rep_id, newNote, reply) {
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
                var columns = `note_title,note_content,appointment_id,salesrep_id`;
                var values = `'${newNote.title}','${newNote.content}',${id},${rep_id}`;
                connection.query(that.db.insert(`${dbname}.oc_notes`, columns, values),
                    function (error, results, fields) {
                        if (error) {
                            throw error;
                        } else {
                            var response = {
                                status: 200,
                                error: false,
                                message: "success",
                                notes: {
                                    note_id: results.insertId
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
 * Update appointment note
 * @param  {object}     updatedNote
 * @param  {function}   reply
 * @return {object}
 */
AppointmentsModel.prototype.updateAppointmentNote = function(updatedNote, reply) {
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
                var set = `note_title='${updatedNote.title}',note_content='${updatedNote.content}'`;
                var condition = `note_id=${updatedNote.id}`;
                connection.query(that.db.update(`${dbname}.oc_notes`, set, condition),
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

/**
 * Create appointment
 * @param  {object}     newAppointment
 * @param  {function}   reply
 * @return {object}
 */
AppointmentsModel.prototype.addAppointment = function(newAppointment, reply) {
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
                /**
                 * Check if no appointment already scheduled for specified time slot
                 */
                that.db.select(`appointment_id`);
                that.db.from(`${dbname}.oc_appointment`);
                that.db.where(`(appointment_date>='${newAppointment.date}' AND appointment_date<=DATE_ADD('${newAppointment.date}', INTERVAL CONCAT(duration_hours,":",duration_minutes) HOUR_MINUTE)) AND salesrep_id=${newAppointment.rep_id}`);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        if (results.length > 0) {
                            var response = {
                                status: 400,
                                error: true,
                                message: "Already have appointment scheduled for the same date and time slot."
                            };
                            reply(response);
                        } else {
                            switch (newAppointment.type.toLowerCase()) {
                                case "new business":
                                    // insert new prospective customer into database, and grab new prospect id
                                    var columns = `name,address,created`;
                                    var values = `'${newAppointment.customer_name}','${newAppointment.address}',NOW()`;
                                    connection.query(that.db.insert(`${dbname}.oc_prospective_customer`, columns, values),
                                    function (error, results, fields) {
                                        if (error) {
                                            throw error;
                                        } else {
                                            // insert new appointment into the database for a new prospective customer
                                            var prospectId = results.insertId;
                                            var columns = `appointment_name,appointment_description,appointment_date,duration_hours,duration_minutes,salesrep_id,customer_id,type,appointment_address`;
                                            var values = `'${newAppointment.title}','${newAppointment.description}','${newAppointment.date}','${newAppointment.duration_hours}','${newAppointment.duration_minutes}','${newAppointment.rep_id}','${prospectId}','${newAppointment.type}','${newAppointment.address}'`;
                                            connection.query(that.db.insert(`${dbname}.oc_appointment`, columns, values),
                                            function (error, results, fields) {
                                                if (error) {
                                                    throw error;
                                                } else {
                                                    var response = {
                                                        status: 200,
                                                        error: false,
                                                        message: 'success',
                                                        appointment: {
                                                            appointment_id: results.insertId
                                                        }
                                                    };
                                                    reply(response);
                                                }
                                            });
                                        }
                                    });
                                    break;

                                case "existing business":
                                    // insert new appointment into the database for an existing customer
                                    var columns = `appointment_name,appointment_description,appointment_date,duration_hours,duration_minutes,salesrep_id,customer_id,type,appointment_address`;
                                    var values = `'${newAppointment.title}','${newAppointment.description}','${newAppointment.date}','${newAppointment.duration_hours}','${newAppointment.duration_minutes}','${newAppointment.rep_id}','${newAppointment.customer_id}','${newAppointment.type}','${newAppointment.address}'`;
                                    connection.query(that.db.insert(`${dbname}.oc_appointment`, columns, values),
                                    function (error, results, fields) {
                                        if (error) {
                                            throw error;
                                        } else {
                                            var response = {
                                                status: 200,
                                                error: false,
                                                message: 'success',
                                                appointment: {
                                                    appointment_id: results.insertId
                                                }
                                            };
                                            reply(response);
                                        }
                                    });
                                    break;
                            }
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
 * Update appointment
 * @param  {number}     id
 * @param  {object}     updatedAppointment
 * @param  {function}   reply
 * @return {object}
 */
AppointmentsModel.prototype.updateAppointment = function(id, updatedAppointment, reply) {
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
                var set = `appointment_description='${updatedAppointment.description}'`;
                var condition = `appointment_id=${id}`;
                connection.query(this.db.update(`${dbname}.oc_appointment`, set, condition),
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

/**
 * Delete appointment
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
AppointmentsModel.prototype.deleteAppointment = function(id, reply) {
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
                connection.query(that.db.delete(`${dbname}.oc_appointment`, `appointment_id=${id}`),
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

module.exports = AppointmentsModel;
