# Module: Digitransit Stoptimetable
Allow to display public transport stop times using digitransit.
## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: "digitransit",
		position: "top_left",
		config: {
			// See below.
		}
	}
]
````

## Configuration options

The following properties can be configured:

| Option | Description
| ------ | -----------
| `updateInterval` | Interval in which the data is fetched from Digitransit API. Default: 30000 (30 seconds)|
| `changeInterval` | Interval in which the stops are cycled through and UI otherwise refreshed. Default: 5000 (5 seconds)|
| `fadeSpeed` | Default: 0|
| `routeNameLength` | Length in characters to which the route names (headsign) are truncated if longer. Default: 20|,
| `realTimeSign` | String used to mark the real time departure time. Default: " "|
| `scheduledSign` | String used to mark the scheduled departure time. Default: "~"|
| `width` | Minimum width of the timetable widget specified in pixels. Table will expand further if content doesn't fit in. Default 500|
| `stops` | Array of stops to show and cycle through. In theory, any number of stops is supported. Still I recommend maximum of 5-6 stops because stop data is fetched individually and more stops slows down this process. And to keep the scrolling nice and somewhat smooth the number of stops shouldn't exceed `updateInterval/changeInterval` (division between `updateInterval` and `changeInterval`). Default: ["HSL:2331207","HSL:2332207",]|
