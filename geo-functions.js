const NodeGeocoder = require('node-geocoder');
const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'YOUR_API_KEY',
    formatter: null
};
const geocoder = NodeGeocoder(options);


module.exports = function() {

    function getGeocode(address, callback) {
        geocoder.geocode({address: address}, function (err, res) {
            if (callback) {
                callback(err, res);
            } else {
                console.log(res);
            }
        });
    };

    function reverseGeocode(lat, lng, callback) {
        geocoder.reverse({lat:lat, lon:lng}, function(err, res) {
            if (callback) {
                callback(err, res);
            } else {
                console.log(res);
            }
        });
    };

    return {
        getGeocode: getGeocode,
        reverseGeocode: reverseGeocode
    };
};