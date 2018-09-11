'use strict';

const Boom = require('boom');
const CountriesModel = require('../models/Countries');

function CountriesController(database) {
    this.countriesModel = new CountriesModel(database);
};

// [GET] /{company_id}/countries
CountriesController.prototype.index = function(request, reply) {

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

    this.countriesModel.setCompanyId(request.params.company_id);
    this.countriesModel.setResultLimits(start, limit);
    this.countriesModel.setSortingOrder(orderby, sorting);
    this.countriesModel.getCountries(reply);
};

// [GET] /{company_id}/countries/{id}
CountriesController.prototype.show = function(request, reply) {
    try {
        var id = request.params.id;
        this.countriesModel.setCompanyId(request.params.company_id);
        this.countriesModel.getCountry(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/countries/search/{prop}/{value}
CountriesController.prototype.search = function(request, reply) {
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
        this.countriesModel.setCompanyId(request.params.company_id);
        this.countriesModel.setResultLimits(start, limit);
        this.countriesModel.setSortingOrder(orderby, sorting);
        this.countriesModel.findCountryByProperty(prop, value, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/countries/{id}/provinces
CountriesController.prototype.provinces = function(request, reply) {
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
        this.countriesModel.setCompanyId(request.params.company_id);
        this.countriesModel.setResultLimits(start, limit);
        this.countriesModel.setSortingOrder(orderby, sorting);
        this.countriesModel.getProvinces(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = CountriesController;