'use strict';

const Boom = require('boom');
const StatsModel = require('../models/Stats');

function StatsController(database) {
    this.statsModel = new StatsModel(database);
};

// [GET] /{company_id}/stats/{type}
StatsController.prototype.index = function(request, reply) {

    var start      = request.query.start;
    var limit      = request.query.limit;
    var salesrepId = request.query.salesrep_id;

    if (start == null) {
        start = 0
    }
    if (limit == null) {
        limit = 12
    }
    if (salesrepId == null) {
        salesrepId = "";
    }

    this.statsModel.setCompanyId(request.params.company_id);
    this.statsModel.setSalesRepId(salesrepId);
    this.statsModel.setResultLimits(start, limit);

    switch (request.params.type.toLowerCase()) {
        case 'appointments':
            this.statsModel.getAppointmentStats(reply);
            break;

        default: 
            var response = {
                code: 404,
                error: true,
                message: 'Not found'
            };
            reply(response);
            break;
    }
};

module.exports = StatsController;