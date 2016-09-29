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

  function removeDuplicates(item, pos, arr) {
    return !pos || item != arr[pos - 1];
  }
  // grab all labels from data, sort them, then remove all strings that are the same as their predecessor [2]
  const uniqueLabels = locationData.map(d => d.label).sort().filter(removeDuplicates);
  const colorScale = d3.scaleOrdinal().domain(uniqueLabels).range(d3.schemeCategory10);

  const chart = d3.select('svg')
    .attr('class', 'chart')
    .attr('width', config.svg.width + config.svg.margin.x)
    .attr('height', config.svg.height + config.svg.margin.y)
      .append('g')
    .attr('transform', `translate(${ config.svg.margin.x / 2 }, 0)`);

  chart.append('g')
    .attr('transform', `translate(0, ${config.svg.margin.y + config.bar.height + config.bar.margin})`)
    .call(d3.axisBottom(scaleX).ticks(24));

  d3.select('#timeSelectionControl')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('max', config.svg.width)
    .attr('value', 0)
    .style('width', `${ config.svg.width + config.slider.padding }px`)
    .style('margin', `0 ${ config.svg.margin.y / 2 + config.slider.offset }px`);

  drawTimeBlocks();

  chart.append('rect')
    .attr('class', 'timeSelectionIndicator')
    .attr('width', 2)
    .attr('x', 0)
    .attr('y', config.svg.margin.y / 2)
    .attr('height', 220)
    .attr('fill', 'red');

  const timeSelectionDisplay = document.querySelector('#timeSelectionDisplay');
  const timeSelectionControl = document.querySelector('#timeSelectionControl');

  timeSelectionControl.addEventListener('input', onTimeSelectionChange);

  function onTimeSelectionChange() {
    const selectedDate = scaleX.invert(timeSelectionControl.value);
    timeSelectionDisplay.value = selectedDate;
    drawTimeBlocks(selectedDate);
    chart.select('.timeSelectionIndicator')
      .attr('transform', `translate(${ timeSelectionControl.value }, 0)`);
  }

  function drawTimeBlocks() {
    const group = chart.selectAll('g .block').data(locationData);
    const groupEnter = group.enter().append('g') // enter elements as groups [1]
      .attr('class', 'block');

    groupEnter.append('rect');
    groupEnter.append('text');

    groupEnter.select('rect')
      .attr('width', d =>  scaleX(d.stopDatetime) - scaleX(d.startDatetime))
      .attr('x', d => scaleX(d.startDatetime))
      .attr('y', config.svg.margin.y)
      .attr('height', config.bar.height)
      .attr('fill', d => colorScale(d.label));

    groupEnter.select('text')
      .attr('x', d => scaleX(d.startDatetime))
      .attr('y', config.svg.margin.y)
      .attr('fill', 'gray')
      .text(d => d.label);

    group.exit().remove();
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

// [1] http://stackoverflow.com/questions/24912274/d3-update-data-with-multiple-elements-in-a-group
// [2] http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
