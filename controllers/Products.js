'use strict';

const Boom = require('boom');
const ProductsModel = require('../models/products');

function ProductsController(database) {
    this.productsModel = new ProductsModel(database);
};

// [GET] /{company_id}/products
ProductsController.prototype.index = function(request, reply) {

    var start = request.query.start;
    var limit = request.query.limit;
    var orderby = request.query.orderby;
    var sorting = request.query.sorting;
    var group = request.query.group;
    var imageSize = request.query.image_size;
    var products = request.query.products;

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

    this.productsModel.setResultLimits(start, limit);
    this.productsModel.setSortingOrder(orderby, sorting);
    this.productsModel.setGroup(group);
    this.productsModel.setImageSize(imageSize);
    this.productsModel.setFilteredProducts(products);
    this.productsModel.setCompanyId(request.params.company_id);
    this.productsModel.getProducts(reply);
};

// [GET] /{company_id}/products/{id}
ProductsController.prototype.show = function(request, reply) {
    try {
        var id = request.params.id;
        this.productsModel.setCompanyId(request.params.company_id);
        this.productsModel.getProduct(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/products/search/{prop}/{value}
ProductsController.prototype.search = function(request, reply) {
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
        this.productsModel.setResultLimits(start, limit);
        this.productsModel.setSortingOrder(orderby, sorting);
        this.productsModel.setCompanyId(request.params.company_id);
        this.productsModel.findProductByProperty(prop, value, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/products/categories
ProductsController.prototype.categories = function(request, reply) {
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

        this.productsModel.setResultLimits(start, limit);
        this.productsModel.setSortingOrder(orderby, sorting);
        this.productsModel.setCompanyId(request.params.company_id);
        this.productsModel.getProductCategories(reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/products/categories/{category_id}
ProductsController.prototype.productsByCategory = function(request, reply) {
    try {
        var start = request.query.start;
        var limit = request.query.limit;
        var orderby = request.query.orderby;
        var sorting = request.query.sorting;
        var group = request.query.group;
        var imageSize = request.query.image_size;
        var products = request.query.products;

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

        this.productsModel.setResultLimits(start, limit);
        this.productsModel.setSortingOrder(orderby, sorting);
        this.productsModel.setGroup(group);
        this.productsModel.setImageSize(imageSize);
        this.productsModel.setFilteredProducts(products);
        this.productsModel.setCompanyId(request.params.company_id);
        this.productsModel.getProductsByCategory(request.params.category_id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = ProductsController;
