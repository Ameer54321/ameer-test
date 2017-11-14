var request = require('request');

base_url = 'https://mandrillapp.com/api/1.0';
send_url = base_url + '/messages/send.json';


exports.send = function(key,data, cb) {
    request(
        {
            'uri': send_url,
            'method': 'POST',
            'form' : {
                'key' : key,
                'message' : {
                    'html' : data.html,
                    'subject': data.subject,
                    'from_email' : data.from_email,
                    'from_name' : data.from_name,
                    'to' : data.to,
                    'important' : true,
                    'track_opens' : false,
                    'track_clicks' : false,
                    'auto_text' : true,
                    'auto_html' : true,
                    'inline_css' : true,
                    'url_strip_qs' : false,
                    'preserve_recipients': true,
                    'view_content_link': false,
                    "headers": {
                        "Reply-To": data.from_email
                    }


                }
            }
        },
        function(err, resp, body){
            cb(body);
        }
    );
};