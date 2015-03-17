/*
Copyright (C) 2011-2014 Jesus Perez,
Copyright (C) 2014-2015 Timothy Martin & GitHub Contributors,
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.
 
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License at <http://www.gnu.org/licenses/>
for more details.
*/

// Common theme for all the charts.
if (typeof Highcharts !== 'undefined') {

	Highcharts.theme = {
		lang: {
			thousandsSep: ","
		},
	
		chart: {
			animation: {
				duration: 500
	        },
	        plotBorderWidth: 0,
			marginRight: 65,
			// FIXME: only set the zoomType if we're not touch
			zoomType: 'none'
		},
		colors: ['black'],
		credits: {
			enabled: false
		},
		global: {
			// the datastream is stored in local timezone in the database,
			// so turn off the UTC default for highcharts.
			useUTC: false
		},
		legend: {
			borderColor: '#BBB',
			borderWidth: 0.5,
			borderRadius: 4,
			itemStyle: {
				fontSize: '11px'
			}
		},
		plotOptions: {
			series: {
				turboThreshold: 1750
			},
			column: {
				borderWidth: 0,
				pointPadding: 0,		
				groupPadding: 0.25,	
				shadow: false,
				cursor: 'pointer',
				stickyTracking: false,
				stacking: 'normal'
			},
			line: {
				stickyTracking: true,
				lineWidth: 1.5,
				marker: {
					enabled: false,
					symbol: 'circle',
					lineColor: null, // inherit from series color
					fillColor: null, // inherit from series color
					states: {
						hover: {
							enabled: true,
							radius: 3,
							lineWidth: 2,
							lineColor: '#FFFFFF'
						}
					}
				},
				states: {
					hover: {
						halo: {
							opacity: 1,
							size: 5
						},
						lineWidth: 1.5,
						lineWidthPlus: 0
					}
				}
			},
			areaspline: {
				fillOpacity: 0.25,
				lineWidth: 0,
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: false
						}
					}				
				},
				states: {
					hover: {
						lineWidthPlus: 0
					}
				},
				showInLegend: true,
				zIndex: -1
			},
			spline: {
				cursor: 'pointer',
				lineWidth: 1.5,
				dashStyle: 'shortdot',
				marker: {
					enabled: true,
					fillColor: 'black',
					lineColor: 'rgba(255,255,255,0.5)',
					lineWidth: 0,
					radius: 2,
					symbol: 'circle',
					states: {
						hover: {
							enabled: true,
							radius: 3,
							lineWidth: 1,
							lineColor: '#FFFFFF',
						}
					}
				},
				states: {
					hover: {
						enabled: false
					}
				}
			}
		},
		title: {
		   text: null
		},
		tooltip: {
			shared: true,
			borderColor: '#333333',
			crosshairs: true,
			style: {
				color: '#333333',
				fontSize: '10px',
				padding: '6px'
			},
			dateTimeLabelFormats: {
				minute: "%l:%M%P",
				hour: "%l:%M%P",
				day: "%l:%M%P"
			}
	
		},
		xAxis: {
			dateTimeLabelFormats: {
				minute: '%l:%M%P',
				hour: '%l%P',
				day: '%m/%d'
			},
			minorTickInterval: 1000 * 60 * 60,
			minorTickWidth: 1,
			minorGridLineWidth: 0,
			title: {
				text: null
			},
			type: 'datetime'
		},
		yAxis: {
			endOnTick: true,
			maxPadding: 0.01,
			opposite: true,
			title: {
				text: null
			}
		}
	};	
}


