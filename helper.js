const config = require("./config");
const axios = require("axios");
axios.defaults.baseURL = "https://api.opsgenie.com/v2";
axios.defaults.headers.common["Authorization"] =
  "GenieKey " + process.env.OPSGENIE_API_TOKEN;
axios.defaults.headers.post["Content-Type"] = "application/json";

const alertbody = require("./alert.json");

var alertCreated = false;
var timedEvent = null;
var inDNDState = false;
var dndTickets = 3;
var lastActivity = Date.now();
var lastActivityThreshold = 15 * 60 * 1000;
var minDelay = 1 * 60 * 1000;
var maxDelay = 5 * 60 * 1000;
var dndDelay = 30 * 60 * 1000;

function checkUser(id) {
  if (config.alerterIds[id]) return "alerter";
  if (config.responderIds[id]) return "responder";
  return "unknown";
}

async function createAlert(force) {
  if (alertCreated && !force) return;
  try {
    if (timedEvent) clearTimeout(timedEvent);

    let delay = maxDelay;
    if (isAFK()) delay = minDelay;
    if (force) delay = 0;

    timedEvent = setTimeout(() => {
      axios.post("/alerts", alertbody);
      console.log("Alert created");
    }, delay);
    alertCreated = true;
    console.log(`Alert creating in ${delay / 60000} m`);
  } catch (err) {
    console.log(err);
  }
}

async function closeAlert(force) {
  if (!force && !alertCreated) return;
  try {
    if (timedEvent) clearTimeout(timedEvent);
    const response = await axios.post(
      "/alerts/cyber-abode-message-received/close?identifierType=alias",
      {}
    );
    alertCreated = false;
    inDNDState = false;
    console.log("Alert closed");
  } catch (err) {
    console.log(err);
  }
}

async function skipAlert() {
  if (inDNDState || dndTickets <= 0) return;
  await closeAlert();
  timedEvent = setTimeout(() => {
    alertCreated = false;
    inDNDState = false;
    dndTickets -= 1;
    console.log(`Alerting resumed`);
  }, dndDelay);
  alertCreated = true;
  inDNDState = true;
  console.log(`Alerting paused for ${dndDelay / 60000} m`);
}

function updateLastActivity() {
  lastActivity = Date.now();
}

function setMinDelay(minutes) {
  let delay = minutes * 60 * 1000;
  if (maxDelay - delay < 1 * 60 * 1000)
    return `Min delay of ${
      delay / 60000
    } m too close to the current Max Delay of ${maxDelay / 60000} m`;
  let oldDelay = minDelay;
  minDelay = delay;
  console.log(
    `Min Delay changed from ${oldDelay / 60000} m to ${minDelay / 60000} m`
  );
  return `Min Delay changed from ${oldDelay / 60000} m to ${
    minDelay / 60000
  } m`;
}

function setMaxDelay(minutes) {
  let delay = minutes * 60 * 1000;
  if (delay - minDelay < 1 * 60 * 1000)
    return `Max delay of ${delay / 60000} m too close to current Min Delay of ${
      minDelay / 60000
    } m`;
  let oldDelay = maxDelay;
  maxDelay = delay;
  console.log(
    `Max Delay changed from ${oldDelay / 60000} m to ${maxDelay / 60000} m`
  );
  return `Max Delay changed from ${oldDelay / 60000} m to ${
    maxDelay / 60000
  } m`;
}

function setLastActivityThreshold(minutes) {
  let threshold = minutes * 60 * 1000;
  if (threshold <= maxDelay)
    return `Threshold for inactivity too low! \n${getCurrentStat()}`;
  let oldThreshold = lastActivityThreshold;
  lastActivityThreshold = threshold;
  console.log(
    `Last Activity Threshold changed from ${oldThreshold / 60000} m to ${
      lastActivityThreshold / 60000
    } m`
  );
  return `Last Activity Threshold changed from ${oldThreshold / 60000} m to ${
    lastActivityThreshold / 60000
  } m`;
}

function setDndDelay(minutes) {
  let threshold = minutes * 60 * 1000;
  if (minutes <= 5) return `Threshold for DND too low! \n${getCurrentStat()}`;
  let oldThreshold = dndDelay;
  dndDelay = threshold;
  console.log(
    `Last Activity Threshold changed from ${oldThreshold / 60000} m to ${
      dndDelay / 60000
    } m`
  );
  return `Last Activity Threshold changed from ${oldThreshold / 60000} m to ${
    dndDelay / 60000
  } m`;
}

function addDNDTickets(count) {
  let oldCount = dndTickets;
  dndTickets += count;
  console.log(`DND Tickets increased from ${oldCount} to ${dndTickets}`);
  return `DND Tickets increased from ${oldCount} to ${dndTickets}`;
}

function getCurrentStat() {
  return `Last Activity Threshold: ${
    lastActivityThreshold / 60000
  } m \nMin Delay: ${minDelay / 60000} m \nMaxDelay: ${
    maxDelay / 60000
  } m \nDND Delay: ${
    dndDelay / 60000
  } m \nDND Tickets: ${dndTickets} \nIs DND Enabled: ${inDNDState}`;
}

function isAFK() {
  let inactivity = Date.now() - lastActivity;
  return inactivity > lastActivityThreshold;
}

module.exports = {
  checkUser,
  createAlert,
  closeAlert,
  skipAlert,
  updateLastActivity,
  setMinDelay,
  setMaxDelay,
  setLastActivityThreshold,
  setDndDelay,
  addDNDTickets,
  getCurrentStat,
};
