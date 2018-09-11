'use strict';

// Appointments routes
var Joi = require('joi');
var config = require('../config');
var CompaniesController = require('../controllers/Companies');

exports.register = function(server, options, next) {
    // Setup the controller
    var companiesController = new CompaniesController(options.database);

    // Binds all methods
    // similar to doing `companiesController.index.bind(companiesController);`
    // when declaring handlers
    server.bind(companiesController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/companies',
            config: {
                handler: companiesController.index,
                auth: false,
                validate: {
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
            path: '/api/v1/companies/{id}',
            config: {
                handler: companiesController.show,
                auth: false,
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
                    }
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/companies/search/{prop}/{value}',
            config: {
                handler: companiesController.search,
                auth: false,
                validate: {
                    params: {
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
            path: '/api/v1/companies',
            config: {
                handler: companiesController.store,
                auth: false,
                validate: {
                    payload: Joi.object().length(2).keys({
                        company_db: Joi.string().required(),
                        company_name: Joi.string().required()
                    })
                }
            }
        },
        {
            method: 'PUT',
            path: '/api/v1/companies/{id}',
            config: {
                handler: companiesController.update,
                auth: false,
                validate: {
                    params: {
                        id: Joi.number().integer().required()
                    },
                    payload: Joi.object().length(2).keys({
                        company_db: Joi.string().required(),
                        company_name: Joi.string().required()
                    })
                }
            }
        },
        {
            method: 'DELETE',
            path: '/api/v1/companies/{id}',
            config: {
                handler: companiesController.destroy,
                auth: false,
                validate: {
                    params: {
                        id: Joi.number().integer().required()
                    }
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-companies',
    version: config.version
};