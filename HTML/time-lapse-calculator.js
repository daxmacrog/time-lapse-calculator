// declare global variables for calculate and clipboard functions
//
var outputDays;
var outputHours;
var outputMinutes;
var outputSeconds;
var outputFrames;
var outputSpeed;
var outputStorageRAW;
var outputStorageJPG;


// set defaults (1st launch only)
//

// uncomment to reset localStorage for TESTING ONLY:
// localStorage.clear();
//

if (!localStorage.optionsVariable) {
	localStorage.optionsVariable = 'Shutter interval';
}
if (!localStorage.lastUsedFrameRate) {
	localStorage.lastUsedFrameRate = '30';
}
// mode: shutter interval, event, or target; populate last used frame rate and camera res settings
$(document).ready(function() {
	if (localStorage.optionsVariable == 'Event duration') {
		$('#durations-interval-mode').hide();
		$('#durations-event-mode').show();
		$('#main-result-interval-mode').hide();
		$('#main-result-event-mode').show();
		$('#calculate-button-mode').text('Event');
	}
	else if (localStorage.optionsVariable == 'Target duration') {
		$('#durations-interval-mode').hide();
		$('#durations-target-mode').show();
		$('#main-result-interval-mode').hide();
		$('#main-result-target-mode').show();
		$('#calculate-button-mode').text('Target');
	}
	else { // shutter interval
		$('#durations-interval-mode').addClass('show');
		$('#main-result-interval-mode').addClass('show');
		$('#calculate-button-mode').text('Shutter');
	}
	if (localStorage.lastUsedFrameRate) {
		$('#input-frame-rate').val(localStorage.lastUsedFrameRate);
	}
	if (localStorage.lastUsedCameraRes) {
		$('#input-camera-res').val(localStorage.lastUsedCameraRes);
	}
// immediately store any changes to frame rate or camera res settings on main page
	$('#input-frame-rate').change(function() {
		localStorage.lastUsedFrameRate = $(this).val();
	});
	$('#input-camera-res').change(function() {
		localStorage.lastUsedCameraRes = $(this).val();
	});
});
// settings page (#settings table initially hidden by css)
function showSettings() {
	$('#time-lapse-calculator').hide();
	$('#settings-icon').hide();
	$('body').scrollTop(0);
	$('body').css('background-color', '#aaa');
	if (localStorage.optionsVariable) {
		$('#options-variable').val(localStorage.optionsVariable);
	}
	window.webkit.messageHandlers.swiftJSBridge.postMessage("update version text")
	$('#settings').show();
}
function cancelSettings() {
	blurFocusedField();
	$('#settings').hide();
	$('body').css('background-color', '#333');
	$('.back-to-top').removeClass('show'); // otherwise arrows are still visible if they were visible before going to settings page even though it goes back to top after Cancel
	$('#time-lapse-calculator').show();
	$('#settings-icon').show();
}
function saveSettings() {
	blurFocusedField();
	localStorage.optionsVariable = $('#options-variable').val();
	$('#settings').hide();
	$('body').css('background-color', '#333');
	if ($('#options-variable').val() == 'Event duration') {
		$('#durations-interval-mode').hide();
		$('#durations-target-mode').hide();
		$('#durations-event-mode').show();
		$('#main-result-interval-mode').hide();
		$('#main-result-target-mode').hide();
		$('#main-result-event-mode').show();
		$('#calculate-button-mode').text('Event');
	}
	else if ($('#options-variable').val() == 'Target duration') {
		$('#durations-interval-mode').hide();
		$('#durations-event-mode').hide();
		$('#durations-target-mode').show();
		$('#main-result-interval-mode').hide();
		$('#main-result-event-mode').hide();
		$('#main-result-target-mode').show();
		$('#calculate-button-mode').text('Target');
	}
	else { // shutter interval
		$('#durations-target-mode').hide();
		$('#durations-event-mode').hide();
		$('#durations-interval-mode').show();
		$('#durations-interval-mode').addClass('show');
		$('#main-result-target-mode').hide();
		$('#main-result-event-mode').hide();
		$('#main-result-interval-mode').show();
		$('#main-result-interval-mode').addClass('show');
		$('#calculate-button-mode').text('Shutter');
	}
	$('.back-to-top').removeClass('show'); // otherwise arrows are still visible if they were visible before going to settings page even though it goes back to top after Save
	$('#time-lapse-calculator').show();
	$('#settings-icon').show();
}

