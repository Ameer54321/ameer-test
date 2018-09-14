'use strict';

// Salesreps routes
var Joi = require('joi');
var config = require('../config');
var SalesRepsController = require('../controllers/salesreps');

exports.register = function(server, options, next) {
    // Setup the controller
    var salesrepsController = new SalesRepsController(options.database);

    // Binds all methods
    // similar to doing `salesrepsController.index.bind(salesrepsController);`
    // when declaring handlers
    server.bind(salesrepsController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/{company_id}/salesreps',
            config: {
                handler: salesrepsController.index,
                validate: {
                    params: Joi.object().length(1).keys({
                        company_id: Joi.number().integer().min(1).required()
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
            path: '/api/v1/{company_id}/salesreps/{id}',
            config: {
                handler: salesrepsController.show,
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
            path: '/api/v1/{company_id}/salesreps/search/{prop}/{value}',
            config: {
                handler: salesrepsController.search,
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
            path: '/api/v1/{company_id}/salesreps/{id}/appointments',
            config: {
                handler: salesrepsController.appointments,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required()
                    },
                    query: Joi.object().keys({
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1)
                    })
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/salesreps/{id}/appointments/{type}',
            config: {
                handler: salesrepsController.appointmentsByType,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required(),
                        type: Joi.string().required()
                    },
                    query: Joi.object().keys({
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1)
                    })
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/salesreps/{id}/customers',
            config: {
                handler: salesrepsController.customers,
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
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/salesreps/{id}/customers/{customer_id}/appointments',
            config: {
                handler: salesrepsController.customerAppointments,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required(),
                        customer_id: Joi.number().integer().min(1).required()
                    },
                    query: Joi.object().keys({
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1)
                    })
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/salesreps/{id}/customers/{customer_id}/visits',
            config: {
                handler: salesrepsController.customerVisits,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required(),
                        customer_id: Joi.number().integer().min(1).required()
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
            path: '/api/v1/{company_id}/salesreps/{id}/customers/{customer_id}/visits/{type}',
            config: {
                handler: salesrepsController.customerVisitsByType,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required(),
                        customer_id: Joi.number().integer().min(1).required(),
                        type: Joi.string().required()
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
            path: '/api/v1/{company_id}/salesreps/{id}/customers/{customer_id}/orders',
            config: {
                handler: salesrepsController.customerOrders,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required(),
                        customer_id: Joi.number().integer().min(1).required()
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
            path: '/api/v1/{company_id}/salesreps/{id}/customers/{customer_id}/orders/{prop}/{value}',
            config: {
                handler: salesrepsController.customerOrdersByProperty,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required(),
                        customer_id: Joi.number().integer().min(1).required(),
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
            path: '/api/v1/{company_id}/salesreps/{id}/orders',
            config: {
                handler: salesrepsController.orders,
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
        },
        {
            method: 'GET',
            path: '/api/v1/{company_id}/salesreps/{id}/orders/{prop}/{value}',
            config: {
                handler: salesrepsController.ordersByProperty,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required(),
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
            path: '/api/v1/{company_id}/salesreps/{id}/quotes',
            config: {
                handler: salesrepsController.quotes,
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
            path: '/api/v1/{company_id}/salesreps/{id}/customers/{customer_id}/quotes',
            config: {
                handler: salesrepsController.customerQuotes,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required(),
                        customer_id: Joi.number().integer().min(1).required()
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
            path: '/api/v1/{company_id}/salesreps/{id}/customers/{customer_id}/quotes/{prop}/{value}',
            config: {
                handler: salesrepsController.customerQuotesByProperty,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required(),
                        customer_id: Joi.number().integer().min(1).required(),
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
            path: '/api/v1/{company_id}/salesreps/{id}/quotes/{prop}/{value}',
            config: {
                handler: salesrepsController.quotesByProperty,
                validate: {
                    params: {
                        company_id: Joi.number().integer().min(1).required(),
                        id: Joi.number().integer().min(1).required(),
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
            path: '/api/v1/{company_id}/salesreps/{id}/checkin',
            config: {
                handler: salesrepsController.checkin,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
                        id: Joi.number().integer().min(1).required()
                    },
                    payload: {
                        customer_id: Joi.number().integer().required(),
                        location: Joi.string().required(),
                        start: Joi.string().required(),
                        end: Joi.string().required(),
                        checkin: Joi.string().required(),
                        checkin_location: Joi.string().required(),
                        appointment_id: Joi.number().integer().required()
                    }
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/{company_id}/salesreps/{id}/checkout',
            config: {
                handler: salesrepsController.checkout,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
                        id: Joi.number().integer().min(1).required()
                    },
                    payload: {
                        checkin_id: Joi.number().integer().required(),
                        checkout: Joi.string().required(),
                        remarks: Joi.string()
                    }
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/{company_id}/salesreps/{id}/changepassword',
            config: {
                handler: salesrepsController.changepassword,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
                        id: Joi.number().integer().min(1).required()
                    },
                    payload: {
                        password: Joi.string().required().min(12),
                        email: Joi.string().email().required()
                    }
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/{company_id}/salesreps',
            config: {
                handler: salesrepsController.store,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required()
                    },
                    payload: {
                        username: Joi.string().email().required(),
                        email: Joi.string().email().required(),
                        id: Joi.number().integer().required()
                    }
                }
            }
        },
        {
            method: 'PUT',
            path: '/api/v1/{company_id}/salesreps/{id}',
            config: {
                handler: salesrepsController.update,
                validate: {
                    params: {
                        company_id: Joi.number().integer().required(),
                        id: Joi.number().integer().required()
                    },
                    payload: {
                        firstname: Joi.string().required(),
                        lastname: Joi.string().required(),
                        cell: Joi.string().required(),
                        tel: Joi.string().required(),
                        email: Joi.string().email().required(),
                        team_id: Joi.number().integer().required()
                    }
                }
            }
        },
        {
            method: 'DELETE',
            path: '/api/v1/{company_id}/salesreps/{id}',
            config: {
                handler: salesrepsController.destroy,
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
    name: 'routes-salesreps',
    version: config.version
};
