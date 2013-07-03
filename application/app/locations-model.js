enyo.kind({
	name: "locationTagger.LocationsModel",
	kind: enyo.Component,
	published: {
		locationsUpdatedCallback: null,
		categoriesUpdatedCallback: null
	},
	components: [
		{
			name: "db",
			kind: "onecrayon.Database",
			database: "ext:" + (enyo.g11n.getPlatform() === "device" ? enyo.fetchAppId() : "com.spinn.locationtagger"),
			version: "",
			debug: (Spinn.Utils.exists(enyo.fetchFrameworkConfig().debuggingEnabled) ? enyo.fetchFrameworkConfig().debuggingEnabled : false)
		},
		{ name:"workQueue", kind:"Spinn.WorkQueue"}
	],
	constructor: function () {
		this.inherited(arguments);
		this.currentCategory = null;
		this.currentLocations = null;
		this.currentCategories = null;
		this.listColumns = ["rowID", "name", "category", "description", "altitude", "heading", "horizAccuracy", "latitude", "longitude", "timestamp", "velocity", "vertAccuracy"];
		this.bound = {
			_databaseError: enyo.bind(this, this._databaseError)
		}
		
		this.refreshBoth = false;
	},
	create: function () {
		this.inherited(arguments);
		this.currentVersion = "1.0";
		if (!localStorage["LocationTagger.firstRun"]) {
			this.$.workQueue.createWorkItem(enyo.bind(this, this._populateDatabase_worker));
		}
	},
	_databaseError: function (er) {
		try {
			if (er.code === 1) {
				this.error("Database error (" + er.code + "): " + er.message);
				//this.populateDatabase();
			} else {
				this.error("Database error (" + er.code + "): " + er.message);
			}
		} finally {
			this.$.workQueue.lookForMoreWork();
		}
	},
	_populateDatabase_worker: function () {
		this.$.db.setSchemaFromURL("schemas/schema.json", {
			onSuccess: enyo.bind(this, this._finishFirstRun),
			onError: this.bound._databaseError
		})
	},
	_finishFirstRun: function () {
		localStorage["LocationTagger.firstRun"] = "true";
		this.$.db.changeVersion(this.currentVersion);
		this._refreshItems_worker();
		//Don't call lookForMoreWork() because that will be handled by the success callback in _refreshItems_worker
	},
	importFromJSON: function (data) {
		this.$.workQueue.createWorkItem(enyo.bind(this, this._importFromJSON_worker));
	},
	_importFromJSON_worker: function (data) {
		var queries = [];
		for (i = 0; i < data.length; i++) {
			delete data[i].dateTime;
			queries.push(this.$.db.getInsert("locations", data[i]));
		}
		this.$.db.queries(queries, {
			onSuccess: enyo.bind(this, this._refreshItems_worker),
			onError: this.bound._databaseError
		});
	},
	refreshItems: function () {
		this.$.workQueue.createWorkItem(enyo.bind(this, this._refreshItems_worker));
	},
	_refreshItems_worker: function () {
		//Only refresh both if there is a category selected
		if(Spinn.Utils.exists(this.currentCategory)) {
			this.refreshBoth = true;
		}
		this._refreshCategories_worker();
	},
	
	/*Start categories code*/
	refreshCategories: function () {
		this.$.workQueue.createWorkItem(enyo.bind(this, this._refreshCategories_worker));
	},
	_refreshCategories_worker: function () {
		if(this.categoriesUpdatedCallback !== null) {
			var query = {
				sql: "SELECT DISTINCT category, count(category) as LocCount FROM locations GROUP BY category ORDER BY category",
				values: []
			};
			this.$.db.query(query, {
				onSuccess: enyo.bind(this, this._onCategoriesQuerySuccess),
				onError: this.bound._databaseError
			});
		} else {
			this.$.workQueue.lookForMoreWork();
		}
	},
	_onCategoriesQuerySuccess: function(result) {
		this.currentCategories = result;
		//Call the callback if it exists
		if (this.categoriesUpdatedCallback !== null) {
			this.categoriesUpdatedCallback(this.currentCategories);
		}
		if(this.refreshBoth == true) {
			this.refreshBoth = false;
			this._refreshLocations_worker();
			//Don't call lookForMoreWork() because that will be handled by the success callback in _refreshLocations_worker
		} else {
			this.$.workQueue.lookForMoreWork();
		}
	},
	/*End categories code*/
	
	/*Start locations code*/
	getAllLocations: function (callback) {
		this.$.workQueue.createWorkItem(enyo.bind(this, this._getAllLocations_worker, callback));
	},
	_getAllLocations_worker: function (callback) {
		if (Spinn.Utils.exists(callback)) {
			var query = {
				sql: "SELECT " + this.listColumns.join(", ") + " FROM locations ",
				values: []
			};
			this.$.db.query(query, {
				onSuccess: enyo.bind(this, this._getAllLocationsSuccess, callback),
				onError: this.bound._databaseError
			});
		}
	},
	_getAllLocationsSuccess: function(callback, data) {
		try {
			if (Spinn.Utils.exists(callback)) {
				callback(data);
			}
		} finally {
			this.$.workQueue.lookForMoreWork();
		}
	},
	refreshLocations: function () {
		this.$.workQueue.createWorkItem(enyo.bind(this, this._refreshLocations_worker));
	},
	_refreshLocations_worker: function () {
		if (Spinn.Utils.exists(this.locationsUpdatedCallback)) {
			var query = {
				sql: "SELECT " + this.listColumns.join(", ") + " FROM locations ",
				values: []
			};
			if (this.currentCategory !== null) {
				query.sql += "WHERE category = '" + this.currentCategory + "' ";
			}
			query.sql += "ORDER BY name COLLATE NOCASE ASC";
			this.$.db.query(query, {
				onSuccess: enyo.bind(this, this._onLocationQuerySuccess),
				onError: this.bound._databaseError
			});
		} else {
			this.$.workQueue.lookForMoreWork();
		}
	},
	_onLocationQuerySuccess: function (result) {
		try {
			this.currentLocations = result;
			//Call the callback if it exists
			if (this.locationsUpdatedCallback !== null) {
				this.locationsUpdatedCallback(this.currentLocations);
			}
		} finally {
			this.$.workQueue.lookForMoreWork();
		}
	},
	getLocation: function (id, callback) {
		this.$.workQueue.createWorkItem(enyo.bind(this, this._getLocation_worker, id, callback));
	},
	_getLocation_worker: function (id, callback) {
		var selectCommand = this.$.db.getSelect("locations", this.listColumns, {
			rowID: id
		});
		this.$.db.query(selectCommand, {
			onSuccess: enyo.bind(this, this._getLocationFinish, callback),
			onError: this.bound._databaseError
		});
	},
	_getLocationFinish: function (callback, a) {
		try {
			if (enyo.isArray(a)) {
				a = a[0];
			}
			callback(a);
		} finally {
			this.$.workQueue.lookForMoreWork();
		}
	},
	insertLocation: function (data, callback) {
		this.$.workQueue.createWorkItem(enyo.bind(this, this._insertLocation_worker, data, callback));
	},
	_insertLocation_worker: function (data, callback) {
		var b = this.$.db.getInsert("locations", data);
		this.$.db.query(b, {
			onSuccess: enyo.bind(this, this._updateFinished, null, callback),
			onError: this.bound._databaseError
		});
	},
	updateLocation: function (rowID, value, callback) {
		this.$.workQueue.createWorkItem(enyo.bind(this, this._updateLocation_worker, rowID, value, callback));
	},
	_updateLocation_worker: function (rowID, value, callback) {
		var sqlCommand = this.$.db.getUpdate("locations", value, {
				rowID: rowID
			});
		this.$.db.query(sqlCommand, {
			onSuccess: enyo.bind(this, this._updateFinished, rowID, callback),
			onError: this.bound._databaseError
		});
	},
	_updateFinished: function (id, callback) {
		if (id === null) {
			id = this.$.db.lastInsertID();
		}
		if (Spinn.Utils.exists(callback)) {
			callback(id);
		}
		this._refreshItems_worker();
		//Don't call lookForMoreWork() because that will be handled by the success callback in _refreshItems_worker
	},
	deleteLocation: function (id, callback) {
		this.$.workQueue.createWorkItem(enyo.bind(this, this._deleteLocation_worker, id, callback));
	},
	_deleteLocation_worker: function (id, callback) {
		var deleteCommand = this.$.db.getDelete("locations", {
			rowID: id
		});
		this.$.db.query(deleteCommand, {
			onSuccess: enyo.bind(this, this._deleteLocationFinish, callback),
			onError: this.bound._databaseError
		});
	},
	_deleteLocationFinish: function (callback) {
		if (Spinn.Utils.exists(callback)) {
			callback();
		}
		this._refreshItems_worker();
		//Don't call lookForMoreWork() because that will be handled by the success callback in _refreshItems_worker
	}
	/*End locations code*/
	
});