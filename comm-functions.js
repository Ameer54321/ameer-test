const emailClient = require('./email_client');
const emailSettings = {
    api_key: 'njqRVZ3J9J3psHDoFjnTLQ'
};

module.exports = function() {

    /**
     * Send order confirmation email to customer
     * @param customer
     * @param data
     * @param quote_number
     * @param reply
     */
    function orderConfirmationToCustomer(customer, data, quote_number, reply) {

        // Go through items in cart for display items in a table
        var body = '';
        if (data.cart_items.length > 0) {
            body += '<table cellpadding="5" cellspacing="3" border="0" align="left" style="text-align:left">';
            body += '<thead><tr><th>#</th><th>Description</th><th>Unit Price</th><th>Qty</th><th>Total Price</th></tr></thead></tbody>';
            for (var i = 0; i < data.cart_items.length; i++) {
                if (typeof data.cart_items[i] === "object") {
                    body += '<tr><td>' + data.cart_items[i].id + '</td>';
                    body += '<td>' + data.cart_items[i].sku + ' - ' + data.cart_items[i].name + '</td>';
                    body += '<td>R ' + data.cart_items[i].unit_price + '</td>';
                    body += '<td>' + data.cart_items[i].qty + '</td>';
                    body += '<td>R ' + data.cart_items[i].total_price + '</td></tr>';
                }
            }
            body += '</tbody>';
            body += '<tfoot><tr><th colspan="4" align="right">TOTAL</th><th>R '+data.cart_total_price+'</th></tr></tfoot>';
            body += '</table>';
        }

        var emailData1 = {
            "html": '<h1>Order Quote Confirmation!</h1><p>Order Quote has been successfully received. Order quote number is '+quote_number+'.</p><h3>Order Information:</h3>'+body,
            "text": "Order Quote Confirmation! Order Quote has been successfully received. Order quote number is "+quote_number+".",
            "subject": "Order Confirmation!",
            "sender": "info@dashlogic.co.za",
            "recipient": customer.customer_email
        };

        // send email to customer
        emailClient.send(emailSettings.api_key, emailData1);

        var emailData2 = {
            "html": '<h1>Order Quote Confirmation!</h1><p>Order Quote has been successfully received. Your quote reference number is '+quote_number+'.</p><h3>Order Information:</h3>'+body,
            "text": "Order Quote Confirmation! Order Quote has been successfully received. Order quote number is "+quote_number+".",
            "subject": "Order Confirmation!",
            "sender": "info@dashlogic.co.za",
            "recipient": customer.cust_contact_email
        };

        // send email to customer contact
        emailClient.send(emailSettings.api_key, emailData2, function (res) {
            // email successfully sent
            var response = {
                "status": 200,
                "message": "Order quote successfully created",
                "quote_id": quote_number,
                "email_results": {
                    "status": res[0].status,
                    "id": res[0]._id,
                    "recipient": customer.cust_contact_email,
                    "error": res[0].reject_reason
                }
            };
            reply(response);
        }, function (error) {
            // email failed to send
            var response = {
                "status": 200,
                "quote_id": quote_number,
                "message": "Order quote successfully created, but email comms failed",
                "email_results": {
                    "status": "error",
                    "id": null,
                    "recipient": null,
                    "error": error.name + ': ' + error.message
                }
            };
            reply(response);
        });
    };


    /**
     * Send order confirmation email to company admin
     * @param admin_email
     * @param data
     * @param quote_number
     */
    function orderConfirmationToAdmin(admin_email, data, quote_number) {

        // Go through items in cart for display
        var body = '';
        if (data.cart_items.length > 0) {
            body += '<table cellpadding="5" cellspacing="3" border="0" align="left" style="text-align:left">';
            body += '<thead><tr><th>#</th><th>Description</th><th>Unit Price</th><th>Qty</th><th>Total Price</th></tr></thead></tbody>';
            for (var i = 0; i < data.cart_items.length; i++) {
                if (typeof data.cart_items[i] === "object") {
                    body += '<tr><td>' + data.cart_items[i].id + '</td>';
                    body += '<td>' + data.cart_items[i].sku + ' - ' + data.cart_items[i].name + '</td>';
                    body += '<td>R ' + data.cart_items[i].unit_price + '</td>';
                    body += '<td>' + data.cart_items[i].qty + '</td>';
                    body += '<td>R ' + data.cart_items[i].total_price + '</td></tr>';
                }
            }
            body += '</tbody>';
            body += '<tfoot><tr><th colspan="4" align="right">TOTAL</th><th>R '+data.cart_total_price+'</th></tr></tfoot>';
            body += '</table>';
        }

        var emailData = {
            "html": '<h1>Order Quote Confirmation!</h1><p>Order Quote has been placed and awaiting approval with quote number: '+quote_number+'.</p><h3>Order Information:</h3>'+body,
            "text": "Order Quote Confirmation! Order Quote has been received! An order quote has been placed and awaiting approval with quote number: "+quote_number+".",
            "subject": "Order Confirmation!",
            "sender": "info@dashlogic.co.za",
            "recipient": admin_email
        };

        // send email to customer
        emailClient.send(emailSettings.api_key, emailData);
    };


    /**
     * Reset Password
     * Send new auto-generated password
     * @param email
     * @param password
     * @param reply
     */
    function resetPassword(email, password, reply) {

        var data = {
            "html": "<p>Dear User</p><p>You have requested that we reset your password. Your new password: <strong>" + password + "</strong>.</p><p>If you did not send this request urgently contact support.</p>",
            "text": "Dear Dashlogic User. You have requested that we reset your password. Your new password: " + password + ". If you did not send this request urgently contact Dashlogic support.",
            "subject": "Password Reset Confirmation",
            "sender": "info@dashlogic.co.za",
            "recipient": email
        };

        // send email to user
        emailClient.send(emailSettings.api_key, data, function(res) {
            // email successfully sent
            var response = {
                "status": 200,
                "message": "Password reset and email sent successfully",
                "email_results": {
                    "status": res[0].status,
                    "id": res[0]._id,
                    "recipient": email,
                    "error": res[0].reject_reason
                }
            };
            reply(response);
        }, function(error) {
            // email failed to send
            var response = {
                "status": 203,
                "message": "Password could not be sent to user",
                "email_results": {
                    "status": "error",
                    "id": null,
                    "recipient": null,
                    "error": error.name + ': ' + error.message
                }
            };
            reply(response);
        });
    };

    return {
        orderConfirmationToCustomer: orderConfirmationToCustomer,
        orderConfirmationToAdmin: orderConfirmationToAdmin,
        resetPassword: resetPassword
    };

}();