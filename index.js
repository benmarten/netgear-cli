// Router Config
const ROUTER_MODEL = 'Nighthawk X6 R8000';
const ROUTER_IP = '192.168.1.1';
const ROUTER_USER = 'admin';
const ROUTER_PASS = 'password';
const MAX_UP = 1;
const MAX_DOWN = 10;

// Dependencies
const request = require('request');
const Xray = require('x-ray');
const x = Xray({
	filters: {
		split: function(value) {
			if (!value) {
				return value;
			}
			return value.split(SEPARATOR);
		}
	}
});

const SEPARATOR = '<br>';
const SEPARATOR_OUTPUT = ' - ';
const TITLE = ROUTER_MODEL + ' - Connected Devices';
// const DEVICE_TABLE_SEL = '#target > table > tr:nth-child(1) > td > div > ' +
// 'table > tr:nth-child(4) > td > table';
const DEVICE_TABLE_SEL = '#target > table > tr:nth-child(1) > td > div > ' +
	'table > tr:nth-child(4) > td > table > tr';
// const DEVICE_INFO_SEL = 'td:nth-child(5) @html | split';
const DEVICE_INFO_SEL = 'td:nth-child(5) > span > table > tr > ' +
	'td:nth-child(2) > span @html | split';
const DEVICE_CONNECTION_TYPE_SEL = 'td:nth-child(4)';
const DEVICE_UP_SEL = 'td:nth-child(7) > p.device-bwBarLabelPadding > span';
const DEVICE_DOWN_SEL = 'td:nth-child(6) > p.device-bwBarLabelPadding > span';
const SEP = '----------------------------------------------------------------------';

var BANDWIDTH_DOWN_USED = 0;
var BANDWIDTH_UP_USED = 0;
var MAX_IP_LEN = ROUTER_IP.length;

function calculateBandwithPercentag(results) {
	results.forEach(function(result) {
		MAX_IP_LEN = Math.max(result.info[1].length, MAX_IP_LEN);
		var down = result.down.substring(0, result.down.length - 3);
		var up = result.up.substring(0, result.up.length - 3);

		BANDWIDTH_DOWN_USED += parseFloat(down);
		BANDWIDTH_UP_USED += parseFloat(up);
	});
}

function printResults(results) {
	console.log(SEP);
	console.log(TITLE);
	console.log(SEP);
	results.forEach(function(result) {
		var down = result.down.substring(0, result.down.length - 2);
		var up = result.up.substring(0, result.down.length - 2);
		console.log((result.info[1] + "  ").substring(0, MAX_IP_LEN) +
			SEPARATOR_OUTPUT +
			down + ' (' + ((parseFloat(down) / MAX_DOWN) * 100).toFixed(0) + '%)' +
			SEPARATOR_OUTPUT +
			up + ' (' + ((parseFloat(up	) / MAX_UP) * 100).toFixed(0) + '%)' +
			SEPARATOR_OUTPUT +
			result.connectionType +
			SEPARATOR_OUTPUT +
			result.info[0]);
	});
	console.log(SEP);
	console.log('TTL - Down: ' + BANDWIDTH_DOWN_USED.toFixed(1) + ' Mb ' +
		'(' + ((BANDWIDTH_DOWN_USED / MAX_DOWN) * 100).toFixed(0) + '%)' +
		' - Up: ' + BANDWIDTH_UP_USED.toFixed(1) + ' Mb ' +
		'(' + ((BANDWIDTH_UP_USED / MAX_UP) * 100).toFixed(0) + '%)');
	console.log(SEP);
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
		x(body, DEVICE_TABLE_SEL, [{
			info: DEVICE_INFO_SEL,
			connectionType: DEVICE_CONNECTION_TYPE_SEL,
			up: DEVICE_UP_SEL,
			down: DEVICE_DOWN_SEL
		}])(function(err, results) {
			if (err)  {
				console.log('Error parsing device table. \n ' + err);
				return;
			}
			results = results.slice(1, results.length);

			calculateBandwithPercentag(results);

			printResults(results);
		});
	})
}

main();