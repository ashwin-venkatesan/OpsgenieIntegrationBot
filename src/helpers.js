const config=require('../config');
const axios = require("axios");
axios.defaults.baseURL = 'https://api.opsgenie.com/v2';
axios.defaults.headers.common['Authorization'] = "GenieKey " + process.env.OPSGENIE_API_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/json';

const alertbody = require('./alert.json');

var alertCreated = true;

function checkSender(id) {
	if(config.alerterIds[id]) return "alerter";
	if(config.responderIds[id]) return "responder";
	return "unknown";
}

async function createAlert() {
	if(alertCreated) return;
	try {
		const response = await axios.post('/alerts', alertbody);
		alertCreated = true;
		console.log("Alert created");
	} catch (err) {
		console.log(err);
	}
}

async function closeAlert() {
	if(!alertCreated) return;
	try {
		const response = await axios.post('/alerts/cyber-abode-message-received/close?identifierType=alias',{});
		alertCreated = false;
		console.log("Alert closed");
	} catch (err) {
		console.log(err);
	}
}

module.exports={checkSender,createAlert,closeAlert}