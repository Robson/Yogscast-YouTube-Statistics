////////////////// SHARED CODE //////////////////

function simplify(number, shorten=true, max=null) {
	number = Math.round(number);
	if (shorten) {
		if ((max == null ? number : max) >= 950000) {
			return Math.round(number / 1000000) + 'M';	
		}
		if ((max == null ? number : max) >= 9500) {
			return Math.round(number / 1000) + 'K';
		}
	}
	return Number(number).toLocaleString();
}

function formatPercent(number) {
	return (number * 100).toFixed(1) + '%';
}

function formatTime(number) {
	var hours = '';
	if (number >= 60 * 60) {
		hours = Math.floor(number / (60 * 60)) + ':';
		number %= 60 * 60;
	}
	var minutes = Math.floor(number / 60);
	var answer = hours + (minutes + '').padStart(2, '0') + ':' + ((number % 60)+'').padStart(2, '0');
	return answer.startsWith('0') ? answer.substr(1) : answer;
}

function ordinalIndicator(n) {
	var a = n % 10, b = n % 100;
	if ((b < 11 || b > 13) && a >= 1 && a <= 3) {
		return ['st', 'nd', 'rd'][--a]
	}
	return 'th';
}

function scale(num, inMin, inMax, outMin, outMax) {
	return outMin + (num - inMin) * (outMax - outMin) / (inMax - inMin);
}

function sortTable(id, n, firstDataRow, headers) {
	var table = document.getElementById(id);
	var pairs = [];
	var direction = table.rows[headers].getElementsByTagName('TH')[n].getAttribute('data-direction');
	if (!direction) {
		direction = 'dec';
	}
	for (var i = firstDataRow; i < table.rows.length; i++) {
		var value = table.rows[i].getElementsByTagName('TD')[n].getAttribute('data-value');
		if (!isNaN(value))
			value = +value;
		pairs.push([table.rows[i].id, value]);
	}
	var original = pairs.slice(0).map(a => a.slice(0));
	if (direction == 'dec') {
		pairs.sort((a, b) => a[1] > b[1] ? -1 : a[1] == b[1] ? 0 : 1);
	} else {
		pairs.sort((a, b) => a[1] > b[1] ? 1 : a[1] == b[1] ? 0 : -1);
	}
	var isSame = true;
	for (var i = 0; i < pairs.length; i++) {
		if (pairs[i][0] != original[i][0]) {
			isSame = false;
			break;
		}
	}
	if (isSame) {
		pairs.reverse();
	}
	for (var i = pairs.length - 1; i >= 0; i--) {
		element = d3.select('#' + id + ' #' + pairs[i][0])[0][0];
		element.parentNode.insertBefore(element, table.rows[firstDataRow]);
	}
}

////////////////// NAVIGATION //////////////////

var buttonSeriesStatistics = d3.select('#button_series_statistics');
var buttonSeriesChart = d3.select('#button_series_chart');
var buttonSeriesTable = d3.select('#button_series_table');
var buttonSeriesComparison = d3.select('#button_series_comparison');
var pageSeriesStatistics = d3.select('#page_series_statistics');
var pageSeriesChart = d3.select('#page_series_chart');
var pageSeriesTable = d3.select('#page_series_table');
var pageSeriesComparison = d3.select('#page_series_comparison');

function toggleButtonsAndPages(selected) {
	buttonSeriesStatistics.classed('on', selected == 'statistics');
	buttonSeriesChart.classed('on', selected == 'chart');
	buttonSeriesTable.classed('on', selected == 'table');
	buttonSeriesComparison.classed('on', selected == 'comparison');
	pageSeriesStatistics.style('display', selected == 'statistics' ? null : 'none');
	pageSeriesChart.style('display', selected == 'chart' ? null : 'none');
	pageSeriesTable.style('display', selected == 'table' ? null : 'none');
	pageSeriesComparison.style('display', selected == 'comparison' ? null : 'none');
	d3.select('.lists').style('display', selected == 'comparison' ? 'none' : null);
	d3.select('#chartHighlightContainer').style('display', selected == 'chart' ? null : 'none');
	d3.select('#chartSelectorContainer').style('display', selected == 'chart' ? null : 'none');
	d3.select('#seriesSelectorContainer').style('display', selected == 'comparison' ? 'none' : null);
}

