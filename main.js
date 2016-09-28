/* global d3 */

/* Mark van Dijken */
d3.csv('20160919locations.csv', cleanDates, plot);

// settings object
const config = {
  svg: {
    width: 1400,
    height: 180,
    margin: {
      x: 60,
      y: 40,
    },
  },
  bar: {
    height: 100,
    margin: 10,
  },
  slider: {
    offset: 4,
    padding: 13,
  },
};

function plot(locationData) {
  const scaleX = d3.scaleTime()
    .domain([ new Date('2016-09-19T00:00:00'), new Date('2016-09-20T00:00:00') ]) // make dynamic
    .range([0, config.svg.width]);

  const chart = d3.select('svg')
    .attr('class', 'chart')
    .attr('width', config.svg.width + config.svg.margin.x)
    .attr('height', config.svg.height + config.svg.margin.y)
      .append('g')
    .attr('transform', `translate(${ config.svg.margin.x / 2 }, 0)`);

  d3.select('#timeSelectionControl')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('max', config.svg.width)
    .attr('value', 0)
    .style('width', `${ config.svg.width + config.slider.padding }px`)
    .style('margin', `0 ${ config.svg.margin.y / 2 + config.slider.offset }px`);

  drawTimeBlocks();
  drawPositionIndicator(0);

  function drawTimeBlocks(selectedDatetimeString) {
    const group = chart.selectAll('g').data(locationData);
    const groupEnter = group.enter().append('g');

    groupEnter.append('rect');
    groupEnter.append('text');

    groupEnter.select('rect')
      .attr('width', d =>  scaleX(d.stopDatetime) - scaleX(d.startDatetime))
      .attr('x', d => scaleX(d.startDatetime))
      .attr('y', config.svg.margin.y)
      .attr('height', config.bar.height);

    groupEnter.select('text')
      .attr('x', d => scaleX(d.startDatetime))
      .attr('y', config.svg.margin.y)
      .attr('fill', 'gray')
      .text(d => d.label);

    const selectedDatetime = new Date(scaleX.invert(selectedDatetimeString));

    const selectedBlock = locationData.filter(d => {
      return d.startDatetime.getTime() < selectedDatetime.getTime() < d.stopDatetime.getTime();
    });

    const infobox = chart.selectAll('rect').data(selectedBlock);
    infobox.exit().remove();

    chart.append('g')
      .attr('transform', `translate(0, ${config.svg.margin.y + config.bar.height + config.bar.margin})`)
      .call(d3.axisBottom(scaleX).ticks(24));

    group.exit().remove();
  }

  const timeSelectionDisplay = document.querySelector('#timeSelectionDisplay');
  const timeSelectionControl = document.querySelector('#timeSelectionControl');

  timeSelectionControl.addEventListener('input', onTimeSelectionChange);

  function onTimeSelectionChange() {
    timeSelectionDisplay.value = scaleX.invert(timeSelectionControl.value);
    drawTimeBlocks(scaleX.invert(timeSelectionControl.value));
    drawPositionIndicator(timeSelectionControl.value);
  }

  function drawPositionIndicator(offset) {
    const timeSelectionIndicator = chart.append('rect')
      .attr('width', 2)
      .attr('x', 0)
      .attr('y', config.svg.margin.y / 2)
      .attr('height', 220)
      .attr('fill', 'red')
      .attr('transform', `translate(${offset}, 0)`);
    timeSelectionIndicator.exit().remove();
  }
}

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

// http://stackoverflow.com/questions/24912274/d3-update-data-with-multiple-elements-in-a-group
