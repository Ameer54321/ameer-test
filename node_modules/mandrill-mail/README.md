#What is

This is a simple wrapper to send email within the mandrill api.

#Getting started

Just install with

	npm install mandrill-mail

The there is just a *send()* function who excepts 3 params. There is an example:

```js
var client = require('mandrill-mail');

var data = {

	'html' : 'this is great', // Message itself in html format
	'subject' : 'great subject', //  the subject
	'from_email': 'mysuperemail@gmail.com', // Who sends the email
	'from_name' : 'mauro', // the sender name
	'to': [
			{                                   		 // the array who contains the recivers
	    		'email': 'mysuperemail@gmail.com',		// to email adress
	    		'name' : 'Mauro'						// to name
			},
			{
				'email' : 'foo@gmail.com',
				'name' : 'foo'
			}
		]
};

/**
 * [description]
 * @param  {string} The api key
 * @param {object} An obj containing all the information
 * @param {function} A callback function
 */
client.send('my-secret-key', data, function(json){
	console.log(json)
});
```