function get_cc_charge_power() {

	/*global deviceLabel, full_day_data */
	var total_day_data_watts = [];
	var day_data_watts = [];
	var all_devices_data = [];
	var count;

	for (var port in full_day_data[CC_ID]) {
		// port interates through each FM/MX charge controllers

		if (port != "totals") {
			day_data_watts[port] = [];
		}

		for (y = 0; y < full_day_data[CC_ID][port].length; y++) {
			// y is the datapoint (from 0 to n)

			if (port == "totals") {

				total_watts = (full_day_data[CC_ID][port][y].total_current) * 1 * full_day_data[CC_ID][port][y].battery_volts;
				total_day_data_watts[y] = [full_day_data[CC_ID][port][y].timestamp, total_watts];
				
			} else {
	
				// make an object with some extra data (charge mode) that we can display in tooltips.
				day_data_watts[port][y] = {
					x: full_day_data[CC_ID][port][y].timestamp,
					y: (full_day_data[CC_ID][port][y].charge_current * full_day_data[CC_ID][port][y].battery_volts),
					mode: "(" + full_day_data[CC_ID][port][y].charge_mode + ")"
				};
			}
		}
	}


	// Set up each series.
	for (var i in day_data_watts) {
		device_data = {
//			color: cfg_colorProduction,
			data: day_data_watts[i],
			name: deviceLabel[i],
			type: 'line',
		};
		all_devices_data.push(device_data);
	}

	// If there was a total, set up that series
	if (total_day_data_watts.length > 0) {
		total_data = {
			color: cfg_colorProduction,
			data: total_day_data_watts,
			name: 'Total',
			type: 'areaspline'
		};
		all_devices_data.push(total_data);
	}
	
	chart_options = {
		colors: cfg_colorsChargers,
		series: all_devices_data,
		tooltip: {
			shared: true,
			useHTML: true,
			headerFormat: '<table class="tooltip"><th colspan="3">{point.key}</th>',
			pointFormat: '<tr><td class="figure">{point.y}</td><td style="color:{series.color};">&#9679;</td><td>{series.name} {point.mode}</td></tr>',
			footerFormat: '</table>',
			dateTimeLabelFormats: {
				hour: '%l:%M%P'
			},
			valueDecimals: 0,
			valueSuffix: ' Watts'
		},
    	yAxis: {
    		min: 0,
    		minRange: cfg_pvWattage/3,
		    labels: {
				formatter: function () {
					return (this.value/1000).toFixed(1) + ' kW'
				}
		    }
		}
	};

	return chart_options;

}


function get_cc_charge_current() {

	/*global deviceLabel, full_day_data */
	var total_day_data_amps = [];
	var day_data_amps = [];
	var all_devices_data_amps = [];
	var count;

	for (var port in full_day_data[CC_ID]) {

		if (port != "totals") {
			day_data_amps[port] = []
		}

		for (y = 0; y < full_day_data[CC_ID][port].length; y++) {
			
			if (port == "totals") {

				total_amps = parseInt(full_day_data[CC_ID][port][y].total_current);
				total_day_data_amps[y] = [full_day_data[CC_ID][port][y].timestamp, total_amps];

			} else {

				// make an object with some extra data (charge mode) that we can display in tooltips.
				day_data_amps[port][y] = {
					x: full_day_data[CC_ID][port][y].timestamp,
					y: parseInt(full_day_data[CC_ID][port][y].charge_current),
					mode: "(" + full_day_data[CC_ID][port][y].charge_mode + ")"
				};
			}
		}
	}

	// Set up each series
	for (var i in day_data_amps) {
		device_data = {
			data: day_data_amps[i],
			name: deviceLabel[i],
			type: 'line',
		};
		all_devices_data_amps.push(device_data);
	}
		
	// If there was a total, set up that series
	if (total_day_data_amps.length > 0) {
		total_data = {
			color: cfg_colorProduction,
			data: total_day_data_amps,
			name: 'Total',
			type: 'areaspline'
		};
		all_devices_data_amps.push(total_data);
	}

	chart_options = {
		colors: cfg_colorsChargers,
	    series: all_devices_data_amps,
		tooltip: {
			shared: true,
			useHTML: true,
			headerFormat: '<table class="tooltip"><th colspan="3">{point.key}</th>',
			pointFormat: '<tr><td class="figure">{point.y}</td><td style="color:{series.color};">&#9679;</td><td>{series.name} {point.mode}</td></tr>',
			footerFormat: '</table>',
			dateTimeLabelFormats: {
				hour: '%l:%M%P'
			},
			valueDecimals: 0,
			valueSuffix: ' Amps'
		},
    	yAxis: {
    		min: 0,
    		minRange: cfg_pvWattage/cfg_sysVoltage/3,
		    labels: {
		        format: '{value} A'
		    }
		}
	};

	return chart_options;

}


