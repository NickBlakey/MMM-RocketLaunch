var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
	start: function () {
		console.log('MMM-RL helper started... +++++++++++++++++++++++++++++++++++++++++');
	},

	getJson: function (url) {
		var self = this;

		request({ url: url, method: 'GET' }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log("+++++++++++request++++++");
				var json = JSON.parse(body);
				// Send the json data back with the url to distinguish it on the receiving part
				self.sendSocketNotification("MMM-RL_JSON_RESULT", {url: url, data: json});
			}
		});

	},

	//Subclass socketNotificationReceived received.
	socketNotificationReceived: function (notification, url) {
		if (notification === "MMM-RL_GET_JSON") {
            console.log("RL Helper received notification +++++++++++++++++++++++++++++++++++++++++++++");
			this.getJson(url);
		}
	}
});