buttonSeriesStatistics.on('mousedown', function() { toggleButtonsAndPages('statistics'); });
buttonSeriesChart.on('mousedown', function() { toggleButtonsAndPages('chart'); });
buttonSeriesTable.on('mousedown', function() { toggleButtonsAndPages('table'); });
buttonSeriesComparison.on('mousedown', function() { toggleButtonsAndPages('comparison'); });

////////////////// TOOLTIP //////////////////

var tooltip = d3.select('#tt');
var tt = d3.select('#tt');

function setTooltip(id) {
	var tooltipData = stats.filter(a => a.Id == id)[0];
	d3.select('#tooltip_thumb').attr('src', "https://i.ytimg.com/vi/" + id + "/default.jpg");
	d3.select('#tooltip_stats').html(
		"&#x1F440;" + simplify(tooltipData.CountViews) +
		"  &#x1F44D;" + formatPercent(tooltipData.PercentLikes) +
		"  &#x1F44D;" + simplify(tooltipData.CountLikes) +
		"  &#x1F44E;" + simplify(tooltipData.CountDislikes) +		
		"<br/>&#x1F4AC;" + simplify(tooltipData.CountComments) + 
		"  &#x1F551;" + formatTime(tooltipData.LengthInSeconds) + 
		"  &#x1F4C5;" + tooltipData.PublishedDate
		);
	d3.select('#tooltip_series').text(tooltipData.Series);
	var titleShort = tooltipData.Title;
	d3.select('#tooltip_title').text(titleShort);
}

function createTooltipTriggers() {
	d3.selectAll('.ttt')
		.on("mouseover", function(d, i) {
			setTooltip(d3.selectAll('.ttt')[0][i].attributes['data-id'].value);
		})
		.on("mouseout", function() {
			tt.style('display', 'none');
		})
		.on("mousemove", function() {
			var x = d3.event.pageX - 100;
			var y = d3.event.pageY - 240;
			tt.style('left', ~~x + 'px');
			tt.style('top', ~~y + 'px');
			if (x <= 0 || y <= 0) {
				tt.style('display', 'none');
			} else {
				tt.style('display', null);
			}
		});
}
		  
////////////////// SERIES SELECTORS //////////////////

var chartHighlightSelected = 'Nothing';
var chartHighlighter = d3.select('#chartHighlighter');
chartHighlighter.on('change', function() {
	tt.style('display', 'none');
	chartHighlightSelected = d3.select(this).property('value');
	createChart();
});

var seriesSelected = 'All';
var seriesSelector = d3.select('#seriesSelector');
seriesSelector.on('change', function() {
	tt.style('display', 'none');
	seriesSelected = d3.select(this).property('value');
	if (seriesSelected == 'All') {
		document.getElementById('chartHighlighter').disabled = false;
	} else {
		chartHighlighter.property('value', 'Nothing');
		chartHighlightSelected = 'Nothing';
		document.getElementById('chartHighlighter').disabled = true;
	}
	createStatsTable();
	createChart();
	createSeriesTable();
});

function makeHighlightSelector() {
	d3.selectAll('#chartHighlighter option').remove();
	chartHighlighter.append('option').attr('value', 'Nothing').html('Nothing');	
	chartHighlighter.append('option').attr('value', 'Adverts').html('Adverts (' + stats.filter(a => a.Title.toLowerCase().endsWith('#ad')).length + ' Videos)');	
	chartHighlighter.append('option').attr('disabled', 'true').html('-'.repeat(50));
	var allSeries = [...new Set(stats.map(a => a.Series))];
	allSeries.sort();
	allSeries.forEach(a => {
		var amount = stats.filter(b => b.Series == a).length;
		chartHighlighter.append('option').attr('value', a).html(a + ' (' + amount + ' Video' + (amount == 1 ? '' : 's') + ')');
	});
}

function makeSeriesSelector() {
	d3.selectAll('#seriesSelector option').remove();
	seriesSelector.append('option').attr('value', 'All').html('All (' + stats.length + ' Videos)');	
	seriesSelector.append('option').attr('value', 'Adverts').html('Adverts (' + stats.filter(a => a.Title.toLowerCase().endsWith('#ad')).length + ' Videos)');	
	seriesSelector.append('option').attr('disabled', 'true').html('-'.repeat(50));
	var allSeries = [...new Set(stats.map(a => a.Series))];
	allSeries.sort();	
	allSeries.forEach(a => {
		var amount = stats.filter(b => b.Series == a).length;
		seriesSelector.append('option').attr('value', a).html(a + ' (' + amount + ' Video' + (amount == 1 ? '' : 's') + ')');
	});
}

