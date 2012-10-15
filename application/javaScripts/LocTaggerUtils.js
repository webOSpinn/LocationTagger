var LocTaggerUtils = {};

if (!enyo.exists(LocTaggerUtils.gpsToRichTXT)) {
    LocTaggerUtils.gpsToRichTXT = function (a) {
        return ("<b>Altitude:</b> " + LocTaggerUtils.metersToFeet(a.altitude).toFixed(2) + " feet / " + a.altitude + " meters<br/>"
				+ "<b>Heading:</b> " + a.heading + "<br/>"
				+ "<b>Horizontal Accuracy:</b> " + LocTaggerUtils.metersToFeet(a.horizAccuracy).toFixed(2) + " feet / " + a.horizAccuracy + " meters\n<br/>"
				+ "<b>Latitude:</b> " + a.latitude + "<br/>"
				+ "<b>Longitude:</b> " + a.longitude + "<br/>"
				+ "<b>Timestamp:</b> " + new Date(a.timestamp) + "<br/>"
				+ "<b>Velocity:</b> " + LocTaggerUtils.kphToMph(a.velocity).toFixed(2) + " MPH / " + a.velocity + " KPH<br/>"
				+ "<b>Vertical Accuracy:</b> " + LocTaggerUtils.metersToFeet(a.vertAccuracy).toFixed(2) + " feet / " + a.vertAccuracy + " meters<br/>");
    }
}

if (!enyo.exists(LocTaggerUtils.gpsToJSONForExport)) {
	LocTaggerUtils.gpsToJSONForExport = function (a) {
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
    }
}

if (!enyo.exists(LocTaggerUtils.gpsToReport)) {
	LocTaggerUtils.gpsToReport = function (a) {
		return ('*******************************************************************************************************\n'
				+ 'Location: ' + a.name + '\n'
				+ LocTaggerUtils.fixEntities(LocTaggerUtils.fixLineBreaks(a.description)) + '\n'
				+ '-----------------------------------\n'
				+ 'latitude: ' + a.latitude + '\n'
				+ 'longitude: ' + a.longitude + '\n'
				+ 'horizontal accuracy: ' + LocTaggerUtils.metersToFeet(a.horizAccuracy).toFixed(2) + ' feet / ' + a.horizAccuracy + ' meters\n'
				+ 'vertical accuracy: ' + LocTaggerUtils.metersToFeet(a.vertAccuracy).toFixed(2) + ' feet / ' + a.vertAccuracy + ' meters\n'
				+ 'altitude: ' + LocTaggerUtils.metersToFeet(a.altitude).toFixed(2) + ' feet / ' + a.altitude + ' meters\n'
				+ 'heading: ' + a.heading + '\n'
				+ 'velocity: ' + LocTaggerUtils.kphToMph(a.velocity).toFixed(2) + ' MPH / ' + a.velocity + ' KPH\n');
	}
}

if (!enyo.exists(LocTaggerUtils.fixLineBreaks)) {
	LocTaggerUtils.fixLineBreaks = function (a) {
		var temp = a.replace(/<br\/>/g,"\n"); 
		return temp.replace(/<br>/g,"\n"); 
	}
}

if (!enyo.exists(LocTaggerUtils.fixEntities)) {
	LocTaggerUtils.fixEntities = function (a) {
		var temp = a.replace(/&nbsp;/g," "); 
		
		return temp.replace(/&amp;/g,"&"); 
	}
}

if (!enyo.exists(LocTaggerUtils.metersToFeet)) {
	LocTaggerUtils.metersToFeet = function (a) {
		return (a * 3.2808399);
	}
}

if (!enyo.exists(LocTaggerUtils.kphToMph)) {
	LocTaggerUtils.kphToMph = function (a) {
		return (a * 0.621371192);
	}
}
