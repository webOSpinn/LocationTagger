enyo.kind({
	name: "FileIO",
	kind: enyo.Control,
	published: {
		baseFileName: "Export",
		fileExtension: ".json",
		localDir: "/media/internal/"
	},
	filename: "",
	files: [],
	validfile: false,
	events: {
		onOpened: "",
		onCreated: "",
		onSaved: ""
	},
	components: [
		{
			name: "FileIO",
			kind: "enyo.PalmService",
			service: "palm://com.spinn.locationtagger.fileio.service/",
			subscribe: true,
			timeout: 10000
		},
		{kind: "Scrim", name:"scrim", layoutKind: "VFlexLayout", align:"center", pack:"center", components: [
			{kind: "SpinnerLarge"}
		]},
		{kind: "Spinn.InputDialog", name: "saveFileDialog", caption: "Save File", 
			affirmCaption: "Save", denyCaption: "Cancel",
			directions: "The filename will be changed to not contain any special characters.",
			inputHint: "Enter File Name.",
			onSubmit: "handleNewFile", onCancel: "handleCancelNewFile"},
		{kind: "OpenFileDialog", onSubmit: "readFile"}
	],
	createLocalDir: function() {
		this.$.FileIO.call({path: this.localDir}, {method:"makeDir", onResponse: function (e){ if(inResponse.errorCode) { console.log(enyo.json.stringify(inResponse, null, "\t")); } }});
	},	 
	createNew: function(inSender, inEvent) {
		this.$.saveFileDialog.openAtCenter();
		var d = new Date();
		this.$.saveFileDialog.setDefaultInput(this.baseFileName + "-" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
	},
	handleCancelNewFile: function(inSender, inResponse) { },
	handleNewFile: function(inSender, inResponse) {
		this.filename = inResponse.userInput;
		
		this.cleanFilename();
		
		this.filename = this.filename + this.fileExtension;
		this.doCreated({ error: null, content: "", filename: this.filename});
		this.validfile = true;
	},
	
	/*
	 * WRITING
	 */
	
	saveFile: function(inContent) {
		if(this.validfile && this.filename != "" && this.filename != this.fileExtension) {
			console.log("saving " + this.localDir + this.filename);
			this.createLocalDir();
			this.$.FileIO.call({fullpath: this.localDir + this.filename, content: inContent}, {method:"writefile", onResponse: "handleSaved"});
		}
	},
	
	handleSaved: function(inSender, inResponse) {
		if(!inResponse.errorCode) {
			if(inResponse.error) {
				console.log(inResponse.error);
				enyo.windows.addBannerMessage("Could not save " + this.filename, "{}");
			}
			else {
				enyo.windows.addBannerMessage("Export successful!", "{}");
			}
			
			this.doSaved({error: inResponse.error});
		}
		else {
			//This is a big error - the service doesn't exist
			console.log(enyo.json.stringify(inResponse, null, "\t"));
			enyo.windows.addBannerMessage("Service error saving file!", "{}");
		}
		
	},
	
	/*
	 * READING
	 */
	 
	openFile: function() {
		this.files = [];
		this.createLocalDir();
		this.$.FileIO.call({fullpath: this.localDir}, {method:"readdir", onResponse: "handleListFiles"});
	},
	
	handleListFiles: function(inSender, inResponse) {
		if(!inResponse.errorCode) {
			for(var i in inResponse.files) {
				//Filter out folders
				var temp = inResponse.files[i].split(".");
				//Filter out folders and files that don't have a matching file extension
				if(this.fileExtension.substring(1) == temp[temp.length - 1]) {
					this.files.push(inResponse.files[i]);
				}
			}
			
			this.$.openFileDialog.openAtCenter();
			this.$.openFileDialog.setFiles(this.files);
		}
		else {
			//This is a big error - the service doesn't exist
			console.log(enyo.json.stringify(inResponse, null, "\t"));
			enyo.windows.addBannerMessage("Service error reading folder!", "{}");
		}
	},
	
	readFile: function(inSender, inResponse) {
		this.validfile = false;
		this.$.spinnerLarge.show();
		this.$.scrim.show();
		
		this.filename = inResponse.filename;
		this.createLocalDir();
		this.$.FileIO.call({fullpath: this.localDir + this.filename}, {method:"readfile", onResponse: "handleReadFile"});
	},
	
	handleReadFile: function(inSender, inResponse) {
		this.$.spinnerLarge.hide();
		
		if(!inResponse.errorCode) {
			if(inResponse.error || inResponse.content == "") {
				enyo.windows.addBannerMessage(new enyo.g11n.Template("Could not load #{name}").evaluate({name: this.filename}), "{}");
				this.filename = "";
				this.validfile = false;
			}
			else {
				this.$.scrim.hide();
				this.validfile = true;
			}
			
			this.doOpened({ error: inResponse.error, content: inResponse.content, filename: inResponse.filename});
		}
		else {
			//This is a big error - the service doesn't exist
			console.log(enyo.json.stringify(inResponse, null, "\t"));
			enyo.windows.addBannerMessage("Service error reading file!", "{}");
		}
	},

	cleanFilename: function() {
		// èéêëęē®™þýÿùúûüűìíîïİıòóôõöøőœºω§πàáâãäåæªšşßσð†‡łžźżçć©¢nnµ ÈÉÊËĘĒÝŸÙÚÛÜŰÌÍÎÏİIÒÓÔÕÖØŐŒºΩΠÀÁÂÃÄÅÆŠŞΣÐĞŁŽŹŻÇĆÑŃ
	
		var accents = "\u00E8\u00E9\u00EA\u00EB\u0119\u0113"
			+ "\u00AE\u2122\u00FE\u00FD\u00FF\u00F9"
			+ "\u00FA\u00FB\u00FC\u0171\u00EC\u00ED"
			+ "\u00EE\u00EF\u0130\u0131\u00F2\u00F3"
			+ "\u00F4\u00F5\u00F6\u00F8\u0151\u0153"
			+ "\u00BA\u03C9\u00A7\u03C0\u00E0\u00E1"
			+ "\u00E2\u00E3\u00E4\u00E5\u00E6\u00AA"
			+ "\u0161\u015F\u00DF\u03C3\u00F0\u2020"
			+ "\u2021\u0142\u017E\u017A\u017C\u00E7"
			+ "\u0107\u00A9\u00A2\u006E\u006E\u00B5"
			+ "\u0020\u00C8\u00C9\u00CA\u00CB\u0118"
			+ "\u0112\u00DD\u0178\u00D9\u00DA\u00DB"
			+ "\u00DC\u0170\u00CC\u00CD\u00CE\u00CF"
			+ "\u0130\u0049\u00D2\u00D3\u00D4\u00D5"
			+ "\u00D6\u00D8\u0150\u0152\u00BA\u03A9"
			+ "\u03A0\u00C0\u00C1\u00C2\u00C3\u00C4"
			+ "\u00C5\u00C6\u0160\u015E\u03A3"
			+ "\u00D0\u011E\u0141\u017D\u0179\u017B"
			+ "\u00C7\u0106\u00D1\u0143\u039C";
	
		var without = "eeeeeerttyyuuuuuiiiiiiooooooooooppaaaaaaaasssssfflzzzccccnnm"
			+ "EEEEEEYYUUUUUIIIIIIOOOOOOOOOOPAAAAAAASSSDGJZZZCCNNM";
	
		this.filename = this.filename.replace(/^\s+|\s+$/g, "") // trim leading and trailing spaces		
			.replace(/[_|\s]+/g, "-") // change all spaces and underscores to a hyphen
			.replace(new RegExp('[' + accents + ']', 'g'), function (c) { return without.charAt(accents.indexOf(c)); })
			.replace(/[^a-zA-Z0-9-]+/g, "") // remove all non-alphanumeric characters except the hyphen
			.replace(/[-]+/g, "-") // replace multiple instances of the hyphen with a single instance
			.replace(/^-+|-+$/g, ""); // trim leading and trailing hyphens
	},
	
	getFilename: function() {
		return this.filename;
	}
})
