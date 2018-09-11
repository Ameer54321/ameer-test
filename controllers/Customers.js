'use strict';

const Boom = require('boom');
const Bcrypt = require('bcrypt-nodejs');
const CustomersModel = require('../models/Customers');

function CustomersController(database) {
    this.customersModel = new CustomersModel(database);
};

// [GET] /{company_id}/customers
CustomersController.prototype.index = function(request, reply) {

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

    this.customersModel.setResultLimits(start, limit);
    this.customersModel.setSortingOrder(orderby, sorting);
    this.customersModel.setCompanyId(request.params.company_id);
    this.customersModel.getCustomers(reply);
};

// [GET] /{company_id}/customers/{id}
CustomersController.prototype.show = function(request, reply) {
    try {
        var id = request.params.id;
        this.customersModel.setCompanyId(request.params.company_id);
        this.customersModel.getCustomer(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/customers/{id}/contacts
CustomersController.prototype.contacts = function(request, reply) {
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

        var id = request.params.id;
        this.customersModel.setResultLimits(start, limit);
        this.customersModel.setSortingOrder(orderby, sorting);
        this.customersModel.setCompanyId(request.params.company_id);
        this.customersModel.getCustomerContacts(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/customers/{id}/visits
CustomersController.prototype.visits = function(request, reply) {
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
        
        var id = request.params.id;
        this.customersModel.setResultLimits(start, limit);
        this.customersModel.setSortingOrder(orderby, sorting);
        this.customersModel.setCompanyId(request.params.company_id);
        this.customersModel.getCustomerVisits(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/customers/{id}/orders
CustomersController.prototype.orders = function(request, reply) {
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
        
        var id = request.params.id;
        this.customersModel.setResultLimits(start, limit);
        this.customersModel.setSortingOrder(orderby, sorting);
        this.customersModel.setCompanyId(request.params.company_id);
        this.customersModel.getCustomerOrders(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/customers/{id}/quotes
CustomersController.prototype.quotes = function(request, reply) {
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
        
        var id = request.params.id;
        this.customersModel.setResultLimits(start, limit);
        this.customersModel.setSortingOrder(orderby, sorting);
        this.customersModel.setCompanyId(request.params.company_id);
        this.customersModel.getCustomerQuotes(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/customers/{id}/appointments
CustomersController.prototype.appointments = function(request, reply) {
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
        
        var id = request.params.id;
        this.customersModel.setResultLimits(start, limit);
        this.customersModel.setSortingOrder(orderby, sorting);
        this.customersModel.setCompanyId(request.params.company_id);
        this.customersModel.getCustomerAppointments(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/customers/search/{prop}/{value}
CustomersController.prototype.search = function(request, reply) {
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
        this.customersModel.setResultLimits(start, limit);
        this.customersModel.setSortingOrder(orderby, sorting);
        this.customersModel.setCompanyId(request.params.company_id);
        this.customersModel.findCustomerByProperty(prop, value, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /{company_id}/customers/{id}/contacts
CustomersController.prototype.addContact = function(request, reply) {
    try {
        var id = request.params.id;
        var contact = {};
        contact.first_name = request.payload.firstname;
        contact.last_name = request.payload.surname;
        contact.email = request.payload.email;
        contact.telephone = request.payload.telephone;
        contact.cell = request.payload.mobile_number;
        contact.role = request.payload.role;
        this.customersModel.setCompanyId(request.params.company_id);
        this.customersModel.addCustomerContact(id, contact, reply);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

// [POST] /{company_id}/customers
CustomersController.prototype.store = function(request, reply) {
    try {
        var values = {};
        values.rep_id = request.payload.rep_id;
        values.company_name = request.payload.company_name;
        values.email = request.payload.email;
        values.telephone = request.payload.telephone;
        values.fax = (request.payload.fax) ? request.payload.fax : "";
        values.address_1 = request.payload.address_1;
        values.address_2 = (request.payload.address_2) ? request.payload.address_2 : "";
        values.city = request.payload.city;
        values.postcode = request.payload.postcode;
        values.region_id = request.payload.region_id;
        values.country_id = request.payload.country_id;
        values.address = values.address_1+" "+values.address_2+" "+values.city+" "+values.postcode;
        // hard-coded fields/values
        var password = 'Replogic'; // general initial password
        values.customer_group_id = 1;
        values.store_id = 0;
        values.language_id = 1;
        values.address_id = 0; // will be updated on after the address insert later on (below)
        values.firstname = values.company_name; // since customer is a company rather the actual person
        values.lastname = values.company_name; // since customer is a company rather the actual person
        values.newsletter = 0;
        values.ip = 0;
        values.custom_field = "";
        values.status = 1;
        values.approved = 0;
        values.safe = 0;
        values.token = "";
        values.code = "";

        // password encryption
        values.salt = Bcrypt.genSaltSync();
        values.password = Bcrypt.hashSync(password, values.salt);
        this.customersModel.setCompanyId(request.params.company_id);
        this.customersModel.addCustomer(values, reply);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

// [PUT] /{company_id}/customers/{id}
CustomersController.prototype.update = function(request, reply) {
    try {
        var customer = {};
        var id = request.params.id;
        customer.email = request.payload.email;
        customer.telephone = request.payload.telephone;
        customer.fax = (request.payload.fax) ? request.payload.fax : "";
        customer.address_id = request.payload.address_id;
        customer.address_1 = request.payload.address_1;
        customer.address_2 = (request.payload.address_2) ? request.payload.address_2 : "";
        customer.city = request.payload.city;
        customer.postcode = request.payload.postcode;
        customer.region_id = request.payload.region_id;
        customer.country_id = request.payload.country_id;
        this.customersModel.setCompanyId(request.params.company_id);
        this.customersModel.updateCustomer(id, customer, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [DELETE] /{company_id}/customers/{id}
CustomersController.prototype.destroy = function(request, reply) {
    try {
        var id = request.params.id;
        this.customersModel.setCompanyId(request.params.company_id);
        this.customersModel.deleteCustomer(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = CustomersController;
