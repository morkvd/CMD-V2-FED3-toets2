/* global d3 */

/* Mark van Dijken */

function cleanDates(row) {
  return {
    description: row.description,
    startDatetime: new Date(row.startDatetime.split('+')[0]), // .split('+')[0] removes timezone part from the
    stopDatetime: new Date(row.stopDatetime.split('+')[0]),   // datetimeString because js cant handle it
    label: row.label,
    type: row.type,
  };
}

function plot(locationData) {
  const margin = {
    x: 60,
    y: 40,
  };

  const svg = {
    width: 1400,
    height: 180,
  };

  const bar = {
    height: 100,
    margin: 10,
  };

  const slider = {
    offset: 4,
    padding: 13,
  };

  console.log(locationData);

  const scaleX = d3.scaleTime()
    .domain([
      new Date('2016-09-19T00:00:00'),
      new Date('2016-09-20T00:00:00')
    ])
    .range([0, svg.width]);

  const timeTicks = scaleX.ticks(24);

  console.log(timeTicks.length);

  const chart = d3.select('svg')
    .attr('class', 'chart')
    .attr('width', svg.width + margin.x)
    .attr('height', svg.height + margin.y)
      .append('g')
    .attr('transform', `translate(${margin.x / 2}, ${margin.y})`);

  d3.select('#timeSelectionControl')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('max', svg.width)
    .attr('value', 0)
    .style('width', `${svg.width + slider.padding}px`)
    .style('margin', `0 ${margin.y / 2 + slider.offset}px`);

  const timeSelectionIndicator = document.querySelector('#timeSelectionIndicator');
  const timeSelectionControl = document.querySelector('#timeSelectionControl');
  timeSelectionControl.addEventListener('input', () => {
    timeSelectionIndicator.value = scaleX.invert(timeSelectionControl.value);
  });

  const item = chart.selectAll('g').data(locationData);

  item.enter().append('rect')
    .attr('width', d =>  scaleX(d.stopDatetime) - scaleX(d.startDatetime))
    .attr('x', d => scaleX(d.startDatetime))
    .attr('y', margin.y)
    .attr('height', bar.height);

  item.enter().append('text')
    .attr('x', d => scaleX(d.startDatetime))
    .attr('y', margin.y)
    .attr('fill', 'gray')
    .text(d => d.label);

  chart.append('g')
    .attr('transform', `translate(0, ${margin.y + bar.height + bar.margin})`)
    .call(d3.axisBottom(scaleX).ticks(24));
}

d3.csv('20160919locations.csv', cleanDates, plot);
