/* global d3 */

/* Mark van Dijken */


d3.csv('20160919locations.csv', cleanDates, plot);

function cleanDates(row) {
  return {
    description: row.description,
    startDatetime: new Date(stripTimezone(row.startDatetime)),
    stopDatetime: new Date(stripTimezone(row.stopDatetime)),
    label: row.label,
    type: row.type,
  };
}

function stripTimezone(datetimeString) {
  return datetimeString.split('+')[0];
}

function plot(locationData) {

  const svg = {
    width: 1400,
    height: 180,
    margin: {
      x: 60,
      y: 40,
    },
  };

  const bar = {
    height: 100,
    margin: 10,
  };

  const slider = {
    offset: 4,
    padding: 13,
  };

  const scaleX = d3.scaleTime()
    .domain([
      new Date('2016-09-19T00:00:00'),
      new Date('2016-09-20T00:00:00')
    ])
    .range([0, svg.width]);

  const chart = d3.select('svg')
    .attr('class', 'chart')
    .attr('width', svg.width + svg.margin.x)
    .attr('height', svg.height + svg.margin.y)
      .append('g')
    .attr('transform', `translate(${svg.margin.x / 2}, ${svg.margin.y})`);

  d3.select('#timeSelectionControl')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('max', svg.width)
    .attr('value', 0)
    .style('width', `${svg.width + slider.padding}px`)
    .style('margin', `0 ${svg.margin.y / 2 + slider.offset}px`);

  const item = chart.selectAll('g').data(locationData);

  item.enter().append('rect')
    .attr('width', d =>  scaleX(d.stopDatetime) - scaleX(d.startDatetime))
    .attr('x', d => scaleX(d.startDatetime))
    .attr('y', svg.margin.y)
    .attr('height', bar.height);

  item.enter().append('text')
    .attr('x', d => scaleX(d.startDatetime))
    .attr('y', svg.margin.y)
    .attr('fill', 'gray')
    .text(d => d.label);

  chart.append('g')
    .attr('transform', `translate(0, ${svg.margin.y + bar.height + bar.margin})`)
    .call(d3.axisBottom(scaleX).ticks(24));

  const timeSelectionIndicator = chart.append('rect')
    .attr('width', 2)
    .attr('x', 0)
    .attr('y', svg.margin.y / 2)
    .attr('height', 220)
    .attr('fill', 'red');

  const timeSelectionDisplay = document.querySelector('#timeSelectionDisplay');
  const timeSelectionControl = document.querySelector('#timeSelectionControl');

  timeSelectionControl.addEventListener('input', () => {
    timeSelectionDisplay.value = scaleX.invert(timeSelectionControl.value);
    drawPositionIndicator(timeSelectionControl.value);
  });

  function drawPositionIndicator(offset) {
    timeSelectionIndicator.attr('transform', `translate(${offset}, 0)`);
  }
}
