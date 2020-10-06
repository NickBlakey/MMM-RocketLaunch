"use strict";

Module.register("MMM-RocketLaunch", {
	jsonData: null,

	// Default module config.
	defaults: {
		url: "https://fdo.rocketlaunch.live/json/launches?key=",
		api: "",
		arrayName: "result",
		keepColumns: [],
		size: 0,
		tryFormatDate: false,
		updateInterval: 1000
	},
	
	// Define required stylescripts.
	getStyles: function () {
		return ["MMM-RocketLaunch.css"];
	},


	start: function () {
		this.getJson();
		var self = this;
		setInterval(function() {
//			console.log("Refreshing");
			self.getJson();
			self.updateDom();
		}, this.config.updateInterval)
	},

	// Request node_helper to get json from url
	getJson: function () {
		this.config.url = this.config.url + this.config.api;
//		console.log(this.config.url);
		this.sendSocketNotification("MMM-RocketLaunch_GET_JSON", this.config.url);
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "MMM-RocketLaunch_JSON_RESULT") {
			// Only continue if the notification came from the request we made
			// This way we can load the module more than once
			console.log(payload.data.result);

			if (payload.url === this.config.url) {
				this.jsonData = payload.data;
				for (var cKey in this.jsonData) if (this.jsonData.hasOwnProperty(cKey));
				this.updateDom(500);
			}
		}
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = "medium";
		
		var today = new Date();

		if (!this.jsonData) {
			wrapper.innerHTML = "Awaiting json data...";
			return wrapper;
		}

		var table = document.createElement("table");
		var tbody = document.createElement("tbody");

		var items = [];
		if (this.config.arrayName) {
			items = this.jsonData[this.config.arrayName];
		} else {
			items = this.jsonData;
		}

		// Check if items is of type array
		if (!(items instanceof Array)) {
			wrapper.innerHTML = "Json data is not of type array! " + "Maybe the config arrayName is not used and should be, or is configured wrong";
			return wrapper;
		}

		items.forEach((element) => {
			//			console.log(element["win_open"]);
			if (element["win_open"]) {
//				console.log(element.missions[0]["name"]);
				var hourDiff = (new Date(element["win_open"]) - today) / 3.6e6;//Hours to launch - use to format table...
//				console.log(hourDiff);
				var t0Exist = element["t0"];
//				console.log(t0Exist);
				var line = {
					vehicleCompany:	element.provider["name"],
					vehicleModel:	element.vehicle["name"],
					locationName:	element.pad.location["name"],
					locationCountry:element.pad.location["country"],
					locationState:	element.pad.location["statename"],
					missionName:	element.missions[0]["name"]//,
//					launchTime:	this.getFormattedValue(element["win_open"])
					};
				if (hourDiff < 0.5) {
					if (t0Exist == null) {
						line.launchOngoing = this.getFormattedValue(element["win_open"]);
					} else {
						line.launchOngoing = this.getFormattedValue(element["t0"]);
					}
				}
				else if (hourDiff > 0.5 && hourDiff < 1.5) {
					line.launchTime01 = this.getFormattedValue(element["win_open"]);
				}
				else if (hourDiff > 1.5 && hourDiff < 3) {
					line.launchTime03 = this.getFormattedValue(element["win_open"]);
				}
				else if (hourDiff > 3 && hourDiff < 6) {
					line.launchTime06 = this.getFormattedValue(element["win_open"]);
				}
				else if (hourDiff > 6 && hourDiff < 24) {
					line.launchTime24 = this.getFormattedValue(element["win_open"]);
				}
				else if (hourDiff > 24 && hourDiff < 72) {
					line.launchTime72 = this.getFormattedValue(element["win_open"]);
				}
				else {
					line.launchTime = this.getFormattedValue(element["win_open"]);
				}
				var row = this.getTableRow(line);//this.getFormattedValue(element["win_open"]));
				tbody.appendChild(row)
			}
			return wrapper;
		});

		table.appendChild(tbody);
		wrapper.appendChild(table);
		return wrapper;
	},

	getTableRow: function (jsonObject) {
		var row = document.createElement("tr");
		for (var key in jsonObject) {
			var cell = document.createElement("td");
			cell.className = key;

			var valueToDisplay = "";
			if (key === "icon") {
				cell.classList.add("fa", jsonObject[key]);
			} else if (this.config.tryFormatDate) {
				valueToDisplay = this.getFormattedValue(jsonObject[key]);
			} else {
				if (this.config.keepColumns.length == 0 || this.config.keepColumns.indexOf(key) >= 0) {
					valueToDisplay = jsonObject[key];
				}
			}

			if (valueToDisplay == null) {
				valueToDisplay = "";
				}

			var cellText = document.createTextNode(valueToDisplay);

			if (this.config.size > 0 && this.config.size < 9) {
				var h = document.createElement("H" + this.config.size);
				h.appendChild(cellText);
				cell.appendChild(h);
			} else {
				cell.appendChild(cellText);
			}

			row.appendChild(cell);
		}
		return row;
	},

	// Format a date string or return the input
	getFormattedValue: function (input) {
		var m = moment(input);
//		console.log (m.format("L"));
		if (typeof input === "string" && m.isValid()) {
			// Show a formatted time if it occures today
			if (m.isSame(new Date(), "day")) {
//				console.log("one");
				return m.format("LTS");
			} else {
//				console.log("two");
				return m.format("llll");
			}
		} else {
			return input;
		}
	}
});