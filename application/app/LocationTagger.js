enyo.kind({
	name: "LocationTagger",
	kind: enyo.VFlexBox,
	components: [
		{
			name: "model",
			kind: "locationTagger.LocationsModel"
		},
		{
			name      : "openApp",
			kind      : "PalmService",
			service   : "palm://com.palm.applicationManager/",
			method    : "open",
			subscribe : true
		},
		{kind: "FileIO",
			onOpened: "handleOpened",
			onCreated: "handleCreated",
			onSaved: "handleSaved",
			localDir: "/media/internal/LocationTagger/",
			fileExtension: ".json"
		},
		{kind: "ApplicationEvents", onLoad:"loaded", onWindowDeactivated: "deactivated"},
		{name: "appMenu", kind: "AppMenu", components: [
			{name: "addLocation", caption: "Add Location", onclick: "btnAddLocation_Click"},
			{name: "manualLocation", caption: "Manual Location", onclick: "btnManualLocation_Click"},
			{name: "locationReport", caption: "Save Location Report", onclick: "btnSaveLocationReport_Click"},
			{name: "exportLocations", caption: "Export Locations", onclick: "btnExportLocations_Click"},
			{name: "importLocations", caption: "Import Locations", onclick: "btnImportLocations_Click"},
			{name: "about", caption: "About", onclick: "btnAbout_Click"}
		]},
		{kind: "Spinn.AboutDialog", name: "theAboutDialog"},
		{kind: "AddLocationController", name: "locationAdder", onSaveLocation: "saveLocationHandler"},
		{kind: "ManualLocationDialog", name: "manualLocationAdder", onSave: "saveLocationHandler"},
		{kind: "SlidingPane", name: "slidingPane", flex: 1, components: [
			{name: "categoryPane", width: "320px", components: [
				{kind: "VFlexBox",  flex: 1, components: [
					{kind: "Header", content: "Categories"},
					{kind: "Scroller", name:"categoryListScroller", flex: 1, autoHorizontal: false, horizontal: false,
						components: [
							{name: "categoryList", kind: "Spinn.SelectableVirtualRepeater", onSetupRow: "getCategoryItem", onclick: "categoryListItemClick",
								components: [
									{kind: "Spinn.CountableItem", name: "catItem"}
								]
							}
						]
					},
					{kind: "Toolbar"}
				]}
			]},
			{name: "locationPane", width: "320px",
				components: [
					{kind: "VFlexBox",  flex: 1, components: [
						{kind: "Header", content: "Locations"},
						{kind: "Scroller", name: "locationListScroller", flex: 1, autoHorizontal: false, horizontal: false,
							components: [
								{name: "locationList", kind: "Spinn.SelectableVirtualRepeater", onSetupRow: "getLocationItem", onclick: "locationListItemClick",
									components: [
										{kind: "SwipeableItem", onConfirm: "doDeleteLocation", layoutKind: "VFlexLayout", tapHighlight: true, components: [
											{name: "locName"}
										]}
									]
								}
							]
						},
						{kind: "Toolbar",
							components: [{
								name: "fullscreenButton2",
								kind: "GrabButton"
							}]
						}
					]}
					
				]
			},
			{name: "locationDetailPane", flex: 1, onResize: "slidingResize",
				components: [
					{kind: "VFlexBox",  flex: 1, components: [
						{kind: "Header", content: "Details"},
						{kind: "Scroller", name:"detailScroller", flex: 1, autoHorizontal: false, horizontal: false, 
							components: [
								{kind: "LocationDetails", name:"locDetails"}
							]
						},
						{kind: "Toolbar",
							components: [{
								name: "fullscreenButton3",
								kind: "GrabButton"
							},
							{
								name: "btnMap",
								kind: "ToolButton",
								icon: "map-btn",
								iconIsClassName: true,
								onclick: "btnMap_Click"
							}]
						}
					]}
				]
			}
		]},
	],
	constructor: function () {
		this.inherited(arguments);
		var b = enyo.getCookie("LocationTagger.installed");
		var c = enyo.fetchDeviceInfo();
		if (!b || (enyo.exists(c) && b !== c.serialNumber)) {
			localStorage.removeItem("LocationTagger.version");
			localStorage.removeItem("LocationTagger.firstRun");
			if (enyo.fetchDeviceInfo()) {
				enyo.setCookie("LocationTagger.installed", enyo.fetchDeviceInfo().serialNumber)
			} else {
				enyo.setCookie("LocationTagger.installed", "browser")
			}
		}
		this.bound = {
			renderLocations: enyo.bind(this, this.renderLocations),
			renderCategories: enyo.bind(this, this.renderCategories),
			exportLocations: enyo.bind(this, this.exportLocations),
			locationReport: enyo.bind(this, this.locationReport)
		}
	},
	create: function () {
		this.inherited(arguments);
		enyo.application.model = this.$.model;
		this.$.model.setLocationsUpdatedCallback(this.bound.renderLocations);
		this.$.model.setCategoriesUpdatedCallback(this.bound.renderCategories);
		this.$.model.refreshCategories();
	},
	loaded: function (inSender) {
		//When the application is loaded we need to check to see if it is a phone
		if(enyo.isPhone())
		{ this.addClass("isPhone"); }
	},
	deactivated: function (inSender) {
		//The card was deactivated so save the location in case the user closes the application
		this.$.locDetails.updateLocation();
	},
	btnAbout_Click: function() {
		this.$.theAboutDialog.openAtCenter();
	},
	btnAddLocation_Click: function () {
		this.$.locationAdder.addLocation();
	},
	btnManualLocation_Click: function () {
		this.$.manualLocationAdder.openAtCenter();
	},
	saveLocationHandler: function (inSender, inEvent) {
		this.$.model.insertLocation(inEvent.gps, this.$.model.bound.refreshItems);
	},
	btnMap_Click: function(inSender) {
		var viewedLocation = this.$.locDetails.getLocation();
		//Only show the map if the user is currently viewing a location
		if(enyo.exists(viewedLocation)) {
			this.$.openApp.call({
				"id": "com.palm.app.maps", 
				"params": {
					"location": {"lat": viewedLocation.latitude, "lng": viewedLocation.longitude}
				}
			});
		}
	},
	/*FileIO*/
	btnExportLocations_Click: function () {
		this.$.fileIO.setBaseFileName("Export");
		this.$.fileIO.setFileExtension(".json");
		this.$.fileIO.createNew();
	},
	btnSaveLocationReport_Click: function() {
		this.$.fileIO.setBaseFileName("Location-Report");
		this.$.fileIO.setFileExtension(".txt");
		this.$.fileIO.createNew();
	},
	handleCreated: function(inSender, inResponse) {
		if(this.$.fileIO.getBaseFileName() == "Location-Report") {
			this.$.model.getAllLocations(this.bound.locationReport);
		} else {
			this.$.model.getAllLocations(this.bound.exportLocations);
		}
	},
	locationReport: function(gpsPoints) {
		var content = "";
		for (i = 0; i < gpsPoints.length; i++)
		{ content = content + LocTaggerUtils.gpsToReport(gpsPoints[i]); }
		this.$.fileIO.saveFile(content);
	},
	exportLocations: function(gpsPoints) {
		var content = "[\n";
		var temp = [];
		for (i = 0; i < gpsPoints.length; i++)
		{ temp.push(LocTaggerUtils.gpsToJSONForExport(gpsPoints[i])); }
		
		content = content + temp.join(",\n") + "\n]";
		
		this.$.fileIO.saveFile(content);
	},
	btnImportLocations_Click: function () {
		this.$.fileIO.setFileExtension(".json");
		this.$.fileIO.openFile();
	},
	handleOpened: function(inSender, inResponse) {	
		this.$.model.importFromJSON(enyo.json.parse(inResponse.content));
	},
	handleSaved: function(inSender, inResponse) {},
	/*End FileIO*/
	renderCategories: function (results) {
		//Scroll the category list back to the top
		this.$.categoryListScroller.scrollTo(0,0);
		this.$.categoryList.render();
	},
	renderLocations: function (results) {
		//Don't scroll to the top here because this also get triggered when the
		//list the user it looking at gets refreshed and it is annoying for the use
		//to have to scroll back down.
		this.$.locationList.render();
	},
	getCategoryItem: function(inSender, inIndex) {
		if(this.$.model.currentCategories !== null) {
			var r = this.$.model.currentCategories[inIndex];
			if (r) {
				this.$.catItem.setCaption(r.category);
				this.$.catItem.setCount(r.LocCount);
				//If the item being rendered is what was selected before, reselect it
				if(inSender.getSelectedID() == r.category) {
					inSender.setItemToSelectOnRender(inIndex, r.category);
				}
				return true;
			}
		}
	},
	categoryListItemClick: function(inSender, inEvent) {
		//Only trigger if user has clicked on an item
		if(enyo.exists(inEvent.rowIndex)) {
			//Only do selection if the user has selected a different category
			if(inSender.getSelectedIndex() != inEvent.rowIndex) {
				var category = this.$.model.currentCategories[inEvent.rowIndex];
				//Select the clicked item
				inSender.setSelectedItem(inEvent.rowIndex, category.category);
				
				this.$.model.currentCategory = category.category;
				this.$.model.refreshLocations();
				//Scroll the location list back to the top - do it here because we are looking at a different list
				this.$.locationListScroller.scrollTo(0,0);
				//Clear the location details
				this.$.locDetails.setLocation(null);
				//clear the selected location item in the list - as we are looking at a new list
				this.$.locationList.clearSelection();
			}
			//Always go to the location pane on a phone
			if(enyo.isPhone())
			{ this.$.slidingPane.selectView(this.$.locationPane); }
		}
	},
	getLocationItem: function(inSender, inIndex) {
		if(this.$.model.currentLocations !== null) {
			var r = this.$.model.currentLocations[inIndex];
			if(r) {
				this.$.locName.setContent(r.name);
				//If the item being rendered is what was selected before, reselect it
				if(inSender.getSelectedID() == r.rowID) {
					inSender.setItemToSelectOnRender(inIndex, r.rowID);
				}
				return true;
			}
		}
	},
	locationListItemClick: function(inSender, inEvent) {
		//Only trigger if user has clicked on an item
		if(enyo.exists(inEvent.rowIndex)) {
			//Only do selection if the user has selected a different location
			if(inSender.getSelectedIndex() != inEvent.rowIndex) {
				var loc = this.$.model.currentLocations[inEvent.rowIndex]
				//Select the clicked item
				inSender.setSelectedItem(inEvent.rowIndex, loc.rowID);
				
				this.$.locDetails.setLocation(loc);
				//Scroll the details back to the top
				this.$.detailScroller.scrollTo(0,0);
			}
			
			//Always go to the location details pane on a phone
			if(enyo.isPhone())
			{ this.$.slidingPane.selectView(this.$.locationDetailPane); }
		}
	},
	doDeleteLocation: function(inSender, inIndex) {
		var viewedLocation = this.$.locDetails.getLocation();
		
		//If deleting the selected location clear the details pane - if it is displaying something
		if(enyo.exists(viewedLocation)) {
			if(viewedLocation.rowID == this.$.model.currentLocations[inIndex].rowID) {
				this.$.locDetails.setLocation(null);
				//clear the selected location item in the list - as we have deleted the selected location
				this.$.locationList.clearSelection();
			}
		}
		//If this is the last location in a category being deleted - clear the category selection
		if(this.$.model.currentLocations.length == 1) {
			this.$.categoryList.clearSelection();
		}
		
		this.$.model.deleteLocation(this.$.model.currentLocations[inIndex].rowID, undefined);
	}
});