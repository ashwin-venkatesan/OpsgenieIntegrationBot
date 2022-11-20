const config=require('../config');
const axios = require("axios");
axios.defaults.baseURL = 'https://api.opsgenie.com/v2';
axios.defaults.headers.common['Authorization'] = "GenieKey " + process.env.OPSGENIE_API_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/json';

const alertbody = require('./alert.json');

var alertCreated = false;
var timedEvent = null;
var delay = 1 * 60 * 1000

function checkSender(id) {
	if(config.alerterIds[id]) return "alerter";
	if(config.responderIds[id]) return "responder";
	return "unknown";
}

async function createAlert() {
	if(alertCreated) return;
	try {
		if(timedEvent) clearTimeout(timedEvent);
		timedEvent = setTimeout(() => {
			axios.post('/alerts', alertbody);
			console.log("Alert created")
		}, delay);
		alertCreated = true;
		console.log(`Alert creating in ${delay} ms`);
	} catch (err) {
		console.log(err);
	}
}

async function closeAlert(force) {
	if(!force && !alertCreated) return;
	try {
		if(timedEvent) clearTimeout(timedEvent);
		const response = await axios.post('/alerts/cyber-abode-message-received/close?identifierType=alias',{});
		alertCreated = false;
		console.log("Alert closed");
	} catch (err) {
		console.log(err);
	}
}

function setDelay(minutes) {
	delay = minutes * 60 * 1000;
	console.log(`Delay changed to ${delay} ms`);
}

module.exports={checkSender,createAlert,closeAlert,setDelay}