function get_cc_input_volts() {

	/*global deviceLabel, full_day_data */
	var total_day_data__array_volts = [];
	var day_data_array_volts = [];
	var all_devices_data_array_volts = [];

	for (var port in full_day_data[CC_ID]) { 

		if (port != "totals") {	

			day_data_array_volts[port] = []
	
			for (y = 0; y < full_day_data[CC_ID][port].length; y++) {

				// make an object with some extra data (charge mode) that we can display in tooltips.
				day_data_array_volts[port][y] = {
					x: full_day_data[CC_ID][port][y].timestamp,
					y: parseFloat(full_day_data[CC_ID][port][y].pv_voltage),
					mode: "(" + full_day_data[CC_ID][port][y].charge_mode + ")"
				};
			}
		}
	}

	for (var i in day_data_array_volts) {

		series = {
			data: day_data_array_volts[i],
			name: deviceLabel[i]
		};
		all_devices_data_array_volts.push(series);

	}

	chart_options = {
		colors: cfg_colorsChargers,
		series: all_devices_data_array_volts,
		tooltip: {
			shared: true,
			useHTML: true,
			headerFormat: '<table class="tooltip"><th colspan="3">{point.key}</th>',
			pointFormat: '<tr><td class="figure">{point.y}</td><td style="color:{series.color};">&#9679;</td><td>{series.name} {point.mode}</td></tr>',
			footerFormat: '</table>',
			dateTimeLabelFormats: {
				hour: '%l:%M%P'
			},
			valueDecimals: 0,
			valueSuffix: ' Volts'
		},
		yAxis: {
		    labels: {
		        format: '{value} V'
			},
    		min: 0
		}
	};

	return chart_options;

}


function get_cc_input_current() {

	/*global deviceLabel, full_day_data */
	var total_day_data__array_amps = [];
	var day_data_array_amps = [];
	var all_devices_data_array_amps = []

	for (var port in full_day_data[CC_ID]) { 

		if (port != "totals") {	

			day_data_array_amps[port] = []
		
			for (y = 0; y < full_day_data[CC_ID][port].length; y++) {

				// make an object with some extra data (charge mode) that we can display in tooltips.
				day_data_array_amps[port][y] = {
					x: full_day_data[CC_ID][port][y].timestamp,
					y: parseFloat(full_day_data[CC_ID][port][y].pv_current),
					mode: "(" + full_day_data[CC_ID][port][y].charge_mode + ")"
				};
			}
		}
	}

	for (var i in day_data_array_amps) {

		series = {
			data: day_data_array_amps[i],
			name: deviceLabel[i]
		};

		all_devices_data_array_amps.push(series);		
	}

	chart_options = {
		colors: cfg_colorsChargers,
	    series: all_devices_data_array_amps,
		tooltip: {
			shared: true,
			useHTML: true,
			headerFormat: '<table class="tooltip"><th colspan="3">{point.key}</th>',
			pointFormat: '<tr><td class="figure">{point.y}</td><td style="color:{series.color};">&#9679;</td><td>{series.name} {point.mode}</td></tr>',
			footerFormat: '</table>',
			dateTimeLabelFormats: {
				hour: '%l:%M%P'
			},
			valueDecimals: 0,
			valueSuffix: ' Amps'
		},
    	yAxis: {
    		min: 0,
    		minRange: cfg_pvWattage/cfg_sysVoltage/3,
		    labels: {
		        format: '{value} A'
		    }, 
		}
	};

	return chart_options;

}


