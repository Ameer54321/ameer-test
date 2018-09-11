var mandrill = require('mandrill-api/mandrill');
var config = {"mandrill": {api_key: 'njqRVZ3J9J3psHDoFjnTLQ'}};
const mandrillClient = new mandrill.Mandrill(config.mandrill.api_key);


/**
 * Inject content and optionally merge fields into a template, returning the HTML that results through Mandrill
 *
 * @author Rodney
 *
 * @param data <JSON> [required]:
 *              template_name <STRING> the immutable name of a template that exists in the user's account
 *              template_content <ARRAY> an array of template content to render. 
 *              merge_vars <ARRAY> optional merge variables to use for injecting merge field content.
 *
 * @param scallback <FUNCTION>  success callback function
 * @param ecallback <FUNCTION>  error callback function
 */
exports.renderTemplate = function(data, scallback, ecallback) {
    mandrillClient.templates.render(data, function(result) {
        if (scallback) {
            scallback(result);
        } else {
            console.log(result);
        }
    }, function(e) {
        if (ecallback) {
            ecallback(e);
        } else {
            console.log(e);
        }
    });
};

/**
 * This module sends an email from specified sender to specified recipient through Mandrill
 *
 * @author Rodney
 *
 * @param data <object> [required]:
 *              html <string> the full HTML content to be sent
 *              text <string> [optional] full text content to be sent
 *              subject <string> the message subject
 *              sender <string> the sender email address.
 *              recipient <string> the email address of the recipient
 *
 * @param scallback <FUNCTION>  success callback function
 * @param ecallback <FUNCTION>  error callback function
 */
exports.send = function(data, scallback, ecallback) {
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
    mandrillClient.messages.send({"message": message, "async": false}, function(result) {
        if (scallback) {
            scallback(result);
        } else {
            console.log(result);
        }
    }, function(e) {
        if (ecallback) {
            ecallback(e);
        } else {
            console.log(e);
        }
    });
};

/**
 * This module sends an email from specified sender to specified recipient through Mandrill using a template
 *
 * @author Rodney
 *
 * @param data <JSON> [required]:
 *              html <STRING> the full HTML content to be sent
 *              text <STRING> [optional] full text content to be sent
 *              subject <STRING> the message subject
 *              sender <STRING> the sender email address.
 *              recipient <STRING> the email address of the recipient
 *              attachments <ARRAY> an array of supported attachments to add to the message:
 *                              - type <STRING> the MIME type of the attachment
 *                              - name <STRING> the file name of the attachment
 *                              - content <STRING> the content of the attachment as a base64-encoded string
 *              
 * @param scallback <FUNCTION>  success callback function
 * @param ecallback <FUNCTION>  error callback function
 */
exports.sendTemplate = function(params, scallback, ecallback) {
    mandrillClient.messages.sendTemplate(params, function(result) {
        if (scallback) {
            scallback(result);
        } else {
            console.log(result);
        }
    }, function(e) {
        if (ecallback) {
            ecallback(e);
        } else {
            console.log(e);
        }
    });
};