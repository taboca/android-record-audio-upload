cordova create voiceturk com.taboca.voiceturk VoiceTurk
cd voiceturk
cordova plugin add cordova-plugin-audioinput
cordova plugin add cordova-plugin-file-transfer
rm -rf www
cp -r ../www .
cordova platform add android@5.0.0