makeHighlightSelector();
makeSeriesSelector();

////////////////// PAGE: MOST + LEAST //////////////////

function createTableHeaders(amount) {
	var table = d3.select('#page_series_statistics table');
	var row = table.append('tr');
	row
		.append('th')
		.attr('class', 'subtle');
	row
		.append('th')
		.attr('class', 'subtle');
	for (var i = 1; i <= amount; i++) {
		row
			.append('th')
			.html(i + '<sup>' + ordinalIndicator(i) + '</sup>')
	}
}

function createRowsForStat(identifier, readable, formatStyle='', showHeaders=false) {
	var table = d3.select('#page_series_statistics table');
	var videosSorted = stats.slice(0).sort((a, b) => +a[identifier] - +b[identifier]);
	videosSorted.reverse();
	if (seriesSelected == 'Adverts') {
		videosSorted = videosSorted.filter(a => a.Title.toLowerCase().endsWith('#ad'));
	} else if (seriesSelected != 'All') {
		videosSorted = videosSorted.filter(a => a.Series == seriesSelected);
	}
	if (showHeaders) {
		createTableHeaders(Math.min(videosSorted.length, 5));	
	}
	var rowSpace = table.append('tr').attr('class', 'spacer').append('td');
	var rowMost = table.append('tr');	
	rowMost.append('th').attr('rowspan', 2).html(readable).attr('class', 'category');
	rowMost.append('th').html('Most');
	var rowLeast = table.append('tr');
	rowLeast.append('th').html('Least');	
	[rowMost, rowLeast].forEach(row => {
		for (var i = 0; i < 5; i++) {
			if (videosSorted[i] != null) {
				var output = simplify(videosSorted[i][identifier]);
				switch (formatStyle) {
					case 'percent':
						output = formatPercent(videosSorted[i][identifier]);
						break;
					case 'time':
						output = formatTime(videosSorted[i][identifier]);
						break;						
				}
				row
					.append('td')
					.attr('class', 'standalone')
					.append('a')
					.attr('target', '_blank')
					.attr('class', 'ttt')
					.attr('data-id', videosSorted[i].Id)
					.attr('href', 'https://youtu.be/' + videosSorted[i].Id)
					.style('background-image', "url('https://i.ytimg.com/vi/" + videosSorted[i].Id + "/default.jpg')")
					.html('&nbsp;')
					.append('span')
					.attr('class', 'stat')
					.html(output);
			}
		}
		videosSorted.reverse();
	});
}

function createStatsTable() {
	d3.selectAll('#page_series_statistics table tr').remove();
	createRowsForStat('CountViews', 'Views', formatStyle='', showHeaders=true);
	createRowsForStat('PercentLikes', 'Likes %', formatStyle='percent');	
	createRowsForStat('CountLikes', 'Likes');
	createRowsForStat('CountDislikes', 'Dislikes');	
	createRowsForStat('CountComments', 'Comments');
	createRowsForStat('LengthInSeconds', 'Length', formatStyle='time');
	createTooltipTriggers();
}

////////////////// PAGE: CHART //////////////////

var chartSelected = 'Views';
var chartSelector = d3.select('#chartSelector');
chartSelector.on('change', function() {
	chartSelected = d3.select(this).property('value');
	createChart();
});

