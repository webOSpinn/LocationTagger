var MakeDirAssistant = function() {
}

MakeDirAssistant.prototype.run = function(future) {
	var fs = IMPORTS.require("fs");
	var p = IMPORTS.require("path");
	
	var path = this.controller.args.path;
	
	p.exists(path, function (exists) {
		if(exists == false) {
			fs.mkdirSync(path, 700);
		}
	});
}
