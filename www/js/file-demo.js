
/* uploadFile

*/

var gFileURL = null;

function startUploadFile() {

  var fileURL = gFileURL;

  var options = new FileUploadOptions();
  options.fileKey = "file";
  options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
  options.mimeType = "audio/x-wav";

//  var params = {};
//  params.value1 = "test";
//  params.value2 = "param";

  options.chunkedMode = false; // Transfer picture to server
  options.headers = {
       Connection: "close"
   }

//  options.params = params;

  var win = function (r) {
      navigator.notification.alert("Code = " + r.responseCode);
      navigator.notification.alert("Response = " + r.response);
      navigator.notification.alert("Sent = " + r.bytesSent);
  }

  var fail = function (error) {
      navigator.notification.alert("An error has occurred: Code = " + error.code);
      navigator.notification.alert("upload error source " + error.source);
      navigator.notification.alert("upload error target " + error.target);
  }

  var ft = new FileTransfer();
  ft.upload(fileURL, encodeURI("http://192.168.2.2:3000/"), win, fail, options);
  ft.onprogress = function(progressEvent) {
      if (progressEvent.lengthComputable) {
          //navigator.notification.alert(progressEvent.loaded / progressEvent.total);
      } else {
      }
  };
}

/*
 This demo shows how to collect the raw microphone data, encode it into WAV format and then save the resulting blob
 to a file using cordova-plugin-file. No Web Audio API support is needed for this to work.
 */

// Capture configuration object
var captureCfg = {};

// Audio Buffer
var audioDataBuffer = [];

// Timers
var timerInterVal, timerGenerateSimulatedData;

var objectURL = null;

// Info/Debug
var totalReceivedData = 0;

// URL shim
window.URL = window.URL || window.webkitURL;

/**
 * Called continuously while AudioInput capture is running.
 */
function onAudioInputCapture(evt) {
    try {
        if (evt && evt.data) {
            // Increase the debug counter for received data
            totalReceivedData += evt.data.length;

            // Add the chunk to the buffer
            audioDataBuffer = audioDataBuffer.concat(evt.data);
        }
    }
    catch (ex) {
        alert("onAudioInputCapture ex: " + ex);
    }
}


/**
 * Called when a plugin error happens.
 */
function onAudioInputError(error) {
    alert("onAudioInputError event recieved: " + JSON.stringify(error));
}


/**
 *
 */
var startCapture = function () {
    try {
        if (window.audioinput && !audioinput.isCapturing()) {
            var audioSourceElement = document.getElementById("audioSource"),
                audioSourceType = audioSourceElement.options[audioSourceElement.selectedIndex].value;

            captureCfg = {
                sampleRate: parseInt(document.getElementById('sampleRate').value),
                bufferSize: parseInt(document.getElementById('bufferSize').value),
                channels: parseInt(document.querySelector('input[name="channels"]:checked').value),
                format: document.querySelector('input[name="format"]:checked').value,
                audioSourceType: parseInt(audioSourceType)
            };

            audioinput.start(captureCfg);
            consoleMessage("Microphone input started!");

            // Throw previously created audio
            document.getElementById("recording-list").innerHTML = "";
            if (objectURL) {
                URL.revokeObjectURL(objectURL);
            }

            // Start the Interval that outputs time and debug data while capturing
            //
            timerInterVal = setInterval(function () {
                if (audioinput.isCapturing()) {
                    document.getElementById("infoTimer").innerHTML = "" +
                        new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") +
                        "|Received:" + totalReceivedData;
                }
            }, 1000);

            disableStartButton();
        }
    }
    catch (e) {
        alert("startCapture exception: " + e);
    }
};


/**
 *
 */
var stopCapture = function () {
    try {
        if (window.audioinput && audioinput.isCapturing()) {

            if (timerInterVal) {
                clearInterval(timerInterVal);
            }

            if (isMobile.any() && window.audioinput) {
                audioinput.stop();
            }
            else {
                clearInterval(timerGenerateSimulatedData);
            }

            totalReceivedData = 0;
            document.getElementById("infoTimer").innerHTML = "";

            consoleMessage("Encoding WAV...");
            var encoder = new WavAudioEncoder(captureCfg.sampleRate, captureCfg.channels);
            encoder.encode([audioDataBuffer]);

            consoleMessage("Encoding WAV finished");

            var blob = encoder.finish("audio/wav");
            consoleMessage("BLOB created");

            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
                var fileName = new Date().YYYYMMDDHHMMSS() + ".wav";
                dir.getFile(fileName, {create: true}, function (file) {
                    file.createWriter(function (fileWriter) {
                        fileWriter.write(blob);

                        gFileURL = file.toURL();

                        // Add an URL for the file
                        var a = document.createElement('a');
                        var linkText = document.createTextNode(file.toURL());
                        a.appendChild(linkText);
                        a.title = file.toURL();
                        a.href = file.toURL();
                        a.target = '_blank';
                        document.getElementById("recording-list").appendChild(a);

                        consoleMessage("File created!");
                    }, function () {
                        alert("FileWriter error!");
                    });
                });
            });

            disableStopButton();
        }
    }
    catch (e) {
        alert("stopCapture exception: " + e);
    }
};


/**
 *
 */
var initUIEvents = function () {
  document.getElementById("startCapture").addEventListener("click", startCapture);
  document.getElementById("pushServer").addEventListener("click", startUploadFile);
  document.getElementById("stopCapture").addEventListener("click", stopCapture);
};


/**
 * When cordova fires the deviceready event, we initialize everything needed for audio input.
 */
var onDeviceReady = function () {

    if (window.cordova && window.cordova.file && window.audioinput) {

        initUIEvents();

        consoleMessage("Use 'Start Capture' to begin...");

        // Subscribe to audioinput events
        //
        window.addEventListener('audioinput', onAudioInputCapture, false);
        window.addEventListener('audioinputerror', onAudioInputError, false);
    }
    else {
        consoleMessage("Missing: cordova-plugin-file or cordova-plugin-audioinput!");
        disableAllButtons();
    }
};

// Make it possible to run the demo on desktop
if (!window.cordova) {
    // Make it possible to run the demo on desktop
    navigator.notification.alert("Running on desktop!");
    onDeviceReady();
}
else {
    // For Cordova apps
    document.addEventListener('deviceready', onDeviceReady, false);
}
