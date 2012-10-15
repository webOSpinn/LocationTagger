var ReadDirAssistant = function() {
}

ReadDirAssistant.prototype.run = function(future) {
	var fs = IMPORTS.require("fs");
	
	var path = this.controller.args.fullpath;
	var files = [];
	
	fs.readdir(path, function(err, data) {
		future.result = { error: err, files: data };
	});
}