function get_battery_volts() {

	/*global full_day_data */
	var day_data_volts = [];
	var day_data_target = [];

	if (full_day_data[FNDC_ID]) {
		// if you have a fndc, get the data from there
		for (var port in full_day_data[FNDC_ID]) {

			for (j = 0; j < full_day_data[FNDC_ID][port].length; j++) {
				day_data_volts[j] = [full_day_data[FNDC_ID][port][j].timestamp, parseFloat(full_day_data[FNDC_ID][port][j].battery_volt)];
				// 0.005 V per 2 V cell, per 1 degree C above or below 25° -- target voltage goes up when cold and down when hot
				temp_compensation = (0.005) * (cfg_sysVoltage/2) * (parseInt(full_day_data[FNDC_ID][port][j].battery_temp) - 25);
				voltage_target = cfg_sysAbsorbVoltage - temp_compensation - 0.25; //fudge factor
				day_data_target[j] = [full_day_data[FNDC_ID][port][j].timestamp, voltage_target];
			}

		}
	} else {
		// if you don't have a fndc, use the charge controller to get voltage.
		for (var port in full_day_data[CC_ID]) {

			for (j = 0; j < full_day_data[CC_ID][port].length; j++) {
				day_data_volts[j] = [full_day_data[CC_ID][port][j].timestamp, parseFloat(full_day_data[CC_ID][port][j].battery_volts)];
			}

		}
	}

	chart_options = {
	    legend: {
	    	enabled: false  
	    },
	    series: [{
			name: 'Absorb Voltage',
			color: 'Black',
			dashStyle: 'shortdash',
			lineWidth: 1,
			enableMouseTracking: false,
			data: day_data_target
	    },{
			name: 'Volts',
			color: cfg_colorUsage,
			data: day_data_volts
	    }],
		tooltip: {
			shared: false,
			formatter: function() {
				var string1 = Highcharts.dateFormat('%l:%M%P', this.x);
				var string2 = this.y.toFixed(1) + ' Volts';
				return '<strong>' + string1 + '</strong><br/>' + string2;
			}
		},
    	yAxis: {
    		labels: {
		        format: '{value} V'
		    },
    		minRange: cfg_sysVoltage/6,
//			plotLines: [{
//				color: '#00bb00',
//				width: 1.5,
//				value: cfg_sysAbsorbVoltage
//			}],
		    plotBands: [{
		    	// red for below the system voltage plus a tad: 12.2, 24.4, or 48.8
                color: '#ffedee',
                from: 0,
				to: cfg_sysVoltage
			}]
		},
	};

	return chart_options;

}


function get_fndc_soc() {

	/*global full_day_data */
	day_data_soc = [];

	if (full_day_data[FNDC_ID]) {

		for (var port in full_day_data[FNDC_ID]) {

			for (j = 0; j < full_day_data[FNDC_ID][port].length; j++) {
				day_data_soc[j] = [full_day_data[FNDC_ID][port][j].timestamp, parseInt(full_day_data[FNDC_ID][port][j].soc)];
			}

		}

	}

	chart_options = {
	    legend: {
	    	enabled: false  
	    },
	    series: [{
			name: 'Charge',
			color: cfg_colorUsage,
			data: day_data_soc
	    }],
		tooltip: {
			shared: false,
			formatter: function() {
				var string1 = Highcharts.dateFormat('%l:%M%P', this.x);
				var string2 = this.y + '%';
				return '<strong>' + string1 + '</strong><br/>' + string2;
			}
		},
    	yAxis: {
    		tickInterval: 10, // I feel confident that we'd like to just see 10% intervals on the SOC chart
    		max: 100,
    		min: 50, // I go back and forth on if the bottom yAxis should be dynamic or not.
		    labels: {
		        format: '{value}%'
		    },
		    plotBands: [{
		    	// red from 0 to 59
                color: '#ffedee',
                from: 0,
                to: 59.9
            } , {
            	// yellow from 60 to 79
				color: '#ffffe1',
				from: 60,
				to: 79.9
            } , {
				// green from 80 to 100
				color: '#dfffe0',
				from: 80,
				to: 100
            }]
		},
	};

	return chart_options;

}


