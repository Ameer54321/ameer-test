'use strict';

// Countries routes
var Joi = require('joi');
var config = require('../config');
var CountriesController = require('../controllers/Countries');

exports.register = function(server, options, next) {
    // Setup the controller
    var countriesController = new CountriesController(options.database);

    // Binds all methods
    // similar to doing `countriesController.index.bind(countriesController);`
    // when declaring handlers
    server.bind(countriesController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/{company_id}/countries',
            config: {
                handler: countriesController.index,
                auth: false,
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
            path: '/api/v1/{company_id}/countries/{id}',
            config: {
                handler: countriesController.show,
                auth: false,
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
            path: '/api/v1/{company_id}/countries/search/{prop}/{value}',
            config: {
                handler: countriesController.search,
                auth: false,
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
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/countries/{id}/provinces',
            config: {
                handler: countriesController.provinces,
                auth: false,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required()
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
    name: 'routes-countries',
    version: config.version
};