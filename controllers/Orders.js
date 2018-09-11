'use strict';

const Boom = require('boom');
const OrdersModel = require('../models/Orders');

function OrdersController(database) {
    this.ordersModel = new OrdersModel(database);
};

// [GET] /{company_id}/orders
OrdersController.prototype.index = function(request, reply) {

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

    this.ordersModel.setCompanyId(request.params.company_id);
    this.ordersModel.setResultLimits(start, limit);
    this.ordersModel.setSortingOrder(orderby, sorting);
    this.ordersModel.getOrders(reply);
};

// [GET] /{company_id}/orders/{id}
OrdersController.prototype.show = function(request, reply) {
    try {
        var id = request.params.id;
        this.ordersModel.setCompanyId(request.params.company_id);
        this.ordersModel.getOrder(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/orders/search/{prop}/{value}
OrdersController.prototype.search = function(request, reply) {
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
        this.ordersModel.setCompanyId(request.params.company_id);
        this.ordersModel.setResultLimits(start, limit);
        this.ordersModel.setSortingOrder(orderby, sorting);
        this.ordersModel.findOrderByProperty(prop, value, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = OrdersController;