function get_fndc_shunts() {

	/*global full_day_data, shuntLabel */
	var day_data_shunt_a = [];
	var day_data_shunt_b = [];
	var day_data_shunt_c = [];
	var day_data_net = [];

	for (var port in full_day_data[FNDC_ID]) {
		for (i = 0; i < full_day_data[FNDC_ID][port].length; i++) {
			// each "i" is an object with all data for a given timestamp

			shunt_a_watts = full_day_data[FNDC_ID][port][i].shunt_a_amps * full_day_data[FNDC_ID][port][i].battery_volt;
			shunt_b_watts = full_day_data[FNDC_ID][port][i].shunt_b_amps * full_day_data[FNDC_ID][port][i].battery_volt;
			shunt_c_watts = full_day_data[FNDC_ID][port][i].shunt_c_amps * full_day_data[FNDC_ID][port][i].battery_volt;
			net_watts     = shunt_a_watts + shunt_b_watts + shunt_c_watts;
			
			day_data_shunt_a[i] = [full_day_data[FNDC_ID][port][i].timestamp, shunt_a_watts];
			day_data_shunt_b[i] = [full_day_data[FNDC_ID][port][i].timestamp, shunt_b_watts];
			day_data_shunt_c[i] = [full_day_data[FNDC_ID][port][i].timestamp, shunt_c_watts];
			day_data_net[i]     = [full_day_data[FNDC_ID][port][i].timestamp, net_watts];
		}
		break; // Only one iteration. there should be only one FNDC.
	}

	chart_options = {
		chart: {
			type: 'line'
		},
    	yAxis: {
		    labels: {
				formatter: function () {
					return (this.value/1000).toFixed(1) + ' kW'
				}
		    },
		    minRange: 1000
		},
		tooltip: {
			shared: true,
			useHTML: true,
			headerFormat: '<table class="tooltip"><th colspan="3">{point.key}</th>',
			pointFormat: '<tr><td class="figure">{point.y}</td><td style="color:{series.color}">&#9679;</td><td>{series.name}</td></tr>',
			footerFormat: '</table>',
			dateTimeLabelFormats: {
				hour: '%l:%M%P'
			},
			valueDecimals: 0,
			valueSuffix: ' Watts'
		},
	    series: [{
	    	name: shuntLabel[1],
	    	color: cfg_colorShuntA,
			data: day_data_shunt_a
		}, {
		    name: shuntLabel[2],
	    	color: cfg_colorShuntB,
			data: day_data_shunt_b
		}, {
		    name: shuntLabel[3],
	    	color: cfg_colorShuntC,
			data: day_data_shunt_c
		}, {
			name: "Net",
			type: 'areaspline',
			color: cfg_colorProduction,
			negativeColor: cfg_colorUsage,
			data: day_data_net
	    }]
	};

	return chart_options;
}


function get_fndc_amps_vs_volts() {

	/*global full_day_data */
	var day_data_volts = [];
	var day_data_amps = [];

	
	for (var port in full_day_data[FNDC_ID]) {
		for (i = 0; i < full_day_data[FNDC_ID][port].length; i++) {
			shunt_a_amps = parseFloat(full_day_data[FNDC_ID][port][i].shunt_a_amps);
			shunt_b_amps = parseFloat(full_day_data[FNDC_ID][port][i].shunt_b_amps);
			shunt_c_amps = parseFloat(full_day_data[FNDC_ID][port][i].shunt_c_amps);
			net_amps     = shunt_a_amps + shunt_b_amps + shunt_c_amps;

			day_data_amps[i]  = [full_day_data[FNDC_ID][port][i].timestamp, net_amps];
			day_data_volts[i] = [full_day_data[FNDC_ID][port][i].timestamp, parseFloat(full_day_data[FNDC_ID][port][i].battery_volt)];
		}
	}
	
	
	chart_options = {
	    chart: {
		    marginLeft: 65,
	    },
	    series: [{
			name: 'Volts',
			color: cfg_colorUsage,
			data: day_data_volts,
			yAxis: 0			
	    }, {
			name: "Amps",
			color: cfg_colorProduction,
			data: day_data_amps,
			yAxis: 1
	    }],
		tooltip: {
			shared: true,
			useHTML: true,
			headerFormat: '<table class="tooltip"><th colspan="3">{point.key}</th>',
			pointFormat: '<tr><td class="figure">{point.y}</td><td style="color:{series.color}">&#9679;</td><td>{series.name}</tr>',
			footerFormat: '</table>',
			dateTimeLabelFormats: {
				hour: '%l:%M%P'
			},
			valueDecimals: 1
		},
    	yAxis: [{ // primary axis
			endOnTick: true,
    		labels: {
		        format: '{value} V'
		    },
    		minRange: cfg_sysVoltage/6,
    		opposite: false
		}, { // secondary axis
			endOnTick: true,
			labels: {
		        format: '{value} A'
		    },
		    opposite: true
		}]
	};

	return chart_options;

}

