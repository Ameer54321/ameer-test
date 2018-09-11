'use strict';

const Boom = require('boom');
const QuotesModel = require('../models/Quotes');

function QuotesController(database) {
    this.quotesModel = new QuotesModel(database);
};

// [GET] /{company_id}/quotes
QuotesController.prototype.index = function(request, reply) {

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

    this.quotesModel.setResultLimits(start, limit);
    this.quotesModel.setSortingOrder(orderby, sorting);
    this.quotesModel.setCompanyId(request.params.company_id);
    this.quotesModel.getQuotes(reply);
};

// [GET] /{company_id}/quotes/{id}
QuotesController.prototype.show = function(request, reply) {
    try {
        var id = request.params.id;
        this.quotesModel.setCompanyId(request.params.company_id);
        this.quotesModel.getQuote(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/quotes/search/{prop}/{value}
QuotesController.prototype.search = function(request, reply) {
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
        this.quotesModel.setResultLimits(start, limit);
        this.quotesModel.setSortingOrder(orderby, sorting);
        this.quotesModel.setCompanyId(request.params.company_id);
        this.quotesModel.findQuoteByProperty(prop, value, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /{company_id}/quotes
QuotesController.prototype.store = function(request, reply) {
    try {
        var values = {};
        values.rep_id = request.payload.rep_id;
        values.customer_id = request.payload.customer_id;
        values.contact_id = request.payload.contact_id;
        values.cart = request.payload.cart;
        this.quotesModel.setCompanyId(request.params.company_id);
        this.quotesModel.addQuote(values, reply, request);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

// [PUT] /{company_id}/quotes/{id}
QuotesController.prototype.update = function(request, reply) {
    try {
        var quote = {};
        var id = request.params.id;
        quote.rep_id = request.payload.rep_id;
        quote.customer_id = request.payload.customer_id;
        quote.contact_id = request.payload.contact_id;
        quote.cart = request.payload.cart;
        this.quotesModel.setCompanyId(request.params.company_id);
        this.quotesModel.updateQuote(id, quote, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [DELETE] /{company_id}/quotes/{id}
QuotesController.prototype.destroy = function(request, reply) {
    try {
        var id = request.params.id;
        this.quotesModel.setCompanyId(request.params.company_id);
        this.quotesModel.deleteQuote(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = QuotesController;
