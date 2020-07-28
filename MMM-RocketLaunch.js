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
		updateInterval: 3600000
	},
	
	// Define required stylescripts.
	getStyles: function () {
		return ["MMM-RocketLaunch.css"];
	},


	start: function () {
		this.getJson();
		this.scheduleUpdate();
	},

	scheduleUpdate: function () {
		var self = this;
		setInterval(function () {
			self.getJson();
		}, this.config.updateInterval);
	},

	// Request node_helper to get json from url
	getJson: function () {
		this.config.url = this.config.url + this.config.api;
		this.sendSocketNotification("MMM-RL_GET_JSON", this.config.url);
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "MMM-RL_JSON_RESULT") {
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
		/*
		items.forEach((element) => {
			var row = this.getTableRow(element.pad["location"]);
			tbody.appendChild(row);
		});
*/
		items.forEach((element) => {
			//			console.log(element["win_open"]);
			if (element["win_open"]) {
				console.log(element.missions[0]["name"]);
				var line = {
					vehicleCompany:	element.provider["name"],
					vehicleModel:	element.vehicle["name"],
					locationName:	element.pad.location["name"],
					locationCountry:element.pad.location["country"],
					locationState:	element.pad.location["statename"],
					missionName:	element.missions[0]["name"],
					launchTime:	this.getFormattedValue(element["win_open"])
					};
				var row = this.getTableRow(line);//this.getFormattedValue(element["win_open"]));
				tbody.appendChild(row)
//				wrapper.innerHTML += this.getFormattedValue(element["win_open"]) + "</p>";
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
		if (typeof input === "string" && m.isValid()) {
			// Show a formatted time if it occures today
			if (m.isSame(new Date(), "day") && m.hours() !== 0 && m.minutes() !== 0 && m.seconds() !== 0) {
				return m.format("HH:mm:ss");
			} else {
				return m.format("YYYY-MM-DD:HH:mm");
			}
		} else {
			return input;
		}
	}
});

/*Module.register("MMM-RocketLaunch", {

    // Defaults module config.
    defaults: {
        rocketBase: "family",
        modus: ""
    },

    // Define Start sequence.
    start: function () {
        this.count = 0;
        var timer = setInterval(()=>{
            this.updateDom();
            this.count++;
        }, 1000);
    },

    // Override DOM generator.
    getDom: function () {
        var table = document.createElement("table");
        table.className = "small";
        var element = document.createElement("div");
        element.className = "myContent";
        element.innerHTML = "Hello, you beautiful " + this.config.modus;
        var subElement = document.createElement("p");
        subElement.innerHTML = "Count: " + this.count;
        subElement.id = "COUNT";
        element.appendChild(subElement);
        return element;
    },

    // Notification handler.
    notificationReceived: function () {

    },

    // Socket notification handler.
    socketNotificationReceived: function () {

    },

});*/