// scroll detection flag (used to prevent unwanted ontouchend activations during swipes)
//
scrollingDetected = false;

document.addEventListener('touchmove', scrollStart, false);
function scrollStart() {
	scrollingDetected = true;
}
document.addEventListener('touchstart', touchReset, false);
document.addEventListener('touchend', touchReset, false);
function touchReset() {
	scrollingDetected = false;
}


/////////////////////////////////////// CALCULATE
//
function blurFocusedField() { // if frame rate or camera res is still selected, hide keyboard (also called by Save or Cancel on settings page)
	$('input').blur();
	$('select').blur();
}

function calculateResults() {
	if (scrollingDetected == true) { // cancel if touch is start of scroll
		return;
	}

	// Variable to calculate: SHUTTER INTERVAL
	if (localStorage.optionsVariable == 'Shutter interval') {
	
		var inputEventDays = parseInt(document.getElementById('input-event-days-interval-mode').value);
		var inputEventHours = parseInt(document.getElementById('input-event-hours-interval-mode').value);
		var inputEventMinutes = parseInt(document.getElementById('input-event-minutes-interval-mode').value);
		var inputTargetHours = parseInt(document.getElementById('input-target-hours-interval-mode').value);
		var inputTargetMinutes = parseInt(document.getElementById('input-target-minutes-interval-mode').value);
		var inputTargetSeconds = parseInt(document.getElementById('input-target-seconds-interval-mode').value);
		var inputFrameRate = parseInt(document.getElementById('input-frame-rate').value);
		var inputCameraRes = parseFloat(document.getElementById('input-camera-res').value);

		var totalEvent = (inputEventMinutes*60)+(inputEventHours*3600)+(inputEventDays*86400);
		var totalTarget = inputTargetSeconds+(60*inputTargetMinutes)+(3600*inputTargetHours);
		outputFrames = totalTarget*inputFrameRate;
		var outputInterval = totalEvent/outputFrames;
		outputHours = Math.floor(outputInterval/3600);
		outputMinutes = Math.floor((outputInterval-(outputHours*3600))/60);
		outputSeconds = outputInterval-(outputHours*3600)-(outputMinutes*60);
		outputSpeed = totalEvent/totalTarget;
		outputStorageRAW = outputFrames*inputCameraRes*.00142; // loosely based on Canon 5D Mark III (30MB per .CR2 file)
		outputStorageJPG = outputFrames*inputCameraRes*.0006; // loosely based on Canon 5D Mark III fine quality setting

		if ( isNaN(outputInterval) || totalTarget >= totalEvent || totalTarget == 0 ) {
			document.getElementById('output-interval').innerHTML = '—&nbsp;<span class="result-hms-unit">:</span>&nbsp;—&nbsp;<span class="result-hms-unit">:</span>&nbsp;—';
			document.getElementById('output-frames').innerHTML = '—';
			document.getElementById('output-speed').innerHTML = '—';
			document.getElementById('output-storage-raw').innerHTML = '—';
			document.getElementById('output-storage-jpg').innerHTML = '—';
		}
		else if ( isNaN(outputStorageRAW) || isNaN(outputStorageJPG) ) {
			document.getElementById('output-interval').innerHTML = outputHours + '<span class="result-hms-unit">H</span>&nbsp;' + outputMinutes + '<span class="result-hms-unit">M</span>&nbsp;' + outputSeconds.toFixed(2) + '<span class="result-hms-unit">S</span>';
			document.getElementById('output-frames').innerHTML = outputFrames.toFixed(0);
			document.getElementById('output-speed').innerHTML = outputSpeed.toFixed(1);
			document.getElementById('output-storage-raw').innerHTML = '—'; 
			document.getElementById('output-storage-jpg').innerHTML = '—';
		}
		else {
			document.getElementById('output-interval').innerHTML = outputHours + '<span class="result-hms-unit">H</span>&nbsp;' + outputMinutes + '<span class="result-hms-unit">M</span>&nbsp;' + outputSeconds.toFixed(2) + '<span class="result-hms-unit">S</span>';
			document.getElementById('output-frames').innerHTML = outputFrames.toFixed(0);
			document.getElementById('output-speed').innerHTML = outputSpeed.toFixed(1);
			if (outputStorageRAW < 1) {
				document.getElementById('output-storage-raw').innerHTML = '&lt;1';
			}
			else {
				document.getElementById('output-storage-raw').innerHTML = '~' + outputStorageRAW.toFixed(0); 
			}
			if (outputStorageJPG < 1) {
				document.getElementById('output-storage-jpg').innerHTML = '&lt;1';
			}
			else {
				document.getElementById('output-storage-jpg').innerHTML = '~' + outputStorageJPG.toFixed(0);
			}
		}
	}

	// Variable to calculate: EVENT DURATION
	if (localStorage.optionsVariable == 'Event duration') {
	
		var inputTargetHours = parseInt(document.getElementById('input-target-hours-event-mode').value);
		var inputTargetMinutes = parseInt(document.getElementById('input-target-minutes-event-mode').value);
		var inputTargetSeconds = parseInt(document.getElementById('input-target-seconds-event-mode').value);
		var inputIntervalHours = parseInt(document.getElementById('input-interval-hours-event-mode').value);
		var inputIntervalMinutes = parseInt(document.getElementById('input-interval-minutes-event-mode').value);
		var inputIntervalSeconds = parseInt(document.getElementById('input-interval-seconds-event-mode').value);
		var inputFrameRate = parseInt(document.getElementById('input-frame-rate').value);
		var inputCameraRes = parseFloat(document.getElementById('input-camera-res').value);

		var totalTarget = inputTargetSeconds+(60*inputTargetMinutes)+(3600*inputTargetHours);
		var totalInterval = inputIntervalSeconds+(60*inputIntervalMinutes)+(3600*inputIntervalHours);
		outputFrames = totalTarget*inputFrameRate;
		var outputEvent = totalInterval*outputFrames;
		outputDays = Math.floor(outputEvent/86400);
		outputHours = Math.floor((outputEvent-(outputDays*86400))/3600);
		outputMinutes = Math.floor((outputEvent-(outputDays*86400)-(outputHours*3600))/60);
		outputSeconds = outputEvent-(outputDays*86400)-(outputHours*3600)-(outputMinutes*60);
		outputSpeed = outputEvent/totalTarget;
		outputStorageRAW = outputFrames*inputCameraRes * .00125; // loosely based on Canon 5D Mark III (30MB per .CR2 file)
		outputStorageJPG = outputFrames*inputCameraRes  * .0005; // loosely based on Canon 5D Mark III fine quality setting setting
	
		if ( isNaN(outputEvent) || totalTarget == 0 || totalInterval == 0 ) {
			document.getElementById('output-event').innerHTML = '—&nbsp;<span class="result-hms-unit">:</span>&nbsp;—&nbsp;<span class="result-hms-unit">:</span>&nbsp;—&nbsp;<span class="result-hms-unit">:</span>&nbsp;—';
			document.getElementById('output-frames').innerHTML = '—';
			document.getElementById('output-speed').innerHTML = '—';
			document.getElementById('output-storage-raw').innerHTML = '—';
			document.getElementById('output-storage-jpg').innerHTML = '—';
		}
		else if ( isNaN(outputStorageRAW) || isNaN(outputStorageJPG) ) {
			document.getElementById('output-event').innerHTML = outputDays + '<span class="result-hms-unit">D</span>&nbsp;' + outputHours + '<span class="result-hms-unit">H</span>&nbsp;' + outputMinutes + '<span class="result-hms-unit">M</span>&nbsp;' + outputSeconds.toFixed(2) + '<span class="result-hms-unit">S</span>';
			document.getElementById('output-frames').innerHTML = outputFrames.toFixed(0);
			document.getElementById('output-speed').innerHTML = outputSpeed.toFixed(1);
			document.getElementById('output-storage-raw').innerHTML = '—'; 
			document.getElementById('output-storage-jpg').innerHTML = '—';
		}
		else {
			document.getElementById('output-event').innerHTML = outputDays + '<span class="result-hms-unit">D</span>&nbsp;' + outputHours + '<span class="result-hms-unit">H</span>&nbsp;' + outputMinutes + '<span class="result-hms-unit">M</span>&nbsp;' + outputSeconds.toFixed(2) + '<span class="result-hms-unit">S</span>';
			document.getElementById('output-frames').innerHTML = outputFrames.toFixed(0);
			document.getElementById('output-speed').innerHTML = outputSpeed.toFixed(1);
			if (outputStorageRAW < 1) {
				document.getElementById('output-storage-raw').innerHTML = '&lt;1';
			}
			else {
				document.getElementById('output-storage-raw').innerHTML = '~' + outputStorageRAW.toFixed(0); 
			}
			if (outputStorageJPG < 1) {
				document.getElementById('output-storage-jpg').innerHTML = '&lt;1';
			}
			else {
				document.getElementById('output-storage-jpg').innerHTML = '~' + outputStorageJPG.toFixed(0);
			}
		}
	}

	// Variable to calculate: TARGET DURATION
	if (localStorage.optionsVariable == 'Target duration') {
	
		var inputEventDays = parseInt(document.getElementById('input-event-days-target-mode').value);
		var inputEventHours = parseInt(document.getElementById('input-event-hours-target-mode').value);
		var inputEventMinutes = parseInt(document.getElementById('input-event-minutes-target-mode').value);
		var inputIntervalHours = parseInt(document.getElementById('input-interval-hours-target-mode').value);
		var inputIntervalMinutes = parseInt(document.getElementById('input-interval-minutes-target-mode').value);
		var inputIntervalSeconds = parseInt(document.getElementById('input-interval-seconds-target-mode').value);
		var inputFrameRate = parseInt(document.getElementById('input-frame-rate').value);
		var inputCameraRes = parseFloat(document.getElementById('input-camera-res').value);

		var totalEvent = (inputEventMinutes*60)+(inputEventHours*3600)+(inputEventDays*86400);
		var totalInterval = inputIntervalSeconds+(60*inputIntervalMinutes)+(3600*inputIntervalHours);
		outputFrames = totalEvent/totalInterval;
		var outputTarget = outputFrames/inputFrameRate;
		outputHours = Math.floor(outputTarget/3600);
		outputMinutes = Math.floor((outputTarget-(outputHours*3600))/60);
		outputSeconds = outputTarget-(outputHours*3600)-(outputMinutes*60);
		outputSpeed = totalEvent/outputTarget;
		outputStorageRAW = outputFrames*inputCameraRes * .00125; // loosely based on Canon 5D Mark III (30MB per .CR2 file)
		outputStorageJPG = outputFrames*inputCameraRes  * .0005; // loosely based on Canon 5D Mark III fine quality setting setting
	
		if ( isNaN(outputTarget) || totalInterval >= totalEvent || totalInterval == 0 ) {
			document.getElementById('output-target').innerHTML = '—&nbsp;<span class="result-hms-unit">:</span>&nbsp;—&nbsp;<span class="result-hms-unit">:</span>&nbsp;—';
			document.getElementById('output-frames').innerHTML = '—';
			document.getElementById('output-speed').innerHTML = '—';
			document.getElementById('output-storage-raw').innerHTML = '—';
			document.getElementById('output-storage-jpg').innerHTML = '—';
		}
		else if ( isNaN(outputStorageRAW) || isNaN(outputStorageJPG) ) {
			document.getElementById('output-target').innerHTML = outputHours + '<span class="result-hms-unit">H</span>&nbsp;' + outputMinutes + '<span class="result-hms-unit">M</span>&nbsp;' + outputSeconds.toFixed(2) + '<span class="result-hms-unit">S</span>';
			document.getElementById('output-frames').innerHTML = outputFrames.toFixed(0);
			document.getElementById('output-speed').innerHTML = outputSpeed.toFixed(1);
			document.getElementById('output-storage-raw').innerHTML = '—'; 
			document.getElementById('output-storage-jpg').innerHTML = '—';
		}
		else {
			document.getElementById('output-target').innerHTML = outputHours + '<span class="result-hms-unit">H</span>&nbsp;' + outputMinutes + '<span class="result-hms-unit">M</span>&nbsp;' + outputSeconds.toFixed(2) + '<span class="result-hms-unit">S</span>';
			document.getElementById('output-frames').innerHTML = outputFrames.toFixed(0);
			document.getElementById('output-speed').innerHTML = outputSpeed.toFixed(1);
			if (outputStorageRAW < 1) {
				document.getElementById('output-storage-raw').innerHTML = '&lt;1';
			}
			else {
				document.getElementById('output-storage-raw').innerHTML = '~' + outputStorageRAW.toFixed(0); 
			}
			if (outputStorageJPG < 1) {
				document.getElementById('output-storage-jpg').innerHTML = '&lt;1';
			}
			else {
				document.getElementById('output-storage-jpg').innerHTML = '~' + outputStorageJPG.toFixed(0);
			}
		}
	}

	$('html, body').animate({scrollTop: $(document).height()-$(window).height()}, "fast");	// scroll all the way down
	$('div#copy-button').html('<span class="clipboard-icon">&#xf0ea;</span> Copy Results');
}