function get_fndc_net_ah() {

	/*global full_day_data */
	var day_data_netAh = [];
	var day_data_compensatedAh = [];

	
	for (var port in full_day_data[FNDC_ID]) {
		for (i = 0; i < full_day_data[FNDC_ID][port].length; i++) {
			netAh  = parseFloat(full_day_data[FNDC_ID][port][i].accumulated_ah_shunt_a);
			netAh += parseFloat(full_day_data[FNDC_ID][port][i].accumulated_ah_shunt_b);
			netAh += parseFloat(full_day_data[FNDC_ID][port][i].accumulated_ah_shunt_c);
			compensatedAh = parseFloat(full_day_data[FNDC_ID][port][i].charge_factor_corrected_net_batt_ah);

			day_data_netAh[i]  = [full_day_data[FNDC_ID][port][i].timestamp, netAh];
			day_data_compensatedAh[i] = [full_day_data[FNDC_ID][port][i].timestamp, compensatedAh];
		}
	}
	
	
	chart_options = {
	    legend: {
	    	enabled: true
	    },
	    series: [{
			name: "Net",
			color: cfg_colorUsage,
			data: day_data_netAh,
	    }, {
			name: 'Corrected',
			color: cfg_colorProduction,
			data: day_data_compensatedAh,
	    }],
		tooltip: {
			shared: true,
			useHTML: true,
			headerFormat: '<table class="tooltip"><th colspan="3">{point.key}</th>',
			pointFormat: '<tr><td class="figure">{point.y}</td><td style="color:{series.color}">&#9679;</td><td>{series.name}</td></tr>',
			footerFormat: '</table>',
			dateTimeLabelFormats: {
				hour: '%l:%M%P'
			},
			valueDecimals: 1,
			valueSuffix: ' Ah'
//			formatter: function() {
//				tipTitle = Highcharts.dateFormat('%l:%M%P', this.x);
//				tipSeries = '';
//				for (var i = 0; i < this.points.length; i++) {
//					string = '<tr><td class="figure">' + this.points[i].y.toFixed(1) + '</td><td> ' + this.points[i].series.name + '</td></tr>';
//					tipSeries = tipSeries + string;
//				}
//				toolTip =	'<table class="tooltip"><th colspan="2">' + tipTitle + '</th>' + tipSeries + '</table>';
//				return toolTip;				
//			}
		},
    	yAxis: {
			labels: {
		        format: '{value} Ah'
		    },
		}
//    	yAxis: [{ // primary axis
//			labels: {
//		        format: '{value} A'
//		    },
//    		opposite: false
//		}, { // secondary axis
//    		labels: {
//		        format: '{value} V'
//		    },
//    		minRange: cfg_sysVoltage/6,
//		    opposite: true
//		}]
	};

	return chart_options;

}


function chart_years(date) {

	/*global years_data */
	var years_data_kwhin = [];
	var years_data_kwhout = [];
	var years_net_kwh = [];

	if (!date) {
		date = get_formatted_date();
	}
	
	//Get all years in database		
	status = $.ajax({
		async: false,
		type: 'GET',
		dataType: 'json',
//		url: 'getstatus.php?q=years&date=' + date,
		url: 'getstatus.php?q=years',
		success: function (data) {
			years_data = data;
		}
	})

	// TODO:	let's not show ALL the years... I think just five.
	// 			currently the plot function has a 5 year max range, but don't know what that does, last five? first five?

	//Fill array with series
	for (i = 0; i < years_data.length; i++) {

//		split_date = years_data[i].date.split(/[- :]/);	// split the YYYY-MM-DD into an array
//		comp_date = new Date(split_date[0], 0, 1);				// use the year to make a date object for jan 1st of that year
		comp_date = new Date(years_data[i].year);				// use the year to make a date object for jan 1st of that year
		year = comp_date.getTime();								// turn it into millisecond timestamp

		kwh_in = Math.round(years_data[i].kwh_in);
		kwh_out = Math.round(years_data[i].kwh_out);

		years_data_kwhin[i] = [year, kwh_in];
		years_data_kwhout[i] = [year, -kwh_out];
		
		years_net_kwh[i] = [year, (kwh_in - kwh_out)];
	}

	$('#years_chart').highcharts({
		chart: {
			type: 'column',
			marginTop: 20,
			zoomType: 'none'
		},
		legend: {
			enabled: false
		},
		plotOptions: {
			series: {
				pointRange: 24 * 3600 * 1000 * 365	// 1 year
			}
		},
	    series: [{
	    	name: 'Production',
	    	color: cfg_colorProduction,
	        data: years_data_kwhin
		}, {
		    name: 'Usage',
	    	color: cfg_colorUsage,
			data: years_data_kwhout
		}, {
	        name: 'Net',
	        type: 'spline',
	        data: years_net_kwh,
	    }],
	    tooltip: {
    		crosshairs: false,
			formatter: function() {
				tipTitle = Highcharts.dateFormat('%Y', this.x);
				tipSeries = '';
				for (var i = 0; i < this.points.length; i++) {
					string = this.points[i].y + ' kWh ' + this.points[i].series.name;
					tipSeries = tipSeries + '<br/>' + string;
				}
				return '<strong>' + tipTitle + '</strong>' + tipSeries;
			}
		},
	    xAxis: {
			dateTimeLabelFormats: {
				year: '%Y'
			},
			maxRange: 157785000000, 				// 5 years in milliseconds
			minorTickWidth: 0,						// no minor ticks
			tickInterval: 24 * 3600 * 1000 * 365	// 1 year
	    }
	});

}


