/**
 * Popup Js Logic
 *
 * Handle site registration for token spying
 *
 * Released under GNU General Public Licence v3
 */

 /**
  * Function to get the active tab when click occurs
  */
function getCurrentTabUrl(callback) {
  /* Query filter to be passed to chrome.tabs.query */
  var queryInfo = {
    active: true,         /* Active tabs only */
    currentWindow: true   /* Active window only */
  };

  /* Query the tab to Chrome API */
  chrome.tabs.query(queryInfo, function(tabs) {

    /* Filter the first result only */
    var tab = tabs[0];

    /* Get the tab URL */
    var url = tab.url;

    /* Check f th URL is really a string
       If the tab became inactive during URL fetch we can't access it */
    console.assert(typeof url == 'string', 'tab.url should be a string');

    /* Call the callback with the URL because of async calls */
    callback(url);
  });
}

/**
 * Helper function to change popup status message
 */
function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

/**
 * Event listener on popup loaded = handle click on extension button
 */
document.addEventListener('DOMContentLoaded', function() {
  /* Get the URL of current tab */
  getCurrentTabUrl(function(url) {

    /* Inform user of new URL is parsing */
    renderStatus('Linking SPHR to ' + url + '...');

    /* Send message to background script to register new URL */
    chrome.runtime.sendMessage({url: url}, function(response) {
      /* Inform user about successnes of the request */
      if(response.ack) {
        renderStatus('SPHR successfuly linked to ' + url);
      } else {
        renderStatus('ERROR : ' + response.etype + ' ' + response.message);
      }
    })
  });
});
