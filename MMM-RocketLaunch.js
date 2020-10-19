"use strict";

Module.register("MMM-RocketLaunch", {
    jsonData: null,

    //Default config
    defaults: {
        url: "https://fdo.rocketlaunch.live/json/launches?key=",
        apiKey: "",
        keepColumns: [],
        size: 0,
        updateInterval: 600000
    },

    // Define style sheet
    getStyles: function () {
        return ["MMM-RocketLaunch.css"];
    },

    start: function () {
        this.getJson();
        var self = this;
        setInterval(function() {
            self.getJson();
            self.updateDom(50);
        }, this.config.updateInterval);
    },

    getJson: function () {
 //       this.config.url = this.config.url + this.config.apiKey;
//        console.log(this.config.url);
        this.sendSocketNotification("MMM-RocketLaunch_GET_JSON", this.config.url+this.config.apiKey)
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "MMM-RocketLaunch_JSON_RESULT") {
            console.log(payload.url === this.config.url+this.config.apiKey);

            if (payload.url === this.config.url+this.config.apiKey) {
                this.jsonData = payload.data;
                for (var cKey in this.jsonData) if (this.jsonData.hasOwnProperty(cKey));
                console.log("Update - line 42");
                this.updateDom(500);
            }
        }
    },

    // Override dom
    getDom: function () {
        var today = new Date();
        var wrapper = document.createElement("div");
        wrapper.className = "medium";
        wrapper.innerHTML = "";

        if (!this.jsonData) {
            wrapper.innerHTML = "Awaiting JSON data..."
            return wrapper;
        }

        var table = document.createElement("table");
        var tbody = document.createElement("tbody");

        var items = [];
        items = this.jsonData["result"];

        console.log(items);

        // Check that result is an array
        if (!(items instanceof Array)) {
            wrapper.innerHTML = "Retrieved data is not an array"
            return wrapper;
        }

        items.forEach((element) => {
            if (element["win_open"]) {
                var hourDiff = (new Date(element["win_open"]) - today) / 3.6e6;
                var t0Exist = element["t0"];
                var line = {
                    vehicleCompany: element.provider["name"],
                    vehicleModel: element.vehicle["name"],
                    locationName: element.pad.location["name"],
                    locationCountry: element.pad.location["country"],
                    locationState: element.pad.location["statename"],
                    missionName: element.missions[0]["name"]/*,
                    launchtime: moment(element["win_open"]).format("llll") + " (" + moment(element["win_open"]).endOf('hour').fromNow() + ")"/*,
                    hoursToLaunch: moment(element["win_open"]).endOf('hour').fromNow()*/
                }
                if (hourDiff < 0.5) {
					if (t0Exist == null) {
						line.launchOngoing = moment(element["win_open"]).format("llll") + " (" + moment(element["win_open"]).endOf('hour').fromNow() + ")";
					} else {
						line.launchOngoing = this.getFormattedValue(element["t0"]);
					}
				}
				else if (hourDiff > 0.5 && hourDiff < 1.5) {
					line.launchTime01 = moment(element["win_open"]).format("llll") + " (" + moment(element["win_open"]).endOf('hour').fromNow() + ")";
				}
				else if (hourDiff > 1.5 && hourDiff < 3) {
					line.launchTime03 = moment(element["win_open"]).format("llll") + " (" + moment(element["win_open"]).endOf('hour').fromNow() + ")";
				}
				else if (hourDiff > 3 && hourDiff < 6) {
					line.launchTime06 = moment(element["win_open"]).format("llll") + " (" + moment(element["win_open"]).endOf('hour').fromNow() + ")";
				}
				else if (hourDiff > 6 && hourDiff < 24) {
					line.launchTime24 = moment(element["win_open"]).format("llll") + " (" + moment(element["win_open"]).endOf('hour').fromNow() + ")";
				}
				else if (hourDiff > 24 && hourDiff < 72) {
					line.launchTime72 = moment(element["win_open"]).format("llll") + " (" + moment(element["win_open"]).endOf('hour').fromNow() + ")";
				}
				else {
					line.launchTime = moment(element["win_open"]).format("llll") + " (" + moment(element["win_open"]).endOf('hour').fromNow() + ")";
				}                
                var row = this.getTableRow(line);
                tbody.appendChild(row);
//                console.log(row);
            }
            return wrapper
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

            var displayedValue = "";

            displayedValue = jsonObject[key];

            if (displayedValue == null) {
                displayedValue ="";
            }

            var cellText = document.createTextNode(displayedValue);

            cell.appendChild(cellText);

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
