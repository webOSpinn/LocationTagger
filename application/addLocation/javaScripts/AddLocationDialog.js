enyo.kind({
	name: "AddLocationDialog",
	kind: enyo.ModalDialog,
	className: "enyo-popup enyo-modaldialog addLocationDialog",
	layoutKind: "VFlexLayout",
	contentHeight:"100%", height:"90%", style: "max-height: 530px;",
	events: {
		onSave: "",
		onCancel: "",
		onUpdateCoordinates: ""
	},
	components: [
		{kind: "Scroller", name:"theScroller", flex: 1, autoHorizontal: false, horizontal: false,
			components: [
				{kind: enyo.HFlexBox,
					components: [
						{kind: "RowGroup", caption: "Lat, Lon:", flex: 2, components: [
							{name: "latLon", kind: "Input", hint: "", disabled: true}
						]},
						{kind: enyo.VFlexBox, pack: "center", 
							components: [
								{
									name: "btnUpdate",
									kind: "Spinn.ActivityToolButton",
									onclick: "btnUpdate_Click"
								}
							]
						}
					]
				},
				{kind: "DividerDrawer", name: "detailsDrawer", caption: "GPS Details:", open: false, components: [
					{name: "details", allowHtml: true, flex: 1, style: "padding: 12px"}
				]},
				{kind: "RowGroup", caption: "Name:", components: [
					{name: "name", kind: "Input", hint:"Tap Here To Enter a Name"}
				]},
				{kind: "RowGroup", caption: "Category:", components: [
					{name: "category", kind: "Input", hint:"Tap Here To Enter a Category"}
				]},
				{kind: "RowGroup", caption: "Description:", components: [
					{name: "description", kind: "RichText", hint:"Tap Here To Enter a Description", richContent: "false", maxTextHeight: "8", flex: 1}
				]},
		]},
		{kind: "Spinn.AffirmDeny", affirmCaption: "Save", onAffirm: "btnSave_Click", denyCaption: "Cancel", onDeny: "btnCancel_Click" }
	],
	constructor: function () {
		this.inherited(arguments);
		this.mostAccurateLock = null;
	},
	openAtCenter: function () {
		this.inherited(arguments);
		
		this.$.detailsDrawer.setOpen(false);
		this.$.theScroller.scrollTo(0,0);
		this.clearFields();
		this.mostAccurateLock = null;
	},
	btnUpdate_Click: function(inSender, inEvent) {
		//Clear the fields before getting new value
		this.$.latLon.setValue("");
		this.$.details.setContent("");
		this.doUpdateCoordinates();
	},
	btnSave_Click: function (inSender, inEvent) {
		this.doSave();
		//Closing will be handled by AddLocationController
		//this.close()
	},
	btnCancel_Click: function (inSender, inEvent) {
		this.doClose();
		this.close();
	},
	setPosition: function(gps) {
		this.$.btnUpdate.stopAnimation();
		
		this.$.latLon.setValue(gps.latitude +", " + gps.longitude);
		this.$.details.setContent(LocTaggerUtils.gpsToRichTXT(gps));
	},
	setError: function(err) {
		this.$.btnUpdate.stopAnimation();
		this.$.latLon.setValue("Error retrieving GPS.");
		var message = "";
		switch(err.errorCode)
		{
			case 1:
				message = "<b>Error Code:</b> " + err.errorCode + "<br/>"
					+ "<b>Message:</b> Timeout<br/>";
			break;
			case 2:
				message = "<b>Error Code:</b> " + err.errorCode + "<br/>"
					+ "<b>Message:</b> Position Unavailable<br/>";
			break;
			case 3:
				message = "<b>Error Code:</b> " + err.errorCode + "<br/>"
					+ "<b>Message:</b> Unknown<br/>";
			break;
			//No 4
			case 5:
				message = "<b>Error Code:</b> " + err.errorCode + "<br/>"
					+ "<b>Message:</b> LocationServiceOFF - No Location source available. Both Google and GPS are off.<br/>";
			break;
			case 6:
				message = "<b>Error Code:</b> " + err.errorCode + "<br/>"
					+ "<b>Message:</b> Permission Denied - Please accepte the terms of use for the Google Location Service, or turn the Google Service on.<br/>";
			break;
			case 7:
				message = "<b>Error Code:</b> " + err.errorCode + "<br/>"
					+ "<b>Message:</b> The application already has a pending message.<br/>";
			break;
			case 8:
				message = "<b>Error Code:</b> " + err.errorCode + "<br/>"
					+ "<b>Message:</b> The application has been temporarily blacklisted.<br/>";
			break;
			default:
				message = "There has been an unknown error.";
			break;
		}
		
		this.$.details.setContent(message);
	},
	clearFields: function() {
		this.$.latLon.setValue("");
		this.$.name.setValue("");
		this.$.category.setValue("");
		this.$.description.setValue("");
		this.$.details.setContent("");
	},
	getGpsName: function() {
		return this.$.name.getValue();
	},
	getGpsCategory: function() {
		return this.$.category.getValue();
	},
	getGpsDescription: function() {
		return this.$.description.getValue();
	}
});