function chart_months(date) {

	/*global months_data */
	var months_data_kwhin = [];
	var months_data_kwhout = [];
	var months_net_kwh = [];
	
	if (!date) {
		date = get_formatted_date();
	}

	$.ajax({
		async: false,
		type: 'GET',
		dataType: 'json',
//		url: 'getstatus.php?q=months&date=' + date,
		url: 'getstatus.php?q=months',
		success: function (data) {
			months_data = data;

		}
	});


	//Fill array with series
	for (i = 0; i < months_data.length; i++) {

		split_date = months_data[i].month.split(/[- :]/);			// split the YYYY-MM-DD into an array
		month_date = new Date(split_date[0], split_date[1] - 1, 1);	// use the month to make a date object for the 1st of the month
		month = month_date.getTime();								// turn it into millisecond timestamp

		kwh_in  = Math.round(months_data[i].kwh_in);
		kwh_out = Math.round(months_data[i].kwh_out);
		
		months_data_kwhin[i]  = [month, kwh_in];
		months_data_kwhout[i] = [month, -kwh_out];

		months_net_kwh[i] = [month, (kwh_in - kwh_out)];

	}

	$('#months_chart').highcharts({
		chart: {
			type: 'column',
			marginTop: 20,
			zoomType: 'none'
		},
		legend: {
			enabled: false
		},
		plotOptions: {
			series: {
				pointRange: 24 * 3600 * 1000 * 30	// one month
			}
		},
	    series: [{
	        name: 'Production',
	        color: cfg_colorProduction,
	        data: months_data_kwhin,
		}, {
	        name: 'Usage',
	        color: cfg_colorUsage,
	        data: months_data_kwhout,
	    }, {
	        name: 'Net',
	        type: 'spline',
	        data: months_net_kwh,
	    }],
	    tooltip: {
    		crosshairs: false,
			formatter: function() {
				tipTitle = Highcharts.dateFormat('%B', this.x);
				tipSeries = '';
				for (var i = 0; i < this.points.length; i++) {
					string = this.points[i].y + ' kWh ' + this.points[i].series.name;
					tipSeries = tipSeries + '<br/>' + string;
				}
				return '<strong>' + tipTitle + '</strong>' + tipSeries;
			}
		},
	    xAxis: {
			dateTimeLabelFormats: {
				month: '%b'
			},
			maxRange: 31600000000,					// 1 year in milliseconds
			minorTickWidth: 0,						// no minor ticks
			tickInterval: 24 * 3600 * 1000 * 30		// 1 month
	    }
	});

}


