'use strict';

// Appointments routes
var Joi = require('joi');
var config = require('../config');
var AppointmentsController = require('../controllers/Appointments');

exports.register = function(server, options, next) {
    // Setup the controller
    var appointmentsController = new AppointmentsController(options.database);

    // Binds all methods
    // similar to doing `appointmentsController.index.bind(appointmentsController);`
    // when declaring handlers
    server.bind(appointmentsController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/{company_id}/appointments',
            config: {
                handler: appointmentsController.index,
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
            path: '/api/v1/{company_id}/appointments/{id}',
            config: {
                handler: appointmentsController.show,
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
            path: '/api/v1/{company_id}/appointments/search/{prop}/{value}',
            config: {
                handler: appointmentsController.search,
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
            path: '/api/v1/{company_id}/appointments/{id}/notes',
            config: {
                handler: appointmentsController.createNote,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
                        id: Joi.number().integer().required()
                    },
                    payload: {
                        title: Joi.string().required(),
                        content: Joi.string().required(),
                        rep_id: Joi.number().integer().required()
                    }
                }
            }
        },
        {
            method: 'PUT',
            path: '/api/v1/{company_id}/appointments/notes',
            config: {
                handler: appointmentsController.updateNote,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required()
                    },
                    payload: {
                        note_id: Joi.number().integer().required(),
                        title: Joi.string(),
                        content: Joi.string()
                    }
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/{company_id}/appointments',
            config: {
                handler: appointmentsController.store,
                validate: {
                    params: Joi.object().length(1).keys({
                        company_id: Joi.number().integer().required()
                    }),
                    payload: Joi.object().keys({
                        title: Joi.string().required(),
                        rep_id: Joi.number().integer().required(),
                        customer_id: Joi.number().integer().allow('').allow(null).optional(),
                        customer_name: Joi.string().required(),
                        address: Joi.string().required(),
                        appointment_date: Joi.string().required(),
                        duration_hours: Joi.number().integer().required(),
                        duration_minutes: Joi.number().integer().required(),
                        description: Joi.string().allow('').optional(),
                        type: Joi.string().required()
                    })
                }
            }
        },
        {
            method: 'PUT',
            path: '/api/v1/{company_id}/appointments/{id}',
            config: {
                handler: appointmentsController.update,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
                        id: Joi.number().integer().required()
                    },
                    payload: Joi.object().length(1).keys({
                        description: Joi.string().allow('').optional()
                    })
                }
            }
        },
        {
            method: 'DELETE',
            path: '/api/v1/{company_id}/appointments/{id}',
            config: {
                handler: appointmentsController.destroy,
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
    name: 'routes-appointments',
    version: config.version
};