// number input spin buttons
//
function incrementWithLeadingZeros(id, direction, maxValue) {
	var inputValue = document.getElementById(id).value;

	if (direction == 'up') {
		if (inputValue == maxValue) {
			if (maxValue > 99) {
				document.getElementById(id).value = '000';
			}
			else {
				document.getElementById(id).value = '00';
			}
		} else if (inputValue < maxValue) {
			inputValue++;
			var incrementedValue = inputValue;
			if (incrementedValue < 10 && maxValue > 99) { // zero padding for 1-9 with 3-digit max value (i.e. days)
				document.getElementById(id).value = '00'+incrementedValue;
			}
			else if (incrementedValue < 100 && maxValue > 99) { // zero padding for 10-99 with 3-digit max value (i.e. days)
				document.getElementById(id).value = '0'+incrementedValue;
			}
			else if (incrementedValue < 10) { // zero padding for 1-9 with 2-digit max value (i.e. minutes, seconds)
				document.getElementById(id).value = '0'+incrementedValue;
			}
			else { // no zero padding (same number of digits as max value)
				document.getElementById(id).value = incrementedValue;
			}
		}
	}
	if (direction == 'down') {
		if (inputValue == 0) {
			document.getElementById(id).value = maxValue;
		} else if (inputValue > 0) {
			inputValue--;
			var incrementedValue = inputValue;
			if (incrementedValue < 10 && maxValue > 99) { // zero padding for 1-9 with 3-digit max value (i.e. days)
				document.getElementById(id).value = '00'+incrementedValue;
			}
			else if (incrementedValue < 100 && maxValue > 99) { // zero padding for 10-99 with 3-digit max value (i.e. days)
				document.getElementById(id).value = '0'+incrementedValue;
			}
			else if (incrementedValue < 10) { // zero padding for 1-9 with 2-digit max value (i.e. minutes, seconds)
				document.getElementById(id).value = '0'+incrementedValue;
			}
			else { // no zero padding (same number of digits as max value)
				document.getElementById(id).value = incrementedValue;
			}
		}
	}
}

