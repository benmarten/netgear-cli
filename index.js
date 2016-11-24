// Router Config
const ROUTER_MODEL = 'Nighthawk X6 R8000';
const ROUTER_IP = '192.168.41.1';
const ROUTER_USER = 'admin';
const ROUTER_PASS = 'password';

// Dependencies
const request = require('request');
const Xray = require('x-ray');
const x = Xray({
	filters: {
		split: function(value) {
			let currentLength = (value.length > SEPARATOR.length) ?
				value.length - SEPARATOR.length + SEPARATOR_OUTPUT.length : 0;
			MAX_LEN = Math.max(Math.max(currentLength, MAX_LEN), TITLE.length);
			return value.split(SEPARATOR);
		}
	}
});

const SEPARATOR = '<br>';
const SEPARATOR_OUTPUT = ' - ';
const TITLE = ROUTER_MODEL + ' - Connected Devices';
const DEVICE_TABLE_SEL = '#target > table > tr:nth-child(1) > td > div > ' +
	'table > tr:nth-child(4) > td > table';
const DEVICE_INFO_SEL = 'tr > td:nth-child(5) > span > table > tr > ' +
	'td:nth-child(2) > span @html | split';

var MAX_LEN = 0;

function printAdjustedSeparator() {
	let i = 0;
	let separator = '';
	while (i++ < (MAX_LEN)) {
		separator += '=';
	}
	console.log(separator);
}

function main() {
	request.get('http://' + ROUTER_IP + '/DEV_device_iQoS.htm', {
		'auth': {
			'user': ROUTER_USER,
			'pass': ROUTER_PASS,
			'sendImmediately': false
		}
	}, function(error, response, body) {
		if (error ||  response.statusCode !== 200 ||
			response.headers['content-type'] !==
			'text/html; charset=\"UTF-8\"' ||
			body.length == 0) {
			console.log('Error accessing router. \n' + response);
		}
		x(body, DEVICE_TABLE_SEL, [DEVICE_INFO_SEL])(function(err, results) {
			if (err)  {
				console.log('Error parsing device table. \n ' + err);
				return;
			}
			printAdjustedSeparator();
			console.log(TITLE);
			printAdjustedSeparator();
			results.forEach(function(result) {
				console.log(result[1] + SEPARATOR_OUTPUT + result[0])
			});
		});
	})
}

main();