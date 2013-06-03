enyo.kind({
	name: "locationTagger.LocationsModel",
	kind: enyo.Component,
	components: [
		{kind: "Spinn.Utils", name: "Utils"},
		{
			name: "db",
			kind: "onecrayon.Database",
			database: "ext:" + (enyo.g11n.getPlatform() === "device" ? enyo.fetchAppId() : "com.spinn.locationtagger"),
			version: "",
			debug: (((typeof enyo.fetchFrameworkConfig().debuggingEnabled !== "undefined") && (enyo.fetchFrameworkConfig().debuggingEnabled !== null)) ? enyo.fetchFrameworkConfig().debuggingEnabled : false)
		}
	],
	constructor: function () {
		this.inherited(arguments);
		this.currentCategory = null;
		this.currentLocations = null;
		this.currentCategories = null;
		this.runningQuery = false;
		this.refreshBoth = false;
		this.locationsUpdatedCallback = null;
		this.categoriesUpdatedCallback = null;
		this.listColumns = ["rowID", "name", "category", "description", "altitude", "heading", "horizAccuracy", "latitude", "longitude", "timestamp", "velocity", "vertAccuracy"];
		this.bound = {
			finishFirstRun: enyo.bind(this, this.finishFirstRun),
			refreshItems: enyo.bind(this, this.refreshItems),
			refreshLocations: enyo.bind(this, this.refreshLocations),
			refreshCategories: enyo.bind(this, this.refreshCategories),
			onLocationQuerySuccess: enyo.bind(this, this.onLocationQuerySuccess),
			onCategoriesQuerySuccess: enyo.bind(this, this.onCategoriesQuerySuccess),
			databaseError: enyo.bind(this, this.databaseError)
		}
	},
	create: function () {
		this.inherited(arguments);
		this.currentVersion = "1.0";
		if (!localStorage["LocationTagger.firstRun"] && !this.runningQuery) {
			this.populateDatabase()
		}
	},
	populateDatabase: function () {
		this.runningQuery = true;
		this.$.db.setSchemaFromURL("schemas/schema.json", {
			onSuccess: this.bound.finishFirstRun
		})
	},
	finishFirstRun: function () {
		localStorage["LocationTagger.firstRun"] = "true";
		this.$.db.changeVersion(this.currentVersion);
		this.runningQuery = false;
		this.refreshItems()
	},
	databaseError: function (er) {
		this.refreshBoth = false;
		this.runningQuery = false;
		if (er.code === 1) {
			this.error("Database error (" + er.code + "): " + er.message);
			this.populateDatabase()
		} else {
			this.error("Database error (" + er.code + "): " + er.message)
		}
	},
	importFromJSON: function (data) {
		var queries = [];
		for (i = 0; i < data.length; i++) {
			delete data[i].dateTime;
			queries.push(this.$.db.getInsert("locations", data[i]));
		}
		this.$.db.queries(queries, {
			onSuccess: this.bound.refreshItems,
			onError: this.bound.databaseError
		})
	},
	refreshItems: function () {
		//Only refresh both if there is a category selected
		if(this.$.Utils.exists(this.currentCategory)) {
			this.refreshBoth = true;
		}
		this.refreshCategories();
	},
	/*Start locations code*/
	getAllLocations: function (callback) {
		if (this.$.Utils.exists(callback) && !this.runningQuery) {
			try {
				var query = this.getBaseSelect();
				this.runningQuery = true;
				this.$.db.query(query, {
					onSuccess: enyo.bind(this, this.getAllLocationsSuccess, callback)
				})
			} catch (ex) {
				this.warn("Exception: " + ex)
			}
		}
	},
	getAllLocationsSuccess: function(callback, data) {
		this.runningQuery = false;
		if (this.$.Utils.exists(callback)) {
			callback(data);
		}
	},
	refreshLocations: function () {
		if (this.$.Utils.exists(this.locationsUpdatedCallback) && !this.runningQuery) {
			try {
				var query = this.getLocationsSelect();
				this.runningQuery = true;
				this.$.db.query(query, {
					onSuccess: this.bound.onLocationQuerySuccess,
					onError: this.bound.databaseError
				})
			} catch (ex) {
				this.warn("Exception: " + ex)
			}
		}
	},
	getLocationsSelect: function () {
		var command = this.getBaseSelect();
		if (this.currentCategory !== null) {
			command.sql += "WHERE category = '" + this.currentCategory + "' "
		}
		command.sql += "ORDER BY name COLLATE NOCASE ASC";
		return command
	},
	getBaseSelect: function () {
		var command = {
			sql: "SELECT " + this.listColumns.join(", ") + " FROM locations ",
			values: []
		};
		return command;
	},
	onLocationQuerySuccess: function (result) {
		this.currentLocations = result;
		this.runningQuery = false;
		this.refreshBoth = false;
		//Call the callback if it exists
		if (this.locationsUpdatedCallback !== null) {
			this.locationsUpdatedCallback(this.currentLocations)
		}
	},
	setLocationsUpdatedCallback: function (a) {
		this.locationsUpdatedCallback = a
	},
	clearLocationsUpdatedCallback: function () {
		this.locationsUpdatedCallback = null
	},
	/*End locations code*/
	
	/*Start categories code*/
	refreshCategories: function () {
		if(this.categoriesUpdatedCallback !== null && !this.runningQuery) {
			try{
				var query = this.getCategoriesSelect();
				this.runningQuery = true;
				this.$.db.query(query, {
					onSuccess: this.bound.onCategoriesQuerySuccess,
					onError: this.bound.databaseError
				})
			} catch (ex) {
				this.warn("Exception: " + ex)
			}
		}
	},
	getCategoriesSelect: function (){
		return {
			sql: "SELECT DISTINCT category, count(category) as LocCount FROM locations GROUP BY category ORDER BY category",
			values: []
		};
	},
	onCategoriesQuerySuccess: function(result) {
		this.currentCategories = result;
		this.runningQuery = false;
		//Call the callback if it exists
		if (this.categoriesUpdatedCallback !== null) {
			this.categoriesUpdatedCallback(this.currentCategories)
		}
		if(this.refreshBoth == true) {
			this.refreshLocations();
		}
	},
	setCategoriesUpdatedCallback: function (a) {
		this.categoriesUpdatedCallback = a
	},
	clearCategoriesUpdatedCallback: function () {
		this.categoriesUpdatedCallback = null
	},
	/*End categories code*/
	
	insertLocation: function (data, callback) {
		var b = this.$.db.getInsert("locations", data);
		this.$.db.query(b, {
			onSuccess: enyo.bind(this, this._updateFinished, null, callback)
		})
	},
	getLocation: function (id, callback) {
		var selectCommand = this.$.db.getSelect("locations", this.listColumns, {
			rowID: id
		});
		this.$.db.query(selectCommand, {
			onSuccess: enyo.bind(this, this.getLocationFinish, callback)
		})
	},
	getLocationFinish: function (callback, a) {
		if (enyo.isArray(a)) {
			a = a[0]
		}
		callback(a)
	},
	updateLocation: function (rowID, value, callback) {
		var sqlCommand = this.$.db.getUpdate("locations", value, {
				rowID: rowID
			})
		this.$.db.query(sqlCommand, {
			onSuccess: enyo.bind(this, this._updateFinished, rowID, callback)
		})
	},
	_updateFinished: function (id, callback) {
		this.refreshItems();
		if (id === null) {
			id = this.$.db.lastInsertID()
		}
		if (this.$.Utils.exists(callback)) {
			callback(id)
		}
	},
	deleteLocation: function (id, callBack) {
		var deleteCommand = this.$.db.getDelete("locations", {
			rowID: id
		});
		this.$.db.query(deleteCommand, {
			onSuccess: enyo.bind(this, this._deleteLocationFinish, callBack)
		})
	},
	_deleteLocationFinish: function (callBack) {
		this.refreshItems();
		if (this.$.Utils.exists(callBack)) {
			callBack()
		}
	}
});