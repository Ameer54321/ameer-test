'use strict';

const Boom = require('boom');
const CompaniesModel = require('../models/Companies');

function CompaniesController(database) {
    this.companiesModel = new CompaniesModel(database);
};

// [GET] /companies
CompaniesController.prototype.index = function(request, reply) {

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

    this.companiesModel.setResultLimits(start, limit);
    this.companiesModel.setSortingOrder(orderby, sorting);
    this.companiesModel.getCompanies(reply);
};

// [GET] /companies/{id}
CompaniesController.prototype.show = function(request, reply) {
    try {
        var id = request.params.id;
        this.companiesModel.getCompany(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /companies/search/{prop}/{value}
CompaniesController.prototype.search = function(request, reply) {
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
        this.companiesModel.setResultLimits(start, limit);
        this.companiesModel.setSortingOrder(orderby, sorting);
        this.companiesModel.findCompanyByProperty(prop, value, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /companies
CompaniesController.prototype.store = function(request, reply) {
    try {
        var values = {};
        values.db = request.payload.company_db;
        values.name = request.payload.company_name;
        this.companiesModel.addCompany(values, reply);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

// [PUT] /companies/{id}
CompaniesController.prototype.update = function(request, reply) {
    try {
        var company = {};
        var id = request.params.id;
        company.db = request.payload.company_db;
        company.name = request.payload.company_name;
        this.companiesModel.updateCompany(id, company, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [DELETE] /companies/{id}
CompaniesController.prototype.destroy = function(request, reply) {
    try {
        var id = request.params.id;
        this.companiesModel.deleteCompany(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = CompaniesController;