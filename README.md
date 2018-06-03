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
			// TODO
		}
	}
]
````

## Configuration options

The following properties can be configured:

| Option | Description
| ------ | -----------
| `stops` | Array of stop ID:s to display and cycle through.
