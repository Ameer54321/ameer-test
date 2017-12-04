const emailClient = require('./email_client');
const emailSettings = {
    api_key: 'njqRVZ3J9J3psHDoFjnTLQ'
};

module.exports = function() {

    /**
     * Send order confirmation email to customer
     * @param customer_email
     * @param order
     */
    function orderConfirmationToCustomer(customer, data, quote_number) {

        /**
         * @TODO build html for the order details
         */

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
        emailClient.send(emailSettings.api_key, emailData2);
    };


    /**
     * Send order confirmation email to company admin
     * @param admin
     * @param data
     * @param quote_number
     */
    function orderConfirmationToAdmin(admin, data, quote_number) {

        /**
         * @TODO build html for the order details
         */

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

        var data = {
            "html": '<h1>Order Quote Confirmation!</h1><p>Order Quote has been placed and awaiting approval with quote number: '+quote_number+'.</p><h3>Order Information:</h3>'+body,
            "text": "Order Quote Confirmation! Order Quote has been received! An order quote has been placed and awaiting approval with quote number: "+quote_number+".",
            "subject": "Order Confirmation!",
            "sender": "info@dashlogic.co.za",
            "recipient": admin.email
        };

        // send email to customer
        emailClient.send(emailSettings.api_key, data);
    };

    return {
        orderConfirmationToCustomer: orderConfirmationToCustomer,
        orderConfirmationToAdmin: orderConfirmationToAdmin
    };

}();