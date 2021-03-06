// config.js

const config = {
	host: 'localhost',
	port: process.env.PORT || 8080,
	key: 'BbZJjyoXAdr8BUZuiKKARWimKfrSmQ6fv8kZ7OFfc',
	database: {
		host : '139.59.187.168',
		user : 'root',
		pass : 'R6V08zZhJt',
		name : 'super'
	},
	auth: {
		algorithm: [ 'HS256' ],  // only allow HS256 algorithm 
		accounts: {
			default: {
				id: 1,
				user: 'super'
			}
		}
	},
	email: {
		quote_url: 'http://dashbundle.co.za/emails/', 
		mandrill: {
			key: 'njqRVZ3J9J3psHDoFjnTLQ'
		}
	},
	support: {
		email: 'support@cloudlogic.co.za'
	},
	statuses: {
		orders: {
			pending: 1,
			processing: 2,
			confirmed: 5,
			cancelled: 7
		},
		quotes: {
			pending: 1,
			converted: 2,
			denied: 3
		}
	}
}

module.exports = config;
