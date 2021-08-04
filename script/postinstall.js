/*
 * react-scripts depends on modules that depend on node-notifier. The problem is that the latter include Terminal.icns
 * for its Mac OS X notification native app, which is copyrighted by Apple. There has been an open issue since 2005
 * with no proper solution: https://github.com/mikaelbr/node-notifier/issues/71
 * We have therefore decided to remove that icon at install time.
 *
 * Errors in this script should be silently ignored in case that node-notifier suddenly decides to fix the problem.
 */
fs = require('fs');
filename='./node_modules/node-notifier/vendor/mac.noindex/terminal-notifier.app/Contents/Resources/Terminal.icns';
if (fs.existsSync(filename)) {
	fs.writeFile(filename, '', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	});
}
