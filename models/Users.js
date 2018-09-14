'use strict';

const config = require('../config');
const crypto = require('crypto');
const MySQL = require('mysql');
const Bcrypt = require('bcrypt-nodejs');
const generatePassword = require('password-generator');
const comms = require('../functions/communications');
const createToken = require('../util/token');
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
function UsersModel(database) {
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
UsersModel.prototype.setResultLimits = function(start, limit) {
    this.start = start;
    this.limit = limit;
}

/**
 * Set result order-by. Define order-by [field] and sorting
 * @param  {number}     orderby
 * @param  {number}     sorting
 */
UsersModel.prototype.setSortingOrder = function(orderby, sorting) {
    this.orderby = orderby;
    this.sorting = sorting;
}

/**
 * Get users
 * @param  {object}     request
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.getUsers = function(reply) {
    var that = this;
    this.db.select(`uid,username,email,companyId,realId`);
    this.db.from(`super.user`);
    this.db.order(that.orderby, that.sorting);
    this.db.limit(that.start, that.limit);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                users: results
            };
            reply(response);
        }
    });
};

/**
 * Find users by property
 * @param  {multitype}  prop
 * @param  {multitype}  value
 * @param  {object}     request
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.findUserByProperty = function(prop, value, reply) {
    var that = this;
    this.db.select(`uid,username,email,companyId,realId`);
    this.db.from(`super.user`);
    this.db.where(`${prop}='${value}'`);
    this.db.order(that.orderby, that.sorting);
    this.db.limit(that.start, that.limit);
    connection.query(this.db.get(),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                users: results
            };
            reply(response);
        }
    });
};

/**
 * Get single user
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.getUser = function(id, reply) {
    this.findUserByProperty('uid', id, reply);
};

/**
 * Create new user
 * @param  {object}     newUser
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.addUser = function(newUser, reply) {
    var columns = `username,password,email,salt,companyId,realId`;
    var values = `'${newUser.username}','${newUser.password}','${newUser.email}','${newUser.salt}','${newUser.company_id}','${newUser.real_id}'`;
    connection.query(this.db.insert(`super.user`, columns, values),
    function (error, results, fields) {
        if (error) {
            throw error;
        } else {
            var response = {
                status: 200,
                error: false,
                message: "success",
                data: {
                    uid: results.insertId
                }
            };
            reply(response);
        }
    });
};

/**
 * Update user details
 * @param  {number}     id
 * @param  {object}     updatedUser
 * @param  {function}   replys
 * @return {object}
 */
UsersModel.prototype.updateUser = function(id, updatedUser, reply) {
    var set = `email='${updatedUser.email}'`;
    var condition = `uid=${id}`;
    connection.query(this.db.update(`super.user`, set, condition),
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

/**
 * Reset user's password
 * @param  {number}     id
 * @param  {string}     email
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.resetPassword = function(email, reply) {
    // validate email against database | check if user exists or not
    var that = this;
    this.db.select(`u.uid,u.salt,u.password,u.companyId,u.realId,c.companyname,c.companydb`);
    this.db.from(`super.user u`);
    this.db.join(`super.companies c ON c.company_id=u.companyId`);
    this.db.where(`u.email='${email}'`);
    connection.query(this.db.get(),
    function(error, results, fields) {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                // auto-generate new password
                const newPassword = generatePassword(6, false);
                const dbname = results[0].companydb;
                const repId = results[0].realId;
                // encryption
                var salt = Bcrypt.genSaltSync();
                var encryptedPassword = Bcrypt.hashSync(newPassword, salt);
                var set = `password='${newPassword}', salt='${salt}'`;
                var condition = `uid=${results[0].uid}`;
                connection.query(that.db.update(`super.user`, set, condition),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        if (results) {
                            var set = `prompt_change_password=1`;
                            var condition = `salesrep_id=${repId}`;
                            connection.query(that.db.update(`${dbname}.oc_salesrep`, set, condition),
                                function (error, results, fields) {
                                    if (error) {
                                        throw error;
                                    } else {
                                        that.db.select(`rm.email AS manager_email`);
                                        that.db.from(`${dbname}.oc_salesrep sr`);
                                        that.db.join(`${dbname}.oc_team rt ON rt.team_id=sr.sales_team_id`);
                                        that.db.join(`${dbname}.oc_user rm ON rm.user_id=rt.sales_manager`);
                                        that.db.where(`sr.salesrep_id=${repId}`);
                                        connection.query(that.db.get(),
                                            function (error, results, fields) {
                                                if (error) {
                                                    throw error;
                                                } else {
                                                    if (results.length > 0) {
                                                        var supportDesk = {contact: config.support.email};
                                                        var manager = {email: results[0].manager_email};
                                                        comms.sendResetPassword(email, newPassword, supportDesk, manager, reply);
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
            } else {
                var response = {
                    status: 400,
                    error: true,
                    message: "User does not exist"
                };
                reply(response);
            }
        }
    });
};

/**
 * User login 
 * @param  {number}     id
 * @param  {string}     email
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.login = function(username, password, reply, request) {
    // validate email against database | check if user exists or not
    var that = this;
    this.db.select(`u.uid,u.salt,u.password,u.companyId,u.realId,c.companyname,c.companydb`);
    this.db.from(`super.user u`);
    this.db.join(`super.companies c ON c.company_id=u.companyId`);
    this.db.where(`u.email='${username}'`);
    connection.query(this.db.get(),
    function(error, results, fields) {
        if (error) {
            throw error;
        } else {
            var orgPassword = Bcrypt.compareSync(password, results[0].password);
            if (orgPassword === true){
                const dbname = results[0].companydb;
                const companyName = results[0].companyname;
                const companyId = results[0].companyId;
                const repId = results[0].realId;
                const userId = results[0].uid;
                /**
                 * @include tax (or VAT) details on login */
                that.db.select(`st.key,st.value,tr.name,tr.rate,sr.salesrep_name,sr.prompt_change_password`);
                that.db.from(`${dbname}.oc_setting st, ${dbname}.oc_tax_rate tr, ${dbname}.oc_salesrep sr`);
                that.db.where(`st.key='tax_status' AND sr.salesrep_id=${repId}`);
                connection.query(that.db.get(),
                function (error, results, fields) {
                    if (error) {
                        throw error;
                    } else {
                        if (results.length > 0) {
                            var response = {
                                status: 200,
                                error: false,
                                message: "success",
                                data: {
                                    company_id: companyId,
                                    company_name: companyName,
                                    user_id: userId,
                                    rep_id: repId,
                                    rep_name: results[0].salesrep_name,
                                    tax_status: results[0].value,
                                    tax_name: results[0].name,
                                    tax_rate: results[0].rate.toFixed(2),
                                    prompt_change_password: results[0].prompt_change_password
                                },
                                auth: {
                                    uid: userId,
                                    token: createToken({username:username, uid:userId, admin:false})
                                }
                            };
                            reply(response);
                        } else {
                            var response = {
                                status: 400,
                                error: false,
                                message: "Access denied"
                            }
                            reply(response);
                        }
                    }
                });
            } else {
                var response = {
                    status: 400,
                    error: false,
                    message: "Incorrect username and/or password"
                }
                reply(response);
            }
        }
    });
};

/**
 * Delete user
 * @param  {number}     id
 * @param  {function}   reply
 * @return {object}
 */
UsersModel.prototype.deleteUser = function(id, reply) {
    connection.query(this.db.delete(`super.user`, `uid=${id}`),
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

module.exports = UsersModel;
