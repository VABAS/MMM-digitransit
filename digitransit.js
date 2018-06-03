Module.register("digitransit",{
	// Default module config.
	defaults: {
		updateInterval: 30000,
		changeInterval: 5000,
		fadeSpeed: 0,
		routeNameLength: 20,
		realTimeSign: " ",
		scheduledSign: "~",
		stops: [
			"HSL:2331207",
			"HSL:2332207",
			],
	},
	getStyles: function() {
		return [
			this.file('digitransit.css')
		]
	},
	start: function () {
		this.stopNum = 0;
		this.stopData = [];
		this.updateStopData();
		// Schedule update timers.
		var self = this;
		setInterval(function() {
			self.updateStopData();
		}, this.config.updateInterval);
		setInterval(function() {
			self.updateDom(self.config.fadeSpeed);
		}, this.config.changeInterval);
	},
	updateStopData: function () {
		var self = this;
		var walttiZones = [
			"FOLI",
			"Hameenlinna",
			"IisalmiEly",
			"JoensuuEly",
			"Kajaani",
			"Kotka",
			"Kouvola",
			"Lahti",
			"Lappeenranta",
			"LINKKI",
			"MikkeliEly",
			"OULU",
			"PohjoisPohjanmaanEly",
		];
		var temp = [];
		for (var curStop = 0; curStop < self.config.stops.length; curStop++) {
			(function (curStop) {
			var zone = self.config.stops[curStop].split(":")[0];
			if (walttiZones.includes(zone)) {
				zone = "waltti";
			}
			else if (zone == "HSL"){
				zone = "hsl";
			}
			else {
				Log.warning("Invalid zone specified for stop " + curStop + ": " + zone);
				return;
			}
			var xhr = new XMLHttpRequest();
			xhr.responseType = 'json';
			xhr.open("POST", "https://api.digitransit.fi/routing/v1/routers/" + zone + "/index/graphql");
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.setRequestHeader("Accept", "application/json");
			xhr.addEventListener("load", function () {
				var stopData = {name: "", gtfsId: "", stopTimeArray: []};
				if (xhr.readyState != 4 || xhr.status != 200) {
					return;
				}
				var data = xhr.response.data.stop;
				stopData.name = data.name;
				stopData.gtfsId = data.gtfsId;
				var stopTimes = data.stoptimesWithoutPatterns;
				for (i = 0; i < stopTimes.length; i++) {
					if (stopTimes[i].headsign == null) continue;
					stopData.stopTimeArray.push([
						stopTimes[i].realtimeDeparture - (2 * 3600),
						stopTimes[i].trip.route.shortName,
						stopTimes[i].headsign.split(" via ")[0],
						stopTimes[i].realtime,
						stopTimes[i].scheduledDeparture
					]);
				}
				temp.push(stopData);
			});
			var query = `{stop(id: \"` + self.config.stops[curStop] + `\") {
			    gtfsId
			    name
			    stoptimesWithoutPatterns(numberOfDepartures: 10, timeRange: 46200) {
			      scheduledDeparture
			      realtimeDeparture
			      realtime
			      headsign
			      trip {
			         route {
			            shortName
			        }
			      }
			    }
			  }
			  }}`;
			Log.info("Updating stop data for stop " + self.config.stops[curStop]);
			xhr.send(JSON.stringify({query: query}));
		})(curStop);}
		Log.info(temp);
		self.stopData = temp;
	},
	// Override dom generator.
	getDom: function () {
		self = this;
		var wrapper = document.createElement("div");
		var data = self.stopData[self.stopNum];
		wrapper.innerHTML = data.name + " <sup>(" + data.gtfsId + ")</sup>";
		var stopTimeArray = data.stopTimeArray;
		var table = document.createElement("table");
		table.setAttribute("style", "width:500px;");
		var tr = document.createElement("tr");
		var timeth = document.createElement("th");
		timeth.appendChild(document.createTextNode("Aika"));
		var routeth = document.createElement("th");
		routeth.appendChild(document.createTextNode("Linja"));
		var destth = document.createElement("th");
		destth.appendChild(document.createTextNode("Määränpää"));
		tr.appendChild(document.createElement("th"));
		tr.appendChild(timeth);
		tr.appendChild(routeth);
		tr.appendChild(destth);
		table.appendChild(tr);
		for (var s in stopTimeArray) {
			var time = new Date((stopTimeArray[s][0] * 1000));
			var minutes = time.getMinutes().toString();
			var hours = time.getHours().toString();
			var d = new Date(), e = new Date(d);
			var msSinceMidnight = (e - d.setHours(0,0,0,0));
			time = new Date((stopTimeArray[s][0] * 1000 - msSinceMidnight + 1000));
			var minutesToDeparture = (time.getMinutes() + 60 * time.getHours()).toString();
			if (minutes.length < 2) {
				minutes = "0" + minutes;
			}
			if (hours.length < 2) {
				hours = "0" + hours;
			}
			var tr = document.createElement("tr");
			tr.setAttribute("id", stopTimeArray[s][1] + "-" + stopTimeArray[s][4]);
			var rttd = document.createElement("td");
			if (stopTimeArray[s][3]) {
				rttd.appendChild(document.createTextNode(" "));
			}
			else {
				rttd.appendChild(document.createTextNode("~"));
			}
			var timetd = document.createElement("td");
			if (minutesToDeparture < 1) {
				timetd.appendChild(document.createTextNode("Nyt"));
			}
			else if (minutesToDeparture < 10) {
				timetd.appendChild(document.createTextNode(minutesToDeparture + " min"));
			}
			else {
				timetd.appendChild(document.createTextNode(hours + ":" + minutes));
			}
			var routetd = document.createElement("td");
			routetd.appendChild(document.createTextNode(stopTimeArray[s][1]));
			var desttd = document.createElement("td");
			if (stopTimeArray[s][2].length > self.config.routeNameLength) {
				stopTimeArray[s][2] = stopTimeArray[s][2].slice(0, self.config.routeNameLength) + "...";
			}
			desttd.appendChild(document.createTextNode(stopTimeArray[s][2]));
			tr.appendChild(rttd);
			tr.appendChild(timetd);
			tr.appendChild(routetd);
			tr.appendChild(desttd);
			table.appendChild(tr);
		}
		wrapper.appendChild(table);
		self.stopNum = (self.stopNum + 1) % self.stopData.length;
		return wrapper;
	}
});
