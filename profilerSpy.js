/**
 * Background script
 *
 * Constantly runs to handle new debug token or new URL to spy
 *
 * Released under GNU General Public Licence v3
 */

var ws = null;
var url;

/**
 * Function to start websocket connection to app if not started yet
 */
function startWebsockets() {
  if(ws === null || ws.readyState != 1) {
    /* Websocket object not defined or connecting not in CONNECTED state */

    /* If websockets are supported by browser start a new connection to app */
    if ("WebSocket" in window) {
      ws = new WebSocket("ws://localhost:3615");
    } else {
      console.error("Websockets not supported by browser");
    }
  } else {
    /* Else ignore */
    console.log("Websockets already connected, ignoring");
  }
}

/**
 * Function to close websocket connection properly
 */
function stopWebsockets() {
  ws.close();
  console.info("Websockets disconnected");
}

/**
 * Function to check if websocket connection is properly set
 */
function checkWebsocketConnection() {
  if(ws != null) {
    if(ws.readystate != 1) {
      /* Connection isn't in CONNECTED state, trying to restart it */
      stopWebsockets();
      startWebsockets();
    }
  } else {
    /* Connection not started, start it */
    startWebsockets();
  }
}

/**
 * Function to handle new debug token and send it to app
 */
function handleHeaders(details) {

  /* Check if it's the main request (not images, js or css request) */
  if(details.type === 'main_frame') {

    /* Parse headers */
    details.responseHeaders.forEach(function (header) {
      if(header.name == "X-Debug-Token") {
        /* Header containing the token found */

        /* Get the token value */
        var token = header.value;

        /* Debug */
        //console.info("Request Profiler reloading with token " + token);

        /* Check if the websocket connection is still alive */
        checkWebsocketConnection();

        /* Send URL + token to app */
        ws.send(url + "+" + token);
      }
    });
  }
}

/**
 * Event Listener to handle message from popup through Chrome messaging API
 */
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    /* Get the URL to register */
    url = String(request.url);

    /* Debug */
    //console.info(url + " added to watch list");
    console.warn("For the moement only one tab is observed. This new registered tab replace the previous one")

    /* Remove old listener (can be on a wrong url) */
    chrome.webRequest.onHeadersReceived.removeListener(handleHeaders);

    /* Add new listener to new URL */
    chrome.webRequest.onHeadersReceived.addListener(
      handleHeaders,
      {urls: [url + "*"]},
      ["responseHeaders"]
    );

    /* Check the websocket connection to know if app started */
    checkWebsocketConnection();

    /* Wait 200 ms and check it */
    setTimeout(function() {
      /* Inform user about readiness of the websocket connection */
      if(ws == null || ws.readyState != 1) {
        sendResponse({ack: false, etype: "ECONNCLOSED", message: "The connection to app cannot be established. Please check if the app is started."});
        return;
      } else {
        sendResponse({ack: true});
      }
    }, 200);
  }
);
