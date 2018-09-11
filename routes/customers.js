'use strict';

// Appointments routes
var Joi = require('joi');
var config = require('../config');
var CustomersController = require('../controllers/Customers');

exports.register = function(server, options, next) {
    // Setup the controller
    var customersController = new CustomersController(options.database);

    // Binds all methods
    // similar to doing `customersController.index.bind(customersController);`
    // when declaring handlers
    server.bind(customersController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/{company_id}/customers',
            config: {
                handler: customersController.index,
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
            path: '/api/v1/{company_id}/customers/{id}',
            config: {
                handler: customersController.show,
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
            path: '/api/v1/{company_id}/customers/{id}/contacts',
            config: {
                handler: customersController.contacts,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
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
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/customers/{id}/visits',
            config: {
                handler: customersController.visits,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
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
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/customers/{id}/orders',
            config: {
                handler: customersController.orders,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
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
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/customers/{id}/quotes',
            config: {
                handler: customersController.quotes,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
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
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/customers/{id}/appointments',
            config: {
                handler: customersController.appointments,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
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
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/customers/search/{prop}/{value}',
            config: {
                handler: customersController.search,
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
            path: '/api/v1/{company_id}/customers/{id}/contacts',
            config: {
                handler: customersController.addContact,
                validate: {
                    params: Joi.object().length(2).keys({
                        company_id: Joi.number().integer().required(),
                        id: Joi.number().integer().required()
                    }),
                    payload: Joi.object().keys({
                        firstname: Joi.string().required(),
                        surname: Joi.string().required(),
                        mobile_number: Joi.string().min(0).allow('').allow(null),
                        telephone: Joi.string().min(0).allow('').allow(null),
                        email: Joi.string().email().required(),
                        role: Joi.string().min(0).allow('').allow(null)
                    })
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/{company_id}/customers',
            config: {
                handler: customersController.store,
                validate: {
                    params: Joi.object().length(1).keys({
                        company_id: Joi.number().integer().required()
                    }),
                    payload: Joi.object().keys({
                        rep_id: Joi.number().integer().required(),
                        company_name: Joi.string().required(),
                        email: Joi.string().email().required(),
                        telephone: Joi.string().required(),
                        fax: Joi.string().allow('').allow('').allow(null),
                        address_1: Joi.string().required(),
                        address_2: Joi.string().allow('').allow('').allow(null),
                        city: Joi.string().required(),
                        postcode: Joi.string().required(),
                        region_id: Joi.number().integer().required(),
                        country_id: Joi.number().integer().required()
                    })
                }
            }
        },
        {
            method: 'PUT',
            path: '/api/v1/{company_id}/customers/{id}',
            config: {
                handler: customersController.update,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
                        id: Joi.number().integer().required()
                    },
                    payload: Joi.object().length(1).keys({
                        customer_id: Joi.number().integer().required(),
                        email: Joi.string().email().required(),
                        telephone: Joi.string().required(),
                        fax: Joi.string().allow('').optional(),
                        address_id: Joi.number().integer().required(),
                        address_1: Joi.string().required(),
                        address_2: Joi.string().allow('').optional(),
                        city: Joi.string().required(),
                        postcode: Joi.string().required(),
                        region_id: Joi.number().integer().required(),
                        country_id: Joi.number().integer().required()
                    })
                }
            }
        },
        {
            method: 'DELETE',
            path: '/api/v1/{company_id}/customers/{id}',
            config: {
                handler: customersController.destroy,
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
    name: 'routes-customers',
    version: config.version
};
