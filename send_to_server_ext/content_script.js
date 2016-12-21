console.log("Hello from content script");
var TIMEOUT = 4 * 60 * 60 * 1000

var currentData = {
	title: "",
	track: "",
	album: ""
}

function mainFunction() {
	var data = getData();
	console.log(data);
	if((data.track != "" && data.album != "") && (data.track != currentData.track)) {
		console.log("sending");
		currentData = data;
		chrome.runtime.connect().postMessage(data);
	}
}


var periodicTask = setInterval(function(){
	console.log("Running periodic task from content script");
	mainFunction();
}, 2000);

setTimeout(function(){
	console.log("Killing periodic task");
	clearInterval(periodicTask);
}, TIMEOUT);


function getData() {
	var track = getTrack();
	var album = getAlbum();
	return {
		title: track + " from " + album,
		track: track,
		album: album
	}
}


function getTrack() {
	var el = document.getElementById('stitle');
	if(el !== null) {
		return el.textContent;
	} else {
		return "";
	}
}

function getAlbum() {
	var elements = document.querySelectorAll('#atitle > a');
	if(elements.length > 0) {
		return elements[0].textContent;
	} else {
		return "";
	}
}

