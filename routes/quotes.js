'use strict';

// Appointments routes
var Joi = require('joi');
var config = require('../config');
var QuotesController = require('../controllers/quotes');

exports.register = function(server, options, next) {
    // Setup the controller
    var quotesController = new QuotesController(options.database);

    // Binds all methods
    // similar to doing `quotesController.index.bind(quotesController);`
    // when declaring handlers
    server.bind(quotesController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/{company_id}/quotes',
            config: {
                handler: quotesController.index,
                validate: {
                    params: Joi.object().length(1).keys({
                        company_id: Joi.number().integer().required()
                    }),
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
            path: '/api/v1/{company_id}/quotes/{id}',
            config: {
                handler: quotesController.show,
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
            path: '/api/v1/{company_id}/quotes/search/{prop}/{value}',
            config: {
                handler: quotesController.search,
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
                        sorting: Joi.string()
                    })
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/{company_id}/quotes',
            config: {
                handler: quotesController.store,
                validate: {
                    params: Joi.object().length(1).keys({
                        company_id: Joi.number().integer().required()
                    }),
                    payload: Joi.object().keys({
                        rep_id: Joi.number().integer().required(),
                        customer_id: Joi.number().integer().required(),
                        contact_id: Joi.number().integer().required(),
                        cart: Joi.object().required()
                    })
                }
            }
        },
        {
            method: 'DELETE',
            path: '/api/v1/{company_id}/quotes/{id}',
            config: {
                handler: quotesController.destroy,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
                        id: Joi.number().integer().required()
                    }
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-quotes',
    version: config.version
};