function createChart() {
	d3.select('svg *').remove();
	var margin = {top: 30, right: 5, bottom: 40, left: 50};
	var width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
	var svg = d3.select("svg")
	  .attr("width", width + margin.left + margin.right)
	  .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
	var data = [];
	var videosSorted = stats.slice(0);
	videosSorted.reverse();
	if (seriesSelected == 'Adverts') {
		videosSorted = videosSorted.filter(a => a.Title.toLowerCase().endsWith('#ad'));
	} else if (seriesSelected != 'All') {
		videosSorted = videosSorted.filter(a => a.Series == seriesSelected);
	}
	var colors = ['#000'];
	var bars = ['value1'];
	videosSorted.forEach(a => {
		var item = {};
		switch (chartSelected) {
			case 'Views':
				item.value1 = a.CountViews;		
				break;
			case 'Likes %':
				item.value1 = a.PercentLikes;		
				break;				
			case 'Likes':
				item.value1 = a.CountLikes;
				break;
			case 'Dislikes':
				item.value1 = a.CountDislikes;		
				break;
			case 'Likes + Dislikes':
				colors = [colors[0], colors[0]];
				bars = ['value1', 'value2'];
				item.value1 = a.CountDislikes;		
				item.value2 = a.CountLikes
				break;				
			case 'Comments':
				item.value1 = a.CountComments;		
				break;		
			case 'Length in Minutes':
				item.value1 = a.LengthInSeconds / 60;
				break;
		}		
		item.id = a.Id;
		item.colour = seriesSelected == 'All' && a.Series == chartHighlightSelected ? '#E5007E' : '#000';
		if (chartHighlightSelected == 'Adverts' && a.Title.toLowerCase().endsWith('#ad')) {
			item.colour = '#E5007E';
		}
		data.push(item);
	});
	
	var dataset = d3.layout.stack()(bars.map(function(video) {
	  return data.map(function(d, i) {
		return {x: i, y: +d[video]};
	  });
	}));
	var x = d3.scale.ordinal()
	  .domain(dataset[0].map(function(d) { return d.x; }))
	  .rangeRoundBands([10, width-10], 0.02);	  
	var y = d3.scale.linear()
	  .domain([0, d3.max(dataset, function(d) { return (chartSelected == 'Likes %' ? 1 : 1.15 * d3.max(d, function(d) { return d.y0 + d.y; })); })])
	  .range([height, 0]);
	var xAxis = d3.svg.axis()
	  .scale(x)
	  .orient("bottom")
	  .tickFormat(function(d) { return videosSorted.length > 50 ? ' ' : d+1 });
	var yAxis = d3.svg.axis()
	  .scale(y)
	  .orient("left")
	  .ticks(10)
	  .tickSize(-width, 0, 0)
	  .tickFormat( function(d) { return chartSelected == 'Likes %' ? d*100 : simplify(d, true, y.domain()[1]) } );
	svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + height + ")")
	  .call(xAxis);	  	  
	svg.append("g")
	  .attr("class", "y axis")
	  .call(yAxis);
	var groups = svg.selectAll("g.cost")
	  .data(dataset)
	  .enter().append("g")
	  .attr("class", "cost")
	  .style("fill", function(d, i) { return d % 2 == 0 ? '#080' : '#800'; });	  
	svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 5) + ")")
      .style("text-anchor", "middle")
      .text(seriesSelected + ' Videos by Published Order');	  
	svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(chartSelected);  	  
	var rect = groups.selectAll("rect")
	  .data(function(d) { return d; })
	  .enter()
	  .append("rect")
	  .attr("index", function(d) { return d.x; })
	  .attr("x", function(d) { return x(d.x); })  
	  .attr("y", function(d) { return y(d.y0 + d.y); })
	  .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
	  .attr("width", x.rangeBand() - 1)
	  .attr("fill", function(d, i) { return data[i].colour; })
	  .attr("class", "ttt")
	  .attr("data-id", function(d, i) { return data[i].id; })
	  .style('cursor', 'pointer')
	  .on('mousedown', function(d, i) { window.open('https://youtu.be/' + data[i].id); });	  
	  
	createTooltipTriggers();
}

////////////////// PAGE: TABLE //////////////////
 
