console.log("Hello from extension's background.js page");

var serverUrl = 'http://localhost:3075/submit';

function notify(data) {
  var time = /(..)(:..)/.exec(new Date());     // The prettyprinted time.
  var hour = time[1] % 12 || 12;               // The prettyprinted hour.
  var period = time[1] < 12 ? 'a.m.' : 'p.m.'; // The period of the day.
  var notification = new Notification(hour + time[2] + ' ' + period, {
    icon: 'mail_128x128.png',
    body: data.body
  });
  console.log(notification);
}

function makeRequest(info) {
  var request = new XMLHttpRequest();
  request.open('POST', serverUrl, true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      console.log(data);
      notify({body: info.title + '\nSent to server, status=' + data.status});
    } else {
      console.log("error");
    }
  };
  request.onerror = function() {
    console.log("error");
  };
  request.send(JSON.stringify(info));
}

function executeMainAction(tab_id, tab_url, info) {
  console.log(tab_id, tab_url, info);
  makeRequest(info);
}

chrome.runtime.onConnect.addListener(function(port) {
  var tab = port.sender.tab;
  // This will get called by the content script we execute in
  // the tab as a result of the user pressing the browser action.
  port.onMessage.addListener(function(info) {
    executeMainAction(tab.id, tab.url, info);
  });
});

// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
  // We can only inject scripts to find the title on pages loaded with http
  // and https so for all other pages, we don't ask for the title.
  if (tab.url.indexOf("http:") != 0 &&
      tab.url.indexOf("https:") != 0) {
    // executeMainAction(tab.id, tab.url, {});
  } else {
    chrome.tabs.executeScript(null, {file: "content_script.js"});
  }
});
