'use strict';

// Stats routes
var Joi             = require('joi');
var config          = require('../config');
var StatsController = require('../controllers/stats');

exports.register = function(server, options, next) {
    // Setup the controller
    var statsController = new StatsController(options.database);

    // Binds all methods
    // similar to doing `statsController.index.bind(statsController);`
    // when declaring handlers
    server.bind(statsController);

    // Declare routes
    server.route([
        {
            method: 'GET',
            path: '/api/v1/{company_id}/stats/{type}',
            config: {
                handler: statsController.index,
                validate: {
                    query: Joi.object().keys({
                        salesrep_id: Joi.number().min(1),
                        start: Joi.number().min(0),
                        limit: Joi.number().min(1)
                    }),
                    params: Joi.object().keys({
                        company_id: Joi.number().integer().min(1).required(),
                        type: Joi.string().required()
                    })
                }
            }
        }
    ]);

    next();
}

exports.register.attributes = {
    name: 'routes-stats',
    version: config.version
};