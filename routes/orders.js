'use strict';

// Orders routes
var Joi = require('joi');
var config = require('../config');
var OrdersController = require('../controllers/orders');

exports.register = function(server, options, next) {
    // Setup the controller
    var ordersController = new OrdersController(options.database);

    // Binds all methods
    // similar to doing `ordersController.index.bind(ordersController);`
    // when declaring handlers
    server.bind(ordersController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/{company_id}/orders',
            config: {
                handler: ordersController.index,
                validate: {
                    query: Joi.object().keys({
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1),
                        orderby: Joi.string(),
                        sorting: Joi.string()
                    }),
                    params: Joi.object().length(1).keys({
                        company_id: Joi.number().integer().min(1).required()
                    })
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/orders/{id}',
            config: {
                handler: ordersController.show,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/orders/search/{prop}/{value}',
            config: {
                handler: ordersController.search,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        prop: Joi.string().required(),
                        value: Joi.string().required()
                    },
                    query: Joi.object().keys({
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1),
                        orderby: Joi.string(),
                        sorting: Joi.string()
                    })
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-orders',
    version: config.version
};