function chart_days(date) {

	/*global days_data, display_date */
	var days_data_kwhin = [];
	var days_data_kwhout = [];
	var days_net_kwh = [];
	var days_total_kwhin = 0;
	var days_total_kwhout = 0;
	var days_avg_kwhin = 0;
	var days_avg_kwhout = 0;
		
	if (date) {
		var statusURL = 'getstatus.php?q=days&date=' + date;
	} else {
		var statusURL = 'getstatus.php?q=days';
	}

	$.ajax({
		async: false,
		type: 'GET',
		dataType: 'json',
		url: statusURL,
		success: function (data) {
			days_data = data;
		}
	});

	//Fill array with series
	for (i = 0; i < days_data.length; i++) {
			
		day = days_data[i].timestamp;	
			
		days_data_kwhin[i]  = [day, parseFloat(days_data[i].kwh_in)];
		days_data_kwhout[i] = [day, -parseFloat(days_data[i].kwh_out)];
		
		days_net_kwh[i] = [day, (parseFloat(days_data[i].kwh_in) - parseFloat(days_data[i].kwh_out))];
		
		days_total_kwhin += parseFloat(days_data[i].kwh_in);
		days_total_kwhout -= parseFloat(days_data[i].kwh_out);
	}

	days_avg_kwhin = days_total_kwhin/days_data.length;
	days_avg_kwhout = days_total_kwhout/days_data.length;
	
	$('#days_chart').highcharts({
		chart: {
			type: 'column',
			marginTop: 20,
			zoomType: 'none'
		},
		plotOptions: {
			series: {
				point: {
					events: {
						click: function() {
							// FIXME: maybe i shouldn't be using a global variable?
							display_date = get_formatted_date(this.x);
							// tricky way to get the document name from the path.
							var page = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
							// remove the query string, if there is one.
							page = page.split("?")[0];

							switch (page) {
								case "historical.html":
									refresh_data();
									break;
								default:
									location.assign('historical.html?date=' + display_date);
									break;
							}
						}
					}
				}
			}
		},
	    series: [{
			name: 'Production',
			color: cfg_colorProduction,
			data: days_data_kwhin,
		}, {
	        name: 'Usage',
			color: cfg_colorUsage,
	        data: days_data_kwhout,
	    }, {
	        name: 'Net',
	        type: 'spline',
	        data: days_net_kwh,
	    }],
	    tooltip: {
    		crosshairs: false,
			formatter: function() {
				tipTitle = Highcharts.dateFormat('%A, %b %e', this.x);
				tipSeries = '';
				for (var i = 0; i < this.points.length; i++) {
					if (this.points[i].series.name == "Net") {
						string = '<tr class="total"><td class="figure">' + this.points[i].y.toFixed(1) + '</td><td> kWh ' + this.points[i].series.name + '</td></tr>';
					} else {
						string = '<tr><td class="figure">' + this.points[i].y.toFixed(1) + '</td><td> kWh ' + this.points[i].series.name + '</td></tr>';
					}
					tipSeries = tipSeries + string;
				}
				toolTip =	'<table class="tooltip"><th colspan="2">' + tipTitle + '</th>' + tipSeries + '</table>';
				return toolTip;
			},
			useHTML: true
		},
	    xAxis: {
			dateTimeLabelFormats: {
				day: '%e'
			},
	    	minRange: 2630000000,					// 1 month in milliseconds
			minorTickWidth: 0,						// no minor ticks
			tickInterval: 24 * 3600 * 1000,			// 1 day
	    },
	    yAxis: {
			plotLines: [{
				color: cfg_colorProduction,
				dashStyle: 'shortdash',
				label: {
					align: 'left',
					style: {
						backgroundColor: 'rgba(255,255,255,0.75)',
						fontSize: '10px'
					},
					text: days_avg_kwhin.toFixed(1) + 'kWh',
					useHTML: false,
					verticalAlign: 'top',
					x: -1,
					y: -4
				},
				value: days_avg_kwhin,
				width: 1,
				zIndex: 5,
			},{
				color: cfg_colorUsage,
				dashStyle: 'shortdash',
				label: {
					align: 'left',
					style: {
						backgroundColor: 'rgba(255,255,255,0.75)',
						fontSize: '10px'
					},
					text: days_avg_kwhout.toFixed(1) + 'kWh',
					useHTML: false,
					x: -1,
					y: 11
				},
				value: days_avg_kwhout,
				width: 1,
				zIndex: 5,
			}]
	    },
	});

}