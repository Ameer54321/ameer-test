'use strict';

const Boom = require('boom');
const Bcrypt = require('bcrypt-nodejs');
const UsersModel = require('../models/Users');

function UsersController(database) {
    this.usersModel = new UsersModel(database);
};

// [GET] /users
UsersController.prototype.index = function(request, reply) {
    var start = request.query.start;
    var limit = request.query.limit;
    var orderby = request.query.orderby;
    var sorting = request.query.sorting;

    if (start == null) {
        start = 0
    }
    if (limit == null) {
        limit = 0
    }
    if (orderby == null) {
        orderby = "";
    }
    if (sorting == null) {
        sorting = "";
    }

    this.usersModel.setResultLimits(start, limit);
    this.usersModel.setSortingOrder(orderby, sorting);
    this.usersModel.getUsers(reply);
};

// [GET] /users/{id}
UsersController.prototype.show = function(request, reply) {
    try {
        var id = request.params.id;
        this.usersModel.getUser(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /users/search/{prop}/{value}
UsersController.prototype.search = function(request, reply) {
    try {
        var start = request.query.start;
        var limit = request.query.limit;
        var orderby = request.query.orderby;
        var sorting = request.query.sorting;

        if (start == null) {
            start = 0
        }
        if (limit == null) {
            limit = 0
        }
        if (orderby == null) {
            orderby = "";
        }
        if (sorting == null) {
            sorting = "";
        }

        var prop = request.params.prop;
        var value = request.params.value;
        this.usersModel.setResultLimits(start, limit);
        this.usersModel.setSortingOrder(orderby, sorting);
        this.usersModel.findUserByProperty(prop, value, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /users
UsersController.prototype.store = function(request, reply) {
    try {
        var values = {};
        var password = request.payload.password;
        values.username = request.payload.username;
        values.email = request.payload.email;
        values.company_id = request.payload.company_id;
        values.real_id = request.payload.rep_id;
        values.salt = Bcrypt.genSaltSync();
        values.password = Bcrypt.hashSync(password, values.salt);
        this.usersModel.addUser(values, reply);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

// [PUT] /users/{id}
UsersController.prototype.update = function(request, reply) {
    try {
        var user = {};
        var id = request.params.id;
        user.email = request.payload.email;
        this.usersModel.updateUser(id, user, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /users/login
UsersController.prototype.login = function(request, reply) {
    try {
        var user = {};
        var username = request.payload.username;
        var password = request.payload.password;
        this.usersModel.login(username, password, reply, request);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /users/resetpassword
UsersController.prototype.resetpassword = function(request, reply) {
    try {
        var user = {};
        var email = request.payload.email;
        this.usersModel.resetPassword(email, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [DELETE] /users/{id}
UsersController.prototype.destroy = function(request, reply) {
    try {
        var id = request.params.id;
        this.usersModel.deleteUser(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = UsersController;
