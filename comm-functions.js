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
    function orderConfirmationToCustomer(customer, data) {

        /**
         * @TODO build html for the order details
         */

        var emailData1 = {
            "html": "<h1>Order Confirmation!</h1><p>Your order has been successfully received.</p>",
            "text": "Order Confirmation! Your order has been successfully received.",
            "subject": "Order Confirmation!",
            "sender": "info@dashlogic.co.za",
            "recipient": customer.customer_email
        };

        // send email to customer
        emailClient.send(emailSettings.api_key, emailData1);

        var emailData2 = {
            "html": "<h1>Order Confirmation!</h1><p>Your order has been successfully received. Your quote reference number is: ######.</p>",
            "text": "Order Confirmation! Your order has been successfully received. Your quote reference number is: ######.",
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
    function orderConfirmationToAdmin(admin, data) {

        /**
         * @TODO build html for the order details
         */

        var data = {
            "html": "<h1>Order Confirmation!</h1><p>An order quote has been placed and awaiting approval.</p>",
            "text": "Order quote has been received! An order quote has been placed and awaiting approval.",
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