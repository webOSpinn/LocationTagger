enyo.kind({
	name: "LocationDetails",
	kind: enyo.VFlexBox,
	components: [
		{kind: "LocTaggerUtils", name: "locTaggerUtils"},
		{kind: "RowGroup", caption: "Name:", components: [
			{name: "name", kind: "Input", hint:"Tap Here To Enter a Name", flex: 1}
		]},
		{kind: "RowGroup", caption: "Category:", components: [
			{name: "category", kind: "Input", hint:"Tap Here To Enter a Category", flex: 1}
		]},
		{kind: "RowGroup", caption: "Description:", components: [
			{name: "description", kind: "RichText", hint:"Tap Here To Enter a Description", richContent: "false", maxTextHeight: "8", flex: 1}
		]},
		{kind: "RowGroup", caption: "Details:", components: [
			{name: "details", allowHtml: true, flex: 1, style: "padding: 12px"}
		]}
	],
	constructor: function () {
		this.inherited(arguments);
		this.location = null;
		this.bound = {
			updateLocation: enyo.bind(this, this.updateLocation)
		}
	},
	updateLocation: function() {
		//Make sure there is an object to update
		if(Spinn.Utils.exists(this.location)) {
			//Only update if at least one of the values have been updated
			if((this.$.name.getValue() != this.location.name) 
				|| (this.$.category.getValue() != this.location.category) 
				|| (this.$.description.getValue() != this.location.description))
			{
				//Update only the three values that can be updated
				var loc = {
					name: this.$.name.getValue(),
					category: this.$.category.getValue(),
					description: this.$.description.getValue()
				}
				enyo.application.model.updateLocation(this.location.rowID, loc, enyo.application.model.bound.refreshItems);
			}
		}
	},
	setLocation: function (a) {
		var update = true;
		if(Spinn.Utils.exists(this.location)) {
			if(Spinn.Utils.exists(a)){
				if(a.rowID == this.location.rowID) {
					//Only update if we are setting the location to a new one
					update = false;
				}
			}
		}
		
		if(update) {
			this.updateLocation(a);
			this.location = a;
			this.locationChanged();
		}
	},
	getLocation: function () {
		return this.location;
	},
	locationChanged: function() {
		if(Spinn.Utils.exists(this.location)) {
			this.$.name.setValue(this.location.name);
			this.$.category.setValue(this.location.category);
			this.$.description.setValue(this.location.description);
			this.$.details.setContent(this.$.locTaggerUtils.gpsToRichTXT(this.location));
		}
		else
		{
			this.$.name.setValue("");
			this.$.category.setValue("");
			this.$.description.setValue("");
			this.$.details.setContent("");
		}
	}
});