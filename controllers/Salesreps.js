'use strict';

const Boom = require('boom');
const Bcrypt = require('bcrypt-nodejs');
const generatePassword = require('password-generator');
const SalesrepsModel = require('../models/salesreps');

function SalesrepsController(database) {
    this.salesrepsModel = new SalesrepsModel(database);
};

// [GET] /{company_id}/salesreps
SalesrepsController.prototype.index = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesreps(reply);
};

// [GET] /{company_id}/salesreps/{id}
SalesrepsController.prototype.show = function(request, reply) {
    try {
        var id = request.params.id;
        this.salesrepsModel.setCompanyId(request.params.company_id);
        this.salesrepsModel.getSalesrep(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/salesreps/search/{prop}/{value}
SalesrepsController.prototype.search = function(request, reply) {
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
            orderby = ""
        }
        if (sorting == null) {
            sorting = ""
        }
        
        var prop = request.params.prop;
        var value = request.params.value;
        this.salesrepsModel.setResultLimits(start, limit);
        this.salesrepsModel.setSortingOrder(orderby, sorting);
        this.salesrepsModel.setCompanyId(request.params.company_id);
        this.salesrepsModel.findSalesrepByProperty(prop, value, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/salesreps/{id}/appointments
SalesrepsController.prototype.appointments = function(request, reply) {

    var start = request.query.start;
    var limit = request.query.limit;

    if (start == null) {
        start = 0
    }
    if (limit == null) {
        limit = 0
    }

    var id = request.params.id;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepAppointments(id, reply);
};

// [GET] /{company_id}/salesreps/{id}/appointments/{type}
SalesrepsController.prototype.appointmentsByType = function(request, reply) {

    var start = request.query.start;
    var limit = request.query.limit;

    if (start == null) {
        start = 0
    }
    if (limit == null) {
        limit = 0
    }

    var id = request.params.id;
    var type = request.params.type;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepAppointmentsByType(id, type, reply);
};

// [GET] /{company_id}/salesreps/{id}/customers
SalesrepsController.prototype.customers = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    var id = request.params.id;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepCustomers(id, reply);
};

// [GET] /{company_id}/salesreps/{id}/customers/{customer_id}/appointments
SalesrepsController.prototype.customerAppointments = function(request, reply) {

    var start = request.query.start;
    var limit = request.query.limit;

    if (start == null) {
        start = 0
    }
    if (limit == null) {
        limit = 0
    }

    var id = request.params.id;
    var customer_id = request.params.customer_id;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepCustomerAppointments(id, customer_id, reply);
};

// [GET] /{company_id}/salesreps/{id}/customers/{customer_id}/visits
SalesrepsController.prototype.customerVisits = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    var id = request.params.id;
    var customer_id = request.params.customer_id;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepCustomerVisits(id, customer_id, reply);
};

// [GET] /{company_id}/salesreps/{id}/customers/{customer_id}/visits/{type}
SalesrepsController.prototype.customerVisitsByType = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    var id = request.params.id;
    var customer_id = request.params.customer_id;
    var type = request.params.type;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepCustomerVisitsByType(id, customer_id, type, reply);
};

// [GET] /{company_id}/salesreps/{id}/customers/{customer_id}/orders
SalesrepsController.prototype.customerOrders = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    var id = request.params.id;
    var customer_id = request.params.customer_id;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepCustomerOrders(id, customer_id, reply);
};

// [GET] /{company_id}/salesreps/{id}/customers/{customer_id}/orders/{prop}/{value}
SalesrepsController.prototype.customerOrdersByProperty = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    var id = request.params.id;
    var customer_id = request.params.customer_id;
    var prop = request.params.prop;
    var value = request.params.value;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepCustomerOrdersByProperty(id, customer_id, prop, value, reply);
};

// [GET] /{company_id}/salesreps/{id}/orders
SalesrepsController.prototype.orders = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    var id = request.params.id;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepOrders(id, reply);
};

// [GET] /{company_id}/salesreps/{id}/orders/{prop}/{value}
SalesrepsController.prototype.ordersByProperty = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    var id = request.params.id;
    var prop = request.params.prop;
    var value = request.params.value;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepOrdersByProperty(id, prop, value, reply);
};

