enyo.kind({
	name: "AddLocationController",
	kind: enyo.Control,
	published: {
		
	},
	events: {
		onSaveLocation: ""
	},
	components: [
		{kind: "Spinn.Utils", name: "Utils"},
		{
			name      : "getPos",
			kind      : "PalmService",
			service   : "palm://com.palm.location/",
			method    : "getCurrentPosition",
			onSuccess : "getPosSuccess",
			onFailure : "getPosFailure",
			subscribe : true
		},
		{kind: "AddLocationDialog", name: "addLocDialog",
			onSave:"saveHandler", onCancel:"cancelHandler", onUpdateCoordinates: "getPosition"},
		{kind: "Spinn.ConfirmationDialog", name:"confirmation", onYes:"yesHandler", onNo:"noHandler", caption: "Save Location",
			message:"This is not the most accurate point.  Would you like to save the more accurate point instead?"},
		{kind: "Spinn.InfoDialog", name:"info", onOk:"yesHandler", caption:"", 
			message:"The current point is in error.  The most accurate point will be saved instead."}
	],
	constructor: function () {
		this.inherited(arguments);
		this.gps = null;
		this.mostAccurateLock = null;
	},
	addLocation: function () {
		this.gps = null;
		this.mostAccurateLock = null;
		this.$.addLocDialog.openAtCenter();
	},
	saveHandler: function (inSender, inEvent) {
		if(this.$.Utils.exists(this.gps)){
			//Only close the dialog if there is a GPS point
			this.$.addLocDialog.close();
			//Check gps and mostAccurateLock - use timestamp to determine if they are the same
			if(this.gps.timestamp != this.mostAccurateLock.timestamp) {
				//If the current gps point is not the most accurate ask the user if they want to save the more accurate one instead
				if(this.gps.horizAccuracy > this.mostAccurateLock.horizAccuracy) {
					//console.log("The current point is not better ask to save other one.");
					this.$.confirmation.openAtCenter();
				}
				else {
					//console.log("Current point is better, save that.");
					this.save();
				}
			}
			else {
				//console.log("Points are the same, just save.");
				//They are the same, just save
				this.save();
			}
		}
		else if (this.$.Utils.exists(this.mostAccurateLock)) {
			//Current gps is in error but we have a most accurate lock
			this.$.addLocDialog.close();
			//console.log("Current point is in error.  Saving mostAccurateLock instead.");
			this.$.info.openAtCenter();
		}
	},
	cancelHandler: function (inSender, inEvent) { },
	yesHandler: function (inSender, inEvent) {
		this.gps = this.mostAccurateLock;
		this.save();
	},
	noHandler: function (inSender, inEvent) {
		this.save();
	},
	save: function () {
		this.gps.name = this.$.addLocDialog.getGpsName();
		this.gps.category = this.$.addLocDialog.getGpsCategory();
		this.gps.description = this.$.addLocDialog.getGpsDescription();
		this.doSaveLocation({gps: this.gps});
	},
	getPosition: function () {
		this.$.getPos.call({
			"accuracy"     : 1,
			"maximumAge"   : 0,
			"responseTime" : 3
		});
	},
	getPosSuccess : function(inSender, inResponse) {
		this.gps = { 
			altitude: inResponse.altitude,
			heading: inResponse.heading,
			horizAccuracy: inResponse.horizAccuracy,
			latitude: inResponse.latitude,
			longitude: inResponse.longitude,
			timestamp: inResponse.timestamp,
			velocity: inResponse.velocity,
			vertAccuracy: inResponse.vertAccuracy
		}
		
		//Make sure we always keep the most accurate location
		if(this.$.Utils.exists(this.mostAccurateLock)){
			//If the new location is at least as accurate update the most accurate
			if(this.gps.horizAccuracy <= this.mostAccurateLock.horizAccuracy) {
				this.mostAccurateLock = this.gps;
				//console.log("Found a better location");
			}
			else {
				//console.log("This location is not better!");
			}
		}
		else {
			//console.log("This is the first match.");
			//This is the first match so this is automatically the best match
			this.mostAccurateLock = this.gps;
		}
		
		this.$.addLocDialog.setPosition(this.gps);
	},
	getPosFailure : function(inSender, inResponse) {
		//Error so set gps to null
		this.gps = null;
		this.$.addLocDialog.setError(inResponse);
	}
});