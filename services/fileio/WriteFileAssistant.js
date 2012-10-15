var WriteFileAssistant = function() {
}

WriteFileAssistant.prototype.run = function(future) {
	var fs = IMPORTS.require("fs");
	
	var path = this.controller.args.fullpath;
	var content = this.controller.args.content;
	
	fs.writeFile(path, content, 'utf8', 
		function(err) {
			future.result = { 
				path: path,
				error: err
			}; 
		}
	);
}