// [GET] /{company_id}/salesreps/{id}/quotes
SalesrepsController.prototype.quotes = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    var id = request.params.id;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepQuotes(id, reply);
};

// [GET] /{company_id}/salesreps/{id}/customers/{customer_id}/quotes
SalesrepsController.prototype.customerQuotes = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    var id = request.params.id;
    var customer_id = request.params.customer_id;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepCustomerQuotes(id, customer_id, reply);
};

// [GET] /{company_id}/salesreps/{id}/customers/{customer_id}/quotes/{prop}/{value}
SalesrepsController.prototype.customerQuotesByProperty = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    var id = request.params.id;
    var customer_id = request.params.customer_id;
    var prop = request.params.prop;
    var value = request.params.value;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepCustomerQuotesByProperty(id, customer_id, prop, value, reply);
};

// [GET] /{company_id}/salesreps/{id}/quotes/{prop}/{value}
SalesrepsController.prototype.quotesByProperty = function(request, reply) {

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
        orderby = ""
    }
    if (sorting == null) {
        sorting = ""
    }

    var id = request.params.id;
    var prop = request.params.prop;
    var value = request.params.value;
    this.salesrepsModel.setResultLimits(start, limit);
    this.salesrepsModel.setSortingOrder(orderby, sorting);
    this.salesrepsModel.setCompanyId(request.params.company_id);
    this.salesrepsModel.getSalesrepQuotesByProperty(id, prop, value, reply);
};

// [POST] /{company_id}/salesreps/{id}/checkin
SalesrepsController.prototype.checkin = function(request, reply) {
    try {
        var data = {};
        var id = request.params.id;
        data.customer_id = request.payload.customer_id;
        data.location = request.payload.location;
        data.start = request.payload.start;
        data.end = request.payload.end;
        data.checkin = request.payload.checkin;
        data.checkin_location = request.payload.checkin_location;
        data.appointment_id = request.payload.appointment_id;
        this.salesrepsModel.setCompanyId(request.params.company_id);
        this.salesrepsModel.checkIn(id, data, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /{company_id}/salesreps/{id}/checkout
SalesrepsController.prototype.checkout = function(request, reply) {
    try {
        var data = {};
        var id = request.params.id;
        data.checkin_id = request.payload.checkin_id;
        data.checkout = request.payload.checkout;
        data.remarks = request.payload.remarks;
        this.salesrepsModel.setCompanyId(request.params.company_id);
        this.salesrepsModel.checkOut(id, data, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /{company_id}/salesreps/{id}/changepassword
SalesrepsController.prototype.changepassword = function(request, reply) {
    try {
        var data = {};
        var id = request.params.id;
        data.email = request.payload.email;
        data.salt = Bcrypt.genSaltSync();
        data.password = Bcrypt.hashSync(request.payload.password, data.salt);
        this.salesrepsModel.setCompanyId(request.params.company_id);
        this.salesrepsModel.changePassword(id, data, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /{company_id}/salesreps
SalesrepsController.prototype.store = function(request, reply) {
    try {
        var data = {};
        var id = request.payload.id;
        data.email = request.payload.email;
        data.username = request.payload.username;
        data.salt = Bcrypt.genSaltSync();
        data.password_plain = generatePassword(6, false);
        data.password = Bcrypt.hashSync(data.password_plain, data.salt);
        this.salesrepsModel.setCompanyId(request.params.company_id);
        this.salesrepsModel.addSalesrep(id, data, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [PUT] /{company_id}/salesreps/{id}
SalesrepsController.prototype.update = function(request, reply) {
    try {
        var data = {};
        var id = request.params.id;
        data.firstname = request.payload.firstname;
        data.lastname = request.payload.lastname;
        data.cell = request.payload.cell;
        data.tel = request.payload.tel;
        data.email = request.payload.email;
        data.team_id = request.payload.team_id;
        this.salesrepsModel.setCompanyId(request.params.company_id);
        this.salesrepsModel.updateSalesrep(id, data, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [DELETE] /{company_id}/salesreps/{id}
SalesrepsController.prototype.destroy = function(request, reply) {
    try {
        var data = {};
        var id = request.params.id;
        this.salesrepsModel.setCompanyId(request.params.company_id);
        this.salesrepsModel.deleteSalesrep(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = SalesrepsController;