"use strict";

Module.register("MMM-RocketLaunch", {
    jsonData: null,

    defaults: {
        url: "https://fdo.rocketlaunch.live/json/launches?key=",
        apiKey: "",
        keepColumns: [],
        size: 0,
        updateInterval: 600000,
        maxItems: 8
    },

    getStyles: function () {
        return ["MMM-RocketLaunch.css"];
    },

    start: function () {
        this.getJson();

        var self = this;
        setInterval(function () {
            self.getJson();
            self.updateDom(50);
        }, this.config.updateInterval);
    },

    getJson: function () {
        this.sendSocketNotification(
            "MMM-RocketLaunch_GET_JSON",
            this.config.url + this.config.apiKey
        );
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "MMM-RocketLaunch_JSON_RESULT") {
            if (payload.url === this.config.url + this.config.apiKey) {
                this.jsonData = payload.data;
                this.updateDom(500);
            }
        }
    },

    getDom: function () {
        var now = new Date();
        var wrapper = document.createElement("div");
        wrapper.className = "medium";

        if (!this.jsonData) {
            wrapper.innerHTML = "Awaiting JSON data...";
            return wrapper;
        }

        var items = this.jsonData.result;

        if (!(items instanceof Array)) {
            wrapper.innerHTML = "Retrieved data is not an array";
            return wrapper;
        }

        var validItems = items.filter(function (element) {
            return element && (element.win_open || element.t0);
        });

        validItems.sort(function (a, b) {
            var timeA = new Date(a.win_open || a.t0).getTime();
            var timeB = new Date(b.win_open || b.t0).getTime();
            return timeA - timeB;
        });

        var maxItems = this.config.maxItems || 8;
        var displayItems = validItems.slice(0, maxItems);
        var hiddenCount = validItems.length - displayItems.length;

        if (displayItems.length === 0) {
            wrapper.innerHTML = "No upcoming launches found.";
            return wrapper;
        }

        var table = document.createElement("table");
        table.className = "rocketLaunchTable";

        var tbody = document.createElement("tbody");

        displayItems.forEach((element) => {
            var rowData = this.buildLaunchRowData(element, now);
            tbody.appendChild(this.getLaunchTableRow(rowData));
        });

        if (hiddenCount > 0) {
            tbody.appendChild(this.getSummaryRow(displayItems.length, validItems.length));
        }

        table.appendChild(tbody);
        wrapper.appendChild(table);

        return wrapper;
    },

    buildLaunchRowData: function (element, now) {
        var providerName =
            element.provider && element.provider.name ? element.provider.name : "";

        var vehicleName =
            element.vehicle && element.vehicle.name ? element.vehicle.name : "";

        var missionName =
            element.missions && element.missions[0] && element.missions[0].name
                ? element.missions[0].name
                : (element.name || "");

        var locationName =
            element.pad && element.pad.location && element.pad.location.name
                ? element.pad.location.name
                : "";

        var locationCountry =
            element.pad && element.pad.location && element.pad.location.country
                ? element.pad.location.country
                : "";

        var timingInfo = this.getLaunchTimingInfo(element, now);

        var vehicleText = "";
        if (providerName && vehicleName) {
            vehicleText = providerName + " " + vehicleName;
        } else if (vehicleName) {
            vehicleText = vehicleName;
        } else {
            vehicleText = providerName;
        }

        var locationText = "";
        if (locationName && locationCountry) {
            locationText = locationName + ", " + locationCountry;
        } else if (locationName) {
            locationText = locationName;
        } else {
            locationText = locationCountry;
        }

        return {
            vehicle: vehicleText,
            mission: missionName,
            location: locationText,
            time: timingInfo.text,
            timeClass: timingInfo.className
        };
    },

    getLaunchTimingInfo: function (element, now) {
        var launchTime = element.win_open || element.t0;

        if (!launchTime) {
            return {
                className: "launchTime",
                text: element.date_str || "Date TBD"
            };
        }

        var launchDate = new Date(launchTime);
        var hourDiff = (launchDate - now) / 3.6e6;

        var formattedLaunchTime =
            moment(launchTime).format("ddd HH:mm") +
            " (" +
            moment(launchTime).endOf("hour").fromNow() +
            ")";

        if (hourDiff < 0.5) {
            return {
                className: "launchOngoing",
                text: this.getFormattedValue(launchTime)
            };
        } else if (hourDiff >= 0.5 && hourDiff < 1.5) {
            return {
                className: "launchTime01",
                text: formattedLaunchTime
            };
        } else if (hourDiff >= 1.5 && hourDiff < 3) {
            return {
                className: "launchTime03",
                text: formattedLaunchTime
            };
        } else if (hourDiff >= 3 && hourDiff < 6) {
            return {
                className: "launchTime06",
                text: formattedLaunchTime
            };
        } else if (hourDiff >= 6 && hourDiff < 24) {
            return {
                className: "launchTime24",
                text: formattedLaunchTime
            };
        } else if (hourDiff >= 24 && hourDiff < 72) {
            return {
                className: "launchTime72",
                text: formattedLaunchTime
            };
        }

        return {
            className: "launchTime",
            text: formattedLaunchTime
        };
    },

    getLaunchTableRow: function (rowData) {
        var row = document.createElement("tr");

        row.appendChild(this.createCell("vehicleCol", rowData.vehicle));
        row.appendChild(this.createCell("missionCol", rowData.mission));
        row.appendChild(this.createCell("locationCol", rowData.location));
        row.appendChild(this.createCell("timeCol " + rowData.timeClass, rowData.time));

        return row;
    },

    getSummaryRow: function (shownCount, totalCount) {
        var row = document.createElement("tr");
        var cell = document.createElement("td");

        cell.className = "summaryRow";
        cell.colSpan = 4;

        var textStart = document.createTextNode("Showing ");
        var shownSpan = document.createElement("span");
        shownSpan.className = "summaryNumber";
        shownSpan.textContent = shownCount;

        var textMid = document.createTextNode(" of ");
        var totalSpan = document.createElement("span");
        totalSpan.className = "summaryNumber";
        totalSpan.textContent = totalCount;

        var textEnd = document.createTextNode(" scheduled launches");

        cell.appendChild(textStart);
        cell.appendChild(shownSpan);
        cell.appendChild(textMid);
        cell.appendChild(totalSpan);
        cell.appendChild(textEnd);

        row.appendChild(cell);
        return row;
    },

    createCell: function (className, text) {
        var cell = document.createElement("td");
        cell.className = className;
        cell.appendChild(document.createTextNode(text || ""));
        return cell;
    },

    getFormattedValue: function (input) {
        var m = moment(input);

        if (typeof input === "string" && m.isValid()) {
            if (m.isSame(new Date(), "day")) {
                return m.format("LTS");
            }
            return m.format("ddd HH:mm");
        }

        return input;
    }
});
