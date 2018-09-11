'use strict';

const Boom = require('boom');
const AppointmentsModel = require('../models/Appointments');

function AppointmentsController(database) {
    this.appointmentsModel = new AppointmentsModel(database);
};

// [GET] /{company_id}/appointments
AppointmentsController.prototype.index = function(request, reply) {

    var start = request.query.start;
    var limit = request.query.limit;
    var orderby = request.query.orderby;
    var sorting = request.query.sorting;

    if (start == null) {
        start = 0
    }
    if (limit == null) {
        limit = 0
    }
    if (orderby == null) {
        orderby = "";
    }
    if (sorting == null) {
        sorting = "";
    }

    this.appointmentsModel.setCompanyId(request.params.company_id);
    this.appointmentsModel.setResultLimits(start, limit);
    this.appointmentsModel.setSortingOrder(orderby, sorting);
    this.appointmentsModel.getAppointments(reply);
};

// [GET] /{company_id}/appointments/{id}
AppointmentsController.prototype.show = function(request, reply) {
    try {
        var id = request.params.id;
        this.appointmentsModel.setCompanyId(request.params.company_id);
        this.appointmentsModel.getAppointment(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [GET] /{company_id}/appointments/search/{prop}/{value}
AppointmentsController.prototype.search = function(request, reply) {
    try {
        var start = request.query.start;
        var limit = request.query.limit;
        var orderby = request.query.orderby;
        var sorting = request.query.sorting;

        if (start == null) {
            start = 0
        }
        if (limit == null) {
            limit = 0
        }
        if (orderby == null) {
            orderby = "";
        }
        if (sorting == null) {
            sorting = "";
        }

        var prop = request.params.prop;
        var value = request.params.value;
        this.appointmentsModel.setCompanyId(request.params.company_id);
        this.appointmentsModel.setResultLimits(start, limit);
        this.appointmentsModel.setSortingOrder(orderby, sorting);
        this.appointmentsModel.findAppointmentByProperty(prop, value, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /{company_id}/appointments/{id}/notes
AppointmentsController.prototype.createNote = function(request, reply) {
    try {
        var note = {};
        var id = request.params.id;
        var rep_id = request.payload.rep_id;
        note.title = request.payload.title;
        note.content = request.payload.content;
        this.appointmentsModel.setCompanyId(request.params.company_id);
        this.appointmentsModel.createAppointmentNote(id, rep_id, note, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [PUT] /{company_id}/appointments/notes
AppointmentsController.prototype.updateNote = function(request, reply) {
    try {
        var note = {};
        note.id = request.payload.note_id;
        note.title = request.payload.title;
        note.content = request.payload.content;
        this.appointmentsModel.setCompanyId(request.params.company_id);
        this.appointmentsModel.updateAppointmentNote(note, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [POST] /{company_id}/appointments
AppointmentsController.prototype.store = function(request, reply) {
    try {
        var values = {};
        values.title = request.payload.title;
        values.rep_id = request.payload.rep_id;
        values.customer_id = request.payload.customer_id;
        values.customer_name = request.payload.customer_name;
        values.address = request.payload.address;
        values.date = request.payload.appointment_date;
        values.duration_hours = request.payload.duration_hours;
        values.duration_minutes = request.payload.duration_minutes;
        values.description = request.payload.description;
        values.type = request.payload.type;
        this.appointmentsModel.setCompanyId(request.params.company_id);
        this.appointmentsModel.addAppointment(values, reply);
    } catch (e) {
        reply(Boom.badRequest(e.message));
    }
};

// [PUT] /{company_id}/appointments/{id}
AppointmentsController.prototype.update = function(request, reply) {
    try {
        var appointment = {};
        var id = request.params.id;
        appointment.description = request.payload.description;
        this.appointmentsModel.setCompanyId(request.params.company_id);
        this.appointmentsModel.updateAppointment(id, appointment, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

// [DELETE] /{company_id}/appointments/{id}
AppointmentsController.prototype.destroy = function(request, reply) {
    try {
        var id = request.params.id;
        this.appointmentsModel.setCompanyId(request.params.company_id);
        this.appointmentsModel.deleteAppointment(id, reply);
    } catch (e) {
        reply(Boom.notFound(e.message));
    }
};

module.exports = AppointmentsController;
