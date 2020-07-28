# MMM-RocketLaunch

This is a module for [MagicMirror²](https://github.com/MichMich/MagicMirror/).

This module will show all future launches listed on the RocketLaunch API. This is for personal use - I do not intend offering it widely: it's way too basic for that.

It requires an API from www.rocketlaunch.live, obtained with a low cost subscription which will help support the site.

I have taken stuff from various publicly available modules and will try to remember which and thank them here.

MMM-SpaceX,
MMM-JSONTable

## Installation
1. Navigate to your MagicMirror's modules folder, and run the following command: `git clone https://github.com/NickBlakey/MMM-RocketLaunch`
2. Add the module and a valid configuration to your `config/config.js` file

## Using the module

This is an example configuration for your `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: "MMM-RocketLaunch",
            position: "middle_center",
            config: {
                api: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx, //go to rocketlaunch.live
		updateInterval: 360000000
	    }
	},
    ]
}
```
