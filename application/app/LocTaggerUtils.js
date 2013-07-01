enyo.kind({
	name: "LocTaggerUtils",
	kind: enyo.Component,
	gpsToRichTXT: function (a) {
		return ("<b>Altitude:</b> " + this.metersToFeet(a.altitude).toFixed(2) + " feet / " + a.altitude + " meters<br/>"
				+ "<b>Heading:</b> " + a.heading + "<br/>"
				+ "<b>Horizontal Accuracy:</b> " + this.metersToFeet(a.horizAccuracy).toFixed(2) + " feet / " + a.horizAccuracy + " meters\n<br/>"
				+ "<b>Latitude:</b> " + a.latitude + "<br/>"
				+ "<b>Longitude:</b> " + a.longitude + "<br/>"
				+ "<b>Timestamp:</b> " + new Date(a.timestamp) + "<br/>"
				+ "<b>Velocity:</b> " + this.kphToMph(a.velocity).toFixed(2) + " MPH / " + a.velocity + " KPH<br/>"
				+ "<b>Vertical Accuracy:</b> " + this.metersToFeet(a.vertAccuracy).toFixed(2) + " feet / " + a.vertAccuracy + " meters<br/>");
	},
	gpsToJSONForExport: function (a) {
		return ('{\n"name": "' + a.name + '", \n'
				+ '"category": "' + a.category + '", \n'
				+ '"description": "' + a.description + '", \n'
				+ '"altitude": "' + a.altitude + '", \n'
				+ '"heading": "' + a.heading + '", \n'
				+ '"horizAccuracy": "' + a.horizAccuracy + '", \n'
				+ '"latitude": "' + a.latitude + '", \n'
				+ '"longitude": "' + a.longitude + '", \n'
				+ '"timestamp": "' + a.timestamp + '", \n'
				+ '"dateTime": "' + new Date(a.timestamp) + '", \n'
				+ '"velocity": "' + a.velocity + '", \n'
				+ '"vertAccuracy": "' + a.vertAccuracy + '"\n}');
	},
	gpsToReport: function (a) {
		return ('*******************************************************************************************************\n'
				+ 'Location: ' + a.name + '\n'
				+ this.fixEntities(this.fixLineBreaks(a.description)) + '\n'
				+ '-----------------------------------\n'
				+ 'latitude: ' + a.latitude + '\n'
				+ 'longitude: ' + a.longitude + '\n'
				+ 'horizontal accuracy: ' + this.metersToFeet(a.horizAccuracy).toFixed(2) + ' feet / ' + a.horizAccuracy + ' meters\n'
				+ 'vertical accuracy: ' + this.metersToFeet(a.vertAccuracy).toFixed(2) + ' feet / ' + a.vertAccuracy + ' meters\n'
				+ 'altitude: ' + this.metersToFeet(a.altitude).toFixed(2) + ' feet / ' + a.altitude + ' meters\n'
				+ 'heading: ' + a.heading + '\n'
				+ 'velocity: ' + this.kphToMph(a.velocity).toFixed(2) + ' MPH / ' + a.velocity + ' KPH\n');
	},
	fixLineBreaks: function (a) {
		var temp = a.replace(/<br\/>/g,"\n"); 
		return temp.replace(/<br>/g,"\n"); 
	},
	fixEntities: function (a) {
		var temp = a.replace(/&nbsp;/g," "); 
		
		return temp.replace(/&amp;/g,"&"); 
	},
	metersToFeet: function (a) {
		return (a * 3.2808399);
	},
	kphToMph: function (a) {
		return (a * 0.621371192);
	}
});