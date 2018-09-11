'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');

function createToken(user) {
  	let scopes;
  	// Check if the user object passed in
  	// has admin set to true, and if so, set
  	// scopes to admin
  	if (user.admin) {
    	scopes = 'admin';
  	}
  	// Sign the JWT
  	return jwt.sign({ id: user.uid, username: user.username, scope: scopes }, config.key, { algorithm: 'HS256', expiresIn: "10h" } );
}
module.exports = createToken;