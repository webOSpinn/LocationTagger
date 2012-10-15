var ReadFileAssistant = function() {
}

ReadFileAssistant.prototype.run = function(future) {
	var fs = IMPORTS.require("fs");
	
	var path = this.controller.args.fullpath;
	
	fs.readFile(path, 'utf8', 
		function(err, data) { 
			future.result = {
				error: err,
				path: path,
				content: data
			}; 
		}
	);
}