function createSeriesTable() {
	d3.selectAll('#page_series_table .temp').remove();
	var videosSorted = stats.slice(0);
	videosSorted.reverse();
	if (seriesSelected == 'Adverts') {
		videosSorted = videosSorted.filter(a => a.Title.toLowerCase().endsWith('#ad'));
	} else if (seriesSelected != 'All') {
		videosSorted = videosSorted.filter(a => a.Series == seriesSelected);
	}
	var statsStorage = {};
	['CountViews', 'CountLikes', 'CountDislikes', 'PercentLikes', 'CountComments', 'LengthInSeconds'].forEach(a => {
		statsStorage[a + 'Lower'] = Infinity;
		statsStorage[a + 'Upper'] = -Infinity;
	});
	
	['CountViews', 'CountLikes', 'CountDislikes', 'PercentLikes', 'CountComments', 'LengthInSeconds'].forEach(a => {		
		var min = Math.min(...videosSorted.map(b => b[a]));
		var max = Math.max(...videosSorted.map(b => b[a]));			
		statsStorage[a + 'Lower'] = Math.min(statsStorage[a + 'Lower'], min);
		statsStorage[a + 'Upper'] = Math.max(statsStorage[a + 'Upper'], max);				
	});
	
	var table = d3.select('#page_series_table table');
	videosSorted.forEach((a, i) => {
		
		var row = table.append('tr').attr('class', 'temp').attr('id', 'index' + i);
		row.append('td').attr('data-value', a.PublishedDate).html(a.PublishedDate);
		row.append('td').attr('data-value', a.Series).attr('class', 'table_series').html(a.Series);
		row
			.append('td')
			.attr('class', 'standalone')
			.attr('data-value', a.Id)			
			.append('a')
			.attr('target', '_blank')
			.attr('href', 'https://youtu.be/' + a.Id)
			.append('img')
			.attr('width', '120px')
			.attr('height', '80px')
			.attr('src', 'https://i.ytimg.com/vi/' + a.Id + '/default.jpg');
		row.append('td').attr('data-value', a.Title).html(a.Title);
		
		['CountViews', 'PercentLikes', 'CountLikes', 'CountDislikes', 'CountComments', 'LengthInSeconds'].forEach(s => {		
			
			var num = a[s];
			var numRatio = scale(num, statsStorage[s + 'Lower'], statsStorage[s + 'Upper'], 0, 115);
			
			if (s == 'CountDislikes') {
				numRatio = 115 - numRatio;
			}				
			
			var output = simplify(a[s]);
			switch (s) {
				case 'PercentLikes':
					output = formatPercent(a[s]);
					break;
				case 'LengthInSeconds':
					output = formatTime(a[s]);
					break;					
			}
			
			row
				.append('td')
				.attr('class', videosSorted.length == 1 ? '' : 'standalone')
				.style('background', a == 'All' ? '#aaa' : 'hsl(' + numRatio + ', 70%, 50%)')
				.attr('data-value', num)
				.html(output);
		});
	});
	d3.selectAll('.table_series').style('display', seriesSelected == 'All' ? null : 'none');
}

function makeTableSortable() {
	d3.selectAll('#page_series_table_sorters th')
		.on('mousedown', function(d, i) {
			sortTable('page_series_table_table', i, 1, 0);
		});
}

////////////////// PAGE: SERIES COMPARISON //////////////////

function makeCheckBoxUsable() {
	d3.select('#checkSingleVideo').on('change', function() { createSeriesComparisonTable(); });
}