function holdIncrementUp(id, maxValue) { // triggered by ontouchstart
	if (scrollingDetected == true) { // cancel if touch is start of scroll
		return;
	}
    holdTimer = setTimeout(function() {
		incrementRepeat = setInterval(function() {
			incrementWithLeadingZeros(id, 'up', maxValue);
		},100); // repeat speed
    },500); // touch is considered a hold after this delay
}
function tapIncrementUp(id, maxValue) { // triggered by ontouchend
	if ( typeof(holdTimer) != 'undefined' ) { // only execute if holdTimer has been defined by an ontouchstart or an error will occur (it always should be, because there can't be an ontouchend without an ontouchstart, but just to be safe)
		clearTimeout(holdTimer); // cancel touch/hold if it hasn't started incrementing yet
	}
	if ( typeof(incrementRepeat) != 'undefined' ) { // only execute if incrementRepeat has been defined by a hold or an error will occur
		clearInterval(incrementRepeat); // cancel touch/hold if it has started incrementing
	}
	if (scrollingDetected == true) { // cancel if touch is start of scroll
		return;
	}
	incrementWithLeadingZeros(id, 'up', maxValue);
}

function holdIncrementDown(id, maxValue) { // triggered by ontouchstart
	if (scrollingDetected == true) { // cancel if touch is start of scroll
		return;
	}
    holdTimer = setTimeout(function() {
		incrementRepeat = setInterval(function() {
			incrementWithLeadingZeros(id, 'down', maxValue);
		},100); // repeat speed
    },500); // touch is considered a hold after this delay
}
function tapIncrementDown(id, maxValue) { // triggered by ontouchend
	if ( typeof(holdTimer) != 'undefined' ) { // only execute if holdTimer has been defined by an ontouchstart or an error will occur (it always should be, because there can't be an ontouchend without an ontouchstart, but just to be safe)
		clearTimeout(holdTimer); // cancel touch/hold if it hasn't started incrementing yet
	}
	if ( typeof(incrementRepeat) != 'undefined' ) { // only execute if incrementRepeat has been defined by a hold or an error will occur
		clearInterval(incrementRepeat); // cancel touch/hold if it has started incrementing
	}
	if (scrollingDetected == true) { // cancel if touch is start of scroll
		return;
	}
	incrementWithLeadingZeros(id, 'down', maxValue);
}


