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

        var emailData1 = {
            "html": "<h1>Order Confirmation!</h1><p>Order has been successfully received. Order quote number is "+quote_number+".</p>",
            "text": "Order Confirmation! Order has been successfully received. Order quote number is "+quote_number+".",
            "subject": "Order Confirmation!",
            "sender": "info@dashlogic.co.za",
            "recipient": customer.customer_email
        };

        // send email to customer
        emailClient.send(emailSettings.api_key, emailData1);

        var emailData2 = {
            "html": "<h1>Order Confirmation!</h1><p>Order has been successfully received. Your quote reference number is "+quote_number+".</p>",
            "text": "Order Confirmation! Order has been successfully received. Order quote number is "+quote_number+".",
            "subject": "Order Confirmation!",
            "sender": "info@dashlogic.co.za",
            "recipient": customer.cust_contact_email
        };

        // send email to customer contact
        emailClient.send(emailSettings.api_key, emailData2);
    };


    /**
     * Send order confirmation email to company admin
     * @param admin_email
     * @param data
     */
    function orderConfirmationToAdmin(admin, data, quote_number) {

        /**
         * @TODO build html for the order details
         */

        var data = {
            "html": "<h1>Order Confirmation!</h1><p>An order quote has been placed and awaiting approval with quote number: "+quote_number+".</p>",
            "text": "Order quote has been received! An order quote has been placed and awaiting approval with quote number: "+quote_number+".",
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