'use strict';
var comms = require('./comm-functions');
var customer = {
	name: "Cloudlogic (PTY) Ltd",
	email: "rodney@cloudlogic.co.za",
	contact: {
		name: "John Doe"
	},
	address: {
		line1: '2, Ncondo Place',
		line2: 'Ridgeside',
		city: 'Umhlanga',
		country: 'South Africa',
		postcode: '4320'
	}
};
var rep = {name: 'Rodney Ncane'};
var company = {name: 'Replogic (PTY) Ltd'};
var quote = {number: 1000212, total: 15999.99, url: 'http://www.replogic.co.za/1000212', date: 'January 11, 2018'};
var manager = {email: 'salesmanager@domain.com'};
comms.orderConfirmationToCustomer(customer, manager, company, rep, quote, {});