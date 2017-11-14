var mandrill = require('mandrill-api/mandrill');
/**
 * This module sends an email from specified sender to specified recipient
 *
 * @author Rodney
 *
 * @param api_key <string> Mandrill API Key [required]
 * @param data <object> [required]
 *              html <string> the full HTML content to be sent
 *              text <string> [optional] full text content to be sent
 *              subject <string> the message subject
 *              sender <string> the sender email address.
 *              recipient <string> the email address of the recipient
 * @param success_callback <function>
 * @param error_callback <function>
 */
exports.send = function(api_key, data, success_callback, error_callback) {
    var mandrillClient = new mandrill.Mandrill(api_key);
    var message = {
        "html": data.html,
        "text": data.text,
        "subject": data.subject,
        "from_email": data.sender,
        "to": [{
            "email": data.recipient,
            "type": "to"
        }]
    };
    var async = false;
    mandrillClient.messages.send({"message": message, "async": async}, function(result) {
        if (success_callback) {
            success_callback(result);
        } else {
            console.log(result);
        }
    }, function(e) {
        if (error_callback) {
            error_callback(e);
        } else {
            console.log(e);
        }
    });
};