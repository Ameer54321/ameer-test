const emailClient = require('./email_client');
const generatePdf = require('./generate-pdf');
const fs = require('fs');
module.exports = function() {

    /**
     * Send order confirmation email to customer
     * @param customer
     * @param data
     * @param quote_number
     * @param reply
     */
    function sendQuoteEmails(customer, manager, company, rep, quote, reply) {
        generatePdf.generateQuotePdf(customer, manager, company, rep, quote, function (error, result) {
            if (error) {
                reply(error);
            } else {
                sendQuoteEmailToCustomer(customer, manager, company, rep, quote, reply, result.filename);
            }
        });
    };

    function sendQuoteEmailToCustomer(customer, manager, company, rep, quote, reply, attachment) {
        var bitmap = fs.readFileSync(attachment, 'utf8');
        var params = {
            template_name: 'customer-quote-template',
            template_content: [],
            message: {
                subject: 'Quote Confirmation',
                to: [{
                    email: customer.email,
                    type: 'to'
                }],
                attachments: [{
                    type: "application/pdf",
                    name: attachment,
                    content: new Buffer(bitmap).toString('base64')
                }],
                global_merge_vars: [{
                    name: 'CUST_NAME',
                    content: customer.name
                }, {
                    name: 'QUOTE_NUM',
                    content: quote.number
                }, {
                    name: 'QUOTE_DATE',
                    content: quote.date
                }, {
                    name: 'QUOTE_TOTAL',
                    content: quote.total
                }, {
                    name: 'QUOTE_URL',
                    content: quote.url
                }, {
                    name: 'MANAGER_EMAIL',
                    content: manager.email
                }, {
                    name: 'REP_NAME',
                    content: rep.name
                }, {
                    name: 'CUST_CONTACT_NAME',
                    content: customer.contact.name
                }, {
                    name: 'CUST_ADDR_LINE1',
                    content: customer.address.line1
                }, {
                    name: 'CUST_ADDR_LINE2',
                    content: customer.address.line2
                }, {
                    name: 'CUST_ADDR_CITY',
                    content: customer.address.city
                }, {
                    name: 'CUST_ADDR_COUNTRY',
                    content: customer.address.country
                }, {
                    name: 'CUST_ADDR_POSTCODE',
                    content: customer.address.postcode
                }, {
                    name: 'COMPANY_NAME',
                    content: company.name
                }]
            },
            async: false
        };

        // send email to customer
        emailClient.sendTemplate(params, function (res) {
            sendQuoteEmailToRep(customer, manager, company, rep, quote, reply, attachment);
        }, function (error) {
            sendQuoteEmailToRep(customer, manager, company, rep, quote, reply, attachment);
        });
    };


    /**
     * Send order confirmation email to sales rep
     * @param rep
     * @param data
     * @param quote_number
     */
    function sendQuoteEmailToRep(customer, manager, company, rep, quote, reply, attachment) {
        var bitmap = fs.readFileSync(attachment, 'utf8');
        var params = {
            template_name: 'rep-quote-template',
            template_content: [],
            message: {
                subject: 'Quote Generated Successfully',
                to: [{
                    email: rep.email,
                    type: 'to'
                }],
                attachments: [{
                    type: "application/pdf",
                    name: attachment,
                    content: new Buffer(bitmap).toString('base64')
                }],
                global_merge_vars: [{
                    name: 'CUST_NAME',
                    content: customer.name
                }, {
                    name: 'QUOTE_NUM',
                    content: quote.number
                }, {
                    name: 'QUOTE_DATE',
                    content: quote.date
                }, {
                    name: 'QUOTE_TOTAL',
                    content: quote.total
                }, {
                    name: 'QUOTE_URL',
                    content: quote.url
                }, {
                    name: 'MANAGER_EMAIL',
                    content: manager.email
                }, {
                    name: 'REP_NAME',
                    content: rep.name
                }, {
                    name: 'CUST_CONTACT_NAME',
                    content: customer.contact.name
                }, {
                    name: 'CUST_ADDR_LINE1',
                    content: customer.address.line1
                }, {
                    name: 'CUST_ADDR_LINE2',
                    content: customer.address.line2
                }, {
                    name: 'CUST_ADDR_CITY',
                    content: customer.address.city
                }, {
                    name: 'CUST_ADDR_COUNTRY',
                    content: customer.address.country
                }, {
                    name: 'CUST_ADDR_POSTCODE',
                    content: customer.address.postcode
                }, {
                    name: 'COMPANY_NAME',
                    content: company.name
                }]
            },
            async: false
        };

        // send email to sales rep
        emailClient.sendTemplate(params, function (res) {
            sendQuoteEmailToSalesManager(customer, manager, company, rep, quote, reply, attachment);
        }, function(error) {
            sendQuoteEmailToSalesManager(customer, manager, company, rep, quote, reply, attachment);
        });
    };


    /**
     * Send order confirmation email to sales manager
     * @param manager
     * @param data
     * @param quote_number
     */
    function sendQuoteEmailToSalesManager(customer, manager, company, rep, quote, reply, attachment) {
        var bitmap = fs.readFileSync(attachment, 'utf8');
        var params = {
            template_name: 'manager-quote-template',
            template_content: [],
            message: {
                subject: 'New Quote Received',
                to: [{
                    email: manager.email,
                    type: 'to'
                }],
                attachments: [{
                    type: "application/pdf",
                    name: attachment,
                    content: new Buffer(bitmap).toString('base64')
                }],
                global_merge_vars: [{
                    name: 'CUST_NAME',
                    content: customer.name
                }, {
                    name: 'QUOTE_NUM',
                    content: quote.number
                }, {
                    name: 'QUOTE_DATE',
                    content: quote.date
                }, {
                    name: 'QUOTE_TOTAL',
                    content: quote.total
                }, {
                    name: 'QUOTE_URL',
                    content: quote.url
                }, {
                    name: 'MANAGER_EMAIL',
                    content: manager.email
                }, {
                    name: 'REP_NAME',
                    content: rep.name
                }, {
                    name: 'CUST_CONTACT_NAME',
                    content: customer.contact.name
                }, {
                    name: 'CUST_ADDR_LINE1',
                    content: customer.address.line1
                }, {
                    name: 'CUST_ADDR_LINE2',
                    content: customer.address.line2
                }, {
                    name: 'CUST_ADDR_CITY',
                    content: customer.address.city
                }, {
                    name: 'CUST_ADDR_COUNTRY',
                    content: customer.address.country
                }, {
                    name: 'CUST_ADDR_POSTCODE',
                    content: customer.address.postcode
                }, {
                    name: 'COMPANY_NAME',
                    content: company.name
                }]
            },
            async: false
        };

        // send email to sales manager
        emailClient.sendTemplate(params, function (res) {
            var response = {
                status: 200,
                quote_id: quote.number,
                message: 'Confirmation email sent successfully!',
                email_results: res
            };
            reply(response);
        }, function(error) {
            var response = {
                status: 200,
                quote_id: quote.number,
                message: 'Confirmation email could not be sent!',
                email_results: error
            };
            reply(response);
        });
    };


    /**
     * Send Reset Password Email
     * Send new auto-generated password
     * @param email
     * @param password
     * @param reply
     */
    function sendWelcomeEmail(email, password, support_desk, manager, reply) {
        var params = {
            template_name: 'welcome-template',
            template_content: [],
            message: {
                subject: 'Welcome to Replogic',
                to: [{
                    email: email,
                    type: 'to'
                }],
                global_merge_vars: [{
                    name: 'PASSWORD',
                    content: password
                }, {
                    name: 'SUPPORT_EMAIL',
                    content: support_desk.contact
                }, {
                    name: 'MANAGER_EMAIL',
                    content: manager.email
                }]
            },
            async: false
        };

        // send reset password email to user
        emailClient.sendTemplate(params, function (res) {
            var response = {
                status: 200,
                message: 'Email sent successfully!',
                email_results: res
            };
            reply(response);
        }, function(error) {
            var response = {
                status: 400,
                message: 'Welcome email could not be sent!',
                email_results: error
            };
            reply(response);
        });
    };


    /**
     * Send Reset Password Email
     * Send new auto-generated password
     * @param email
     * @param password
     * @param reply
     */
    function sendResetPassword(email, password, support_desk, manager, reply) {
        var params = {
            template_name: 'reset-password',
            template_content: [],
            message: {
                subject: 'Password Reset Confirmation',
                to: [{
                    email: email,
                    type: 'to'
                }],
                global_merge_vars: [{
                    name: 'PASSWORD',
                    content: password
                }, {
                    name: 'SUPPORT_EMAIL',
                    content: support_desk.contact
                }, {
                    name: 'MANAGER_EMAIL',
                    content: manager.email
                }]
            },
            async: false
        };

        // send reset password email to user
        emailClient.sendTemplate(params, function (res) {
            var response = {
                status: 200,
                message: 'Password reset and email sent successfully!',
                email_results: res
            };
            reply(response);
        }, function(error) {
            var response = {
                status: 400,
                message: 'Password could not be sent to user!',
                email_results: error
            };
            reply(response);
        });
    };

    return {
        sendWelcomeEmail: sendWelcomeEmail,
        sendResetPassword: sendResetPassword,
        sendQuoteEmails: sendQuoteEmails
    };

}();