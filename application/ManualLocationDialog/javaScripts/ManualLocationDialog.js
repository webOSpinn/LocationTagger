enyo.kind({
	name: "ManualLocationDialog",
	kind: enyo.ModalDialog,
	className: "enyo-popup enyo-modaldialog manualLocationDialog",
	layoutKind: "VFlexLayout",
	contentHeight:"100%", height:"90%", style: "max-height: 530px;",
	events: {
		onSave: "",
		onCancel: ""
	},
	components: [
		{kind: "Spinn.Utils", name: "Utils"},
		{kind: "Spinn.InfoDialog", name:"info", onOk:"oKHandler", caption:"", message:""},
		{kind: "Scroller", name:"theScroller", flex: 1, autoHorizontal: false, horizontal: false,
			components: [
				{kind: "RowGroup", caption: "Name:", components: [
					{name: "name", kind: "Input", hint:"Enter a Name"}
				]},
				{kind: "RowGroup", caption: "Category:", components: [
					{name: "category", kind: "Input", hint:"Enter a Category"}
				]},
				{kind: "RowGroup", caption: "Latitude:", components: [
					{name: "latitude", kind: "Input", hint:"Enter the Latitude"}
				]},
				{kind: "RowGroup", caption: "Longitude:", components: [
					{name: "longitude", kind: "Input", hint:"Enter the Longitude"}
				]},
				{kind: "DividerDrawer", name: "detailsDrawer", caption: "Additional Details:", open: false, components: [
					{kind: "RowGroup", caption: "Altitude (Meters):", components: [
						{name: "altitude", kind: "Input", hint:"Enter the Altitude"}
					]},
					{kind: "RowGroup", caption: "Heading:", components: [
						{name: "heading", kind: "Input", hint:"Enter the Heading"}
					]},
					{kind: "RowGroup", caption: "Horiz. Accuracy (Meters):", components: [
						{name: "horizAccuracy", kind: "Input", hint:"Enter the Horizontal Accuracy"}
					]},
					{kind: "RowGroup", caption: "Velocity (Meters/Second):", components: [
						{name: "velocity", kind: "Input", hint:"Enter the Velocity"}
					]},
					{kind: "RowGroup", caption: "Vert. Accuracy (Meters):", components: [
						{name: "vertAccuracy", kind: "Input", hint:"Enter the Vertical Accuracy"}
					]},
					{kind: "RowGroup", caption: "Description:", components: [
						{name: "description", kind: "RichText", hint:"Enter a Description", richContent: "false", maxTextHeight: "8", flex: 1}
					]},
				]}
		]},
		{kind: "Spinn.AffirmDeny", affirmCaption: "Save", onAffirm: "btnSave_Click", denyCaption: "Cancel", onDeny: "btnCancel_Click" }
	],
	constructor: function () {
		this.inherited(arguments);
	},
	openAtCenter: function () {
		this.inherited(arguments);
		
		this.$.detailsDrawer.setOpen(false);
		this.$.theScroller.scrollTo(0,0);
		this.clearFields();
	},
	btnSave_Click: function (inSender, inEvent) {
		if(this.validateFields()){
			var today = new Date();
			var gps = { 
				name: this.$.name.getValue(),
				category: this.$.category.getValue(),
				description: this.$.description.getValue(),
				altitude: this.populateUnknownValue(this.$.altitude),
				heading: this.populateUnknownValue(this.$.heading),
				horizAccuracy: this.populateUnknownValue(this.$.horizAccuracy),
				latitude: this.$.latitude.getValue(),
				longitude: this.$.longitude.getValue(),
				timestamp: today.getTime(),
				velocity: this.populateUnknownValue(this.$.velocity),
				vertAccuracy: this.populateUnknownValue(this.$.vertAccuracy)
			}
			
			this.doSave({gps: gps});
			this.close()
		}
	},
	btnCancel_Click: function (inSender, inEvent) {
		this.doClose();
		this.close();
	},
	clearFields: function() {
		this.$.name.setValue("");
		this.$.category.setValue("");
		this.$.latitude.setValue("");
		this.$.longitude.setValue("");
		this.$.altitude.setValue("");
		this.$.heading.setValue("");
		this.$.horizAccuracy.setValue("");
		this.$.velocity.setValue("");
		this.$.vertAccuracy.setValue("");
		this.$.description.setValue("");
	},
	validateFields: function() {
		var temp = "";
		
		//Check latitude
		temp = enyo.string.trim(this.$.latitude.getValue());
		if(temp == "") {
			this.handleInvalidInput(this.$.latitude, "Please enter the latitude.");
			return false;
		} else if(this.$.Utils.isFloat(temp) == false) {
			this.handleInvalidInput(this.$.latitude, "Latitude must be a number.");
			return false;
		} else if (!(temp >= -90 && temp <= 90)) {
			this.handleInvalidInput(this.$.latitude, "Latitude must be between -90 and 90.");
			return false;
		}
		
		//Check longitude
		temp = enyo.string.trim(this.$.longitude.getValue());
		if(temp == "") {
			this.handleInvalidInput(this.$.longitude, "Please enter the longitude.");
			return false;
		} else if(this.$.Utils.isFloat(temp) == false) {
			this.handleInvalidInput(this.$.longitude, "Longitude must be a number.");
			return false;
		} else if (!(temp >= -180 && temp <= 180)) {
			this.handleInvalidInput(this.$.longitude, "Longitude must be between -180 and 180.");
			return false;
		}
		
		//Check altitude
		temp = enyo.string.trim(this.$.altitude.getValue());
		//Allow it to be blank
		if(temp != "") {
			if(this.$.Utils.isFloat(temp) == false) {
				this.handleInvalidInput(this.$.altitude, "Altitude must be a number.");
				return false;
			}
		}
		
		//Check heading
		temp = enyo.string.trim(this.$.heading.getValue());
		//Allow to be blank
		if(temp != "") {
			if(this.$.Utils.isFloat(temp) == false) {
				this.handleInvalidInput(this.$.heading, "Heading must be a number.");
				return false;
			} else if (!(temp >= 0 && temp <= 360)) {
				this.handleInvalidInput(this.$.heading, "Heading must be between 0 and 360.");
				return false;
			}
		}
		
		//Check horizontal accuracy
		temp = enyo.string.trim(this.$.horizAccuracy.getValue());
		//Allow to be blank
		if(temp != "") {
			if(this.$.Utils.isFloat(temp) == false) {
				this.handleInvalidInput(this.$.horizAccuracy, "Horizontal accuracy must be a number.");
				return false;
			} else if(temp < 0) {
				this.handleInvalidInput(this.$.horizAccuracy, "Horizontal accuracy must be greater than or equal to 0.");
				return false;
			}
		}
		
		//Check Velocity
		temp = enyo.string.trim(this.$.velocity.getValue());
		//Allow to be blank
		if(temp != "") {
			if(this.$.Utils.isFloat(temp) == false) {
				this.handleInvalidInput(this.$.velocity, "Velocity must be a number.");
				return false;
			} else if(temp < 0) {
				this.handleInvalidInput(this.$.velocity, "Velocity must be greater than or equal to 0.");
				return false;
			}
		}
		
		//Check Vertical Accuracy
		temp = enyo.string.trim(this.$.vertAccuracy.getValue());
		//Allow to be blank
		if(temp != "") {
			if(this.$.Utils.isFloat(temp) == false) {
				this.handleInvalidInput(this.$.vertAccuracy, "Vertical accuracy must be a number.");
				return false;
			} else if(temp < 0) {
				this.handleInvalidInput(this.$.vertAccuracy, "Vertical accuracy must be greater than or equal to 0.");
				return false;
			}
		}
		
		//If we have made it this far eveything must be fine
		return true;
	},
	handleInvalidInput: function(input, message) {
		this.input = input;
		this.$.info.openAtCenter();
		this.$.info.setMessage(message);
	},
	oKHandler: function (inSender, inEvent) {
		if(this.$.Utils.exists(this.input)) {
			this.input.forceFocusEnableKeyboard();
			this.input.forceSelect();
		}
	},
	populateUnknownValue: function(input) {
		return (enyo.string.trim(input.getValue()) != "" ? enyo.string.trim(input.getValue()) : -1)
	}
});