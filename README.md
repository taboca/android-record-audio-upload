## Trademarks

Remove the name voiceturk and enjoy! 

## Requirements

* Get your cordova environment working
* see install.sh

### Vendor projects

* This uses https://github.com/edimuj/cordova-plugin-audioinput 
* This uses http://ngcordova.com/docs/plugins/fileTransfer/

## Hacking

Check for the lines, and replace your server. 
: 
```
  ft.upload(fileURL, encodeURI("http://192.168.2.2:3000/"), win, fail, options);
```

## Receiving file from a server : 

* In node: https://github.com/taboca/node-audio-multipart-receive

## Building

From the project directory: 

```
cordova run android
```

## Learnings

* cordova plugin ls


