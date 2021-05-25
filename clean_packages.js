fs = require('fs');
filename='./node_modules/node-notifier/vendor/mac.noindex/terminal-notifier.app/Contents/Resources/Terminal.icns';
if (fs.existsSync(filename)) {
	fs.writeFile(filename, '', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	});
}