window.addEventListener("scroll", function() {
	if ( $(window).scrollTop() ) {
		$('.back-to-top').addClass('show');
	} else {
		$('.back-to-top').removeClass('show');
	}
});
function backToTop() {
	if (scrollingDetected == true) { // cancel if touch is start of scroll
		return;
	}
	$('html, body').animate({scrollTop: 0}, "fast");
}
function openInBrowser(url) {
	if (scrollingDetected == true) { // cancel if touch is start of scroll
		return;
	}
	window.webkit.messageHandlers.swiftJSBridge.postMessage(url)
}
function reviewApp() {
	if (scrollingDetected == true) { // cancel if touch is start of scroll
		return;
	}
	window.webkit.messageHandlers.swiftJSBridge.postMessage("review app")
}


// copy results to clipboard
//
function copyToClipboard() {
	var eventDays;
	var eventHours;
	var eventMinutes;
	var targetHours;
	var targetMinutes;
	var targetSeconds;
	var intervalHours;
	var intervalMinutes;
	var intervalSeconds;
	var frameRate;
	var cameraRes;
	var clipboardText;

	// mode: shutter
	if (localStorage.optionsVariable == 'Shutter interval') {
		eventDays = document.getElementById('input-event-days-interval-mode').value;
		eventHours = document.getElementById('input-event-hours-interval-mode').value;
		eventMinutes = document.getElementById('input-event-minutes-interval-mode').value;
		targetHours = document.getElementById('input-target-hours-interval-mode').value;
		targetMinutes = document.getElementById('input-target-minutes-interval-mode').value;
		targetSeconds = document.getElementById('input-target-seconds-interval-mode').value;
		frameRate = document.getElementById('input-frame-rate').value;
		cameraRes = document.getElementById('input-camera-res').value;

		if (+outputHours + +outputMinutes + +outputSeconds) {

			if (outputHours > 0) {
				clipboardText = '*Shutter interval: ' + outputHours + 'h ' + outputMinutes + 'm ' + outputSeconds.toFixed(2) + 's\n';
			}
			else if (outputMinutes > 0) {
				clipboardText = '*Shutter interval: ' + outputMinutes + 'm ' + outputSeconds.toFixed(2) + 's\n';
			}
			else {
				clipboardText = '*Shutter interval: ' + outputSeconds.toFixed(2) + 's\n';
			}

			if (eventDays > 0) {
				clipboardText += 'Event duration: ' + parseInt(eventDays, 10) + 'd ' + parseInt(eventHours, 10) + 'h ' + parseInt(eventMinutes, 10) + 'm\n';
			}
			else if (eventHours > 0) {
				clipboardText += 'Event duration: ' + parseInt(eventHours, 10) + 'h ' + parseInt(eventMinutes, 10) + 'm\n';			}
			else {
				clipboardText += 'Event duration: ' + parseInt(eventMinutes, 10) + 'm\n';
			}

			if (targetHours > 0) {
				clipboardText += 'Target duration: ' + parseInt(targetHours, 10) + 'h ' + parseInt(targetMinutes, 10) + 'm ' + parseInt(targetSeconds, 10) + 's\n';
			}
			else if (targetMinutes > 0) {
				clipboardText += 'Target duration: ' + parseInt(targetMinutes, 10) + 'm ' + parseInt(targetSeconds, 10) + 's\n';
			}
			else {
				clipboardText += 'Target duration: ' + parseInt(targetSeconds, 10) + 's\n';
			}

			clipboardText += 'Frame rate: ' + frameRate + ' fps\n';
			if (cameraRes) {
				clipboardText += 'Camera res: ' + cameraRes + ' megapixels\n';
			}
			clipboardText += 'Exposures: ' + outputFrames.toFixed(0) + ' frames\n';
			clipboardText += 'Playback speed: ' + outputSpeed.toFixed(1) + 'x\n';
			if (outputStorageRAW) {
				if (outputStorageRAW < 1) {
					clipboardText += 'Data (RAW): <1 GB\n';
				}
				else {
					clipboardText += 'Data (RAW): ~' + outputStorageRAW.toFixed(0) + ' GB\n';
				}
				if (outputStorageJPG < 1) {
					clipboardText += 'Data (JPG): <1 GB\n';
				}
				else {
					clipboardText += 'Data (JPG): ~' + outputStorageJPG.toFixed(0) + ' GB\n';
				}
			}
		}
	}

	// mode: event
	else if (localStorage.optionsVariable == 'Event duration') {
		intervalHours = document.getElementById('input-interval-hours-event-mode').value;
		intervalMinutes = document.getElementById('input-interval-minutes-event-mode').value;
		intervalSeconds = document.getElementById('input-interval-seconds-event-mode').value;
		targetHours = document.getElementById('input-target-hours-event-mode').value;
		targetMinutes = document.getElementById('input-target-minutes-event-mode').value;
		targetSeconds = document.getElementById('input-target-seconds-event-mode').value;
		frameRate = document.getElementById('input-frame-rate').value;
		cameraRes = document.getElementById('input-camera-res').value;

		if (+outputDays + +outputHours + +outputMinutes + +outputSeconds) {

			if (outputDays > 0) {
				clipboardText = '*Event duration: ' + outputDays + 'd ' + outputHours + 'h ' + outputMinutes + 'm ' + outputSeconds.toFixed(2) + 's\n';
			}
			else if (outputHours > 0) {
				clipboardText = '*Event duration: ' + outputHours + 'h ' + outputMinutes + 'm ' + outputSeconds.toFixed(2) + 's\n';
			}
			else if (outputMinutes > 0) {
				clipboardText = '*Event duration: ' + outputMinutes + 'm ' + outputSeconds.toFixed(2) + 's\n';
			}
			else {
				clipboardText = '*Event duration: ' + outputSeconds.toFixed(2) + 's\n';
			}

			if (intervalHours > 0) {
				clipboardText += 'Shutter interval: ' + parseInt(intervalHours, 10) + 'h ' + parseInt(intervalMinutes, 10) + 'm ' + parseInt(intervalSeconds, 10) + 's\n';
			}
			else if (intervalMinutes > 0) {
				clipboardText += 'Shutter interval: ' + parseInt(intervalMinutes, 10) + 'm ' + parseInt(intervalSeconds, 10) + 's\n';
			}
			else {
				clipboardText += 'Shutter interval: ' + parseInt(intervalSeconds, 10) + 's\n';
			}

			if (targetHours > 0) {
				clipboardText += 'Target duration: ' + parseInt(targetHours, 10) + 'h ' + parseInt(targetMinutes, 10) + 'm ' + parseInt(targetSeconds, 10) + 's\n';
			}
			else if (targetMinutes > 0) {
				clipboardText += 'Target duration: ' + parseInt(targetMinutes, 10) + 'm ' + parseInt(targetSeconds, 10) + 's\n';
			}
			else {
				clipboardText += 'Target duration: ' + parseInt(targetSeconds, 10) + 's\n';
			}

			clipboardText += 'Frame rate: ' + frameRate + ' fps\n';
			if (cameraRes) {
				clipboardText += 'Camera res: ' + cameraRes + ' megapixels\n';
			}
			clipboardText += 'Exposures: ' + outputFrames.toFixed(0) + ' frames\n';
			clipboardText += 'Playback speed: ' + outputSpeed.toFixed(1) + 'x\n';
			if (outputStorageRAW) {
				if (outputStorageRAW < 1) {
					clipboardText += 'Data (RAW): <1 GB\n';
				}
				else {
					clipboardText += 'Data (RAW): ~' + outputStorageRAW.toFixed(0) + ' GB\n';
				}
				if (outputStorageJPG < 1) {
					clipboardText += 'Data (JPG): <1 GB\n';
				}
				else {
					clipboardText += 'Data (JPG): ~' + outputStorageJPG.toFixed(0) + ' GB\n';
				}
			}
		}
	}

	// mode: target
	else if (localStorage.optionsVariable == 'Target duration') {
		eventDays = document.getElementById('input-event-days-target-mode').value;
		eventHours = document.getElementById('input-event-hours-target-mode').value;
		eventMinutes = document.getElementById('input-event-minutes-target-mode').value;
		intervalHours = document.getElementById('input-interval-hours-target-mode').value;
		intervalMinutes = document.getElementById('input-interval-minutes-target-mode').value;
		intervalSeconds = document.getElementById('input-interval-seconds-target-mode').value;
		frameRate = document.getElementById('input-frame-rate').value;
		cameraRes = document.getElementById('input-camera-res').value;

		if (+outputHours + +outputMinutes + +outputSeconds) {

			if (outputHours > 0) {
				clipboardText = '*Target duration: ' + outputHours + 'h ' + outputMinutes + 'm ' + outputSeconds.toFixed(2) + 's\n';
			}
			else if (outputMinutes > 0) {
				clipboardText = '*Target duration: ' + outputMinutes + 'm ' + outputSeconds.toFixed(2) + 's\n';
			}
			else {
				clipboardText = '*Target duration: ' + outputSeconds.toFixed(2) + 's\n';
			}

			if (eventDays > 0) {
				clipboardText += 'Event duration: ' + parseInt(eventDays, 10) + 'd ' + parseInt(eventHours, 10) + 'h ' + parseInt(eventMinutes, 10) + 'm\n';
			}
			else if (eventHours > 0) {
				clipboardText += 'Event duration: ' + parseInt(eventHours, 10) + 'h ' + parseInt(eventMinutes, 10) + 'm\n';				}
			else {
				clipboardText += 'Event duration: ' + parseInt(eventMinutes, 10) + 'm\n';
			}

			if (intervalHours > 0) {
				clipboardText += 'Shutter interval: ' + parseInt(intervalHours, 10) + 'h ' + parseInt(intervalMinutes, 10) + 'm ' + parseInt(intervalSeconds, 10) + 's\n';
			}
			else if (intervalMinutes > 0) {
				clipboardText += 'Shutter interval: ' + parseInt(intervalMinutes, 10) + 'm ' + parseInt(intervalSeconds, 10) + 's\n';
			}
			else {
				clipboardText += 'Shutter interval: ' + parseInt(intervalSeconds, 10) + 's\n';
			}

			clipboardText += 'Frame rate: ' + frameRate + ' fps\n';
			if (cameraRes) {
				clipboardText += 'Camera res: ' + cameraRes + ' megapixels\n';
			}
			clipboardText += 'Exposures: ' + outputFrames.toFixed(0) + ' frames\n';
			clipboardText += 'Playback speed: ' + outputSpeed.toFixed(1) + 'x\n';
			if (outputStorageRAW) {
				if (outputStorageRAW < 1) {
					clipboardText += 'Data (RAW): <1 GB\n';
				}
				else {
					clipboardText += 'Data (RAW): ~' + outputStorageRAW.toFixed(0) + ' GB\n';
				}
				if (outputStorageJPG < 1) {
					clipboardText += 'Data (JPG): <1 GB\n';
				}
				else {
					clipboardText += 'Data (JPG): ~' + outputStorageJPG.toFixed(0) + ' GB\n';
				}
			}
		}
	}
	
	if (clipboardText) {
		navigator.clipboard.writeText(clipboardText);
		$('div#copy-button').html('<span class="clipboard-icon clipboard-icon-copied">&#xf0ea;</span> Copied!');
	}
	else {
		$('div#copy-button').html('<span class="clipboard-icon">&#xf0ea;</span> Copy Results');
	}
}
