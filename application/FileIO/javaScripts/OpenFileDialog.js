enyo.kind({
	name: "OpenFileDialog",
	kind: enyo.ModalDialog,
	className: "enyo-popup enyo-modaldialog openFileDialog",
	caption: "Open File",
	layoutKind: "VFlexLayout",
	contentHeight:"98%", height:"90%", style: "max-height: 530px;",
	events: {
		onSubmit: "",
		onCancel: ""
	},
	published: {
		files: []
	},
	components: [
		{kind: "Spinn.Utils" name: "Utils"},
		{kind: "Group", caption: "", flex: 1, contentFit: true, layoutKind: "VFlexLayout", components: [
			{kind: "Scroller", name:"fileListScroller", flex: 1, autoHorizontal: false, horizontal: false,
				components: [
					{name: "fileList", className: "file-list", kind: "VirtualRepeater", onSetupRow: "getFileItem", onclick: "fileListItemClick",
						components: [
							{kind:"Item", name: "fileItem"}
						]
					}
				]
			}
		]},
		{kind: "Button",className: "enyo-button-negative", caption: "Cancel", onclick: "resetHandler"}
	],
	create: function() {
		this.inherited(arguments);
	},
	filesChanged: function() {
		this.renderFiles();
	},
	renderFiles: function (results) {
		//Scroll the file list back to the top
		this.$.fileListScroller.scrollTo(0,0);
		this.$.fileList.render();
	},
	getFileItem: function(inSender, inIndex) {
		if(this.$.Utils.exists(this.getFiles())) {
			var r = this.getFiles()[inIndex];
			if (r) {
				this.$.fileItem.setContent(r);
				return true;
			}
		}
	},
	fileListItemClick: function(inSender, inEvent) {
		//Only trigger if user has clicked on an item
		if(this.$.Utils.exists(inEvent.rowIndex)) {
			var r = this.getFiles()[inEvent.rowIndex];
			if (r) {
				this.doSubmit({ filename: r });
				this.close();
			}
		}
	},
	resetHandler: function() {
		this.doCancel();
		this.close();
	}
});