function createSeriesComparisonTable() {
	d3.selectAll('#page_series_comparison table .temp').remove();
	var table = d3.select('#page_series_comparison table');
	var allSeries = [...new Set(stats.map(a => a.Series))];
	var statsStorage = {};
	['CountViews', 'PercentLikes', 'CountLikes', 'CountDislikes', 'CountComments'].forEach(a => {
		statsStorage[a + 'MinLower'] = Infinity;
		statsStorage[a + 'MinUpper'] = -Infinity;
		statsStorage[a + 'AvgLower'] = Infinity;
		statsStorage[a + 'AvgUpper'] = -Infinity;	
		statsStorage[a + 'MaxLower'] = Infinity;
		statsStorage[a + 'MaxUpper'] = -Infinity;
	});
	
	allSeries.forEach(a => {
		var videos = stats.slice(0).filter(b => b.Series == a);
		if (!document.getElementById('checkSingleVideo').checked) {
			videos = videos.filter(b => !b.IsSingleEpisodeSeries);
		}
		if (videos.length) {
			['CountViews', 'PercentLikes', 'CountLikes', 'CountDislikes', 'CountComments'].forEach(a => {		
				var min = Math.min(...videos.map(b => b[a]));
				var avg = videos.reduce((b, c) => b + c[a], 0) / videos.length;
				var max = Math.max(...videos.map(b => b[a]));			
				statsStorage[a + 'MinLower'] = Math.min(statsStorage[a + 'MinLower'], min);
				statsStorage[a + 'MinUpper'] = Math.max(statsStorage[a + 'MinUpper'], min);
				statsStorage[a + 'AvgLower'] = Math.min(statsStorage[a + 'AvgLower'], avg);
				statsStorage[a + 'AvgUpper'] = Math.max(statsStorage[a + 'AvgUpper'], avg);
				statsStorage[a + 'MaxLower'] = Math.min(statsStorage[a + 'MaxLower'], max);
				statsStorage[a + 'MaxUpper'] = Math.max(statsStorage[a + 'MaxUpper'], max);						
			});
		}
	});
	
	allSeries.sort();
	allSeries.unshift('Adverts');
	allSeries.unshift('All');	
	allSeries.forEach((a, i) => {
		var videos = stats.slice(0);
		if (a == 'Adverts') {
			videos = videos.filter(a => a.Title.toLowerCase().endsWith('#ad'));
		} else if (a != 'All') {
			videos = videos.filter(b => b.Series == a);
		}
		if (!document.getElementById('checkSingleVideo').checked) {
			videos = videos.filter(b => !b.IsSingleEpisodeSeries);
		}		
		if (videos.length) {
			var row = table.append('tr').attr('class', 'temp').attr('id', 'index' + i);
			row
				.append('td')
				.attr('class', 'series' + (a == 'All' || a == 'Adverts' ? ' highlight' : ''))
				.attr('data-value', a)
				.html(a);
			row
				.append('td')
				.attr('data-value', videos.length)
				.html(videos.length);
			['CountViews', 'PercentLikes', 'CountComments'].forEach(s => {
			
				var minAll = Math.min(...stats.map(b => b[s]));
				var avgAll = stats.reduce((b, c) => b + c[s], 0) / stats.length;
				var maxAll = Math.max(...stats.map(b => b[s]));
			
				var min = Math.min(...videos.map(b => b[s]));
				var avg = videos.reduce((b, c) => b + c[s], 0) / videos.length;
				var max = Math.max(...videos.map(b => b[s]));
				
				var minRatio = scale(min, statsStorage[s + 'MinLower'], statsStorage[s + 'MinUpper'], 0, 115);
				var avgRatio = scale(avg, statsStorage[s + 'AvgLower'], statsStorage[s + 'AvgUpper'], 0, 115);
				var maxRatio = scale(max, statsStorage[s + 'MaxLower'], statsStorage[s + 'MaxUpper'], 0, 115);
				
				if (s == 'Dislikes') {
					minRatio = 115 - minRatio;
					avgRatio = 115 - avgRatio;
					maxRatio = 115 - maxRatio;
				}

				row
					.append('td')
					.attr('class', 'standalone')
					.style('background', a == 'All' || a == 'Adverts' ? '#aaa' : 'hsl(' + minRatio + ', 70%, 50%)')
					.attr('data-value', min)
					.html(s == 'PercentLikes' ? formatPercent(min) : simplify(min, s == 'CountViews'));			
				row
					.append('td')
					.attr('class', 'standalone')
					.style('background', a == 'All' || a == 'Adverts' ? '#aaa' : 'hsl(' + avgRatio + ', 70%, 50%)')
					.attr('data-value', avg)
					.html(s == 'PercentLikes' ? formatPercent(avg) : simplify(avg, s == 'CountViews'));
				row
					.append('td')
					.attr('class', 'standalone')
					.style('background', a == 'All' || a == 'Adverts' ? '#aaa' : 'hsl(' + maxRatio + ', 70%, 50%)')
					.attr('data-value', max)
					.html(s == 'PercentLikes' ? formatPercent(max) : simplify(max, s == 'CountViews'));
				
			});
		}
	});
	
	allSeries.unshift('All');
}

function makeSeriesComparisonTableSortable() {
	d3.selectAll('#page_series_comparison_sorters th')
		.on('mousedown', function(d, i) {
			sortTable('page_series_comparison_table', i, 4, 1);
		});
}

////////////////// PERFECTLY BALANCED //////////////////

function implementPerfectlyBalancedStatistics() {
	d3.select('h1').html('Perfectly Balanced<br/>Yogscast YouTube Statistics for 2020');
	d3.select('#asterism').style('display', 'none');
	for (var stat in stats) {
		stats[stat].LengthInSeconds = 60 * 60;
		stats[stat].CountViews = 100000000;
		stats[stat].CountLikes = 10000000;
		stats[stat].CountDislikes = 0;
		stats[stat].CountComments = 1000000;
		stats[stat].PercentLikes = 1;
	}
	window.scrollTo(0,0);
	loadEverything();
}

////////////////// LOAD PAGES //////////////////

function loadEverything() {
	createStatsTable();
	chartSelector.property('value', 'Views');
	createChart();
	createSeriesTable();
	makeTableSortable();
	document.getElementById('checkSingleVideo').checked = true;
	createSeriesComparisonTable();
	makeSeriesComparisonTableSortable();
	makeCheckBoxUsable();
}

loadEverything();