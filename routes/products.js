'use strict';

// Appointments routes
var Joi = require('joi');
var config = require('../config');
var ProductsController = require('../controllers/products');

exports.register = function(server, options, next) {
    // Setup the controller
    var productsController = new ProductsController(options.database);

    // Binds all methods
    // similar to doing `productsController.index.bind(productsController);`
    // when declaring handlers
    server.bind(productsController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/{company_id}/products',
            config: {
                handler: productsController.index,
                validate: {
                    params: Joi.object().length(1).keys({
                        company_id: Joi.number().integer().required()
                    }),
                    query: Joi.object().keys({
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1),
                        orderby: Joi.string(),
                        sorting: Joi.string(),
                        group: Joi.number().integer().min(1),
                        image_size: Joi.string(),
                        products: Joi.string()
                    })
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/products/{id}',
            config: {
                handler: productsController.show,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
                        id: Joi.number().integer().min(1).required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/products/search/{prop}/{value}',
            config: {
                handler: productsController.search,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
                        prop: Joi.string().required(),
                        value: Joi.string().required()
                    },
                    query: Joi.object().keys({
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1),
                        orderby: Joi.string(),
                        sorting: Joi.string(),
                        group: Joi.number().integer().min(1),
                        image_size: Joi.string()
                    })
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/products/categories',
            config: {
                handler: productsController.categories,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required()
                    },
                    query: Joi.object().keys({
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1),
                        orderby: Joi.string(),
                        sorting: Joi.string()
                    })
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/products/categories/{category_id}',
            config: {
                handler: productsController.productsByCategory,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
                        category_id: Joi.number().integer().min(1).required()
                    },
                    query: Joi.object().keys({
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1),
                        orderby: Joi.string(),
                        sorting: Joi.string(),
                        group: Joi.number().integer().min(1),
                        image_size: Joi.string()
                    })
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-products',
    version: config.version
};
