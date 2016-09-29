/* global d3 */

/* Mark van Dijken */
d3.csv('20160919locations.csv', cleanUpData, plot);

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

function plot(dayParts) {

  // (TODO: load dates from data instead of hard-coding it)
  const scaleX = d3.scaleTime()
    .domain([ new Date('2016-09-19T00:00:00'), new Date('2016-09-20T00:00:00') ])
    .range([0, config.svg.width]);

  // grab all labels from data, sort them, then remove all duplicate stings
  const uniqueLabels = dayParts.map(d => d.label).sort().filter(removeDuplicates);

  // create a scale which maps all possible label values to `d3.schemeCategory10` colors
  const colorScale = d3.scaleOrdinal().domain(uniqueLabels).range(d3.schemeCategory10);

  // output element that displays currently selected time
  const timeSelectionDisplay = document.querySelector('#timeSelectionDisplay');

  // input element that controls currently selected time
  const timeSelectionControl = document.querySelector('#timeSelectionControl');

  let timeSelectionLocation;

  const chart = d3.select('svg')
    .attr('class', 'chart')
    .attr('width', config.svg.width + config.svg.margin.x)
    .attr('height', config.svg.height + config.svg.margin.y)
      .append('g')
    .attr('transform', `translate(${ config.svg.margin.x / 2 }, 0)`);

  // add x-axis
  chart.append('g')
    .attr('transform', `translate(0, ${config.svg.margin.y + config.bar.height + config.bar.margin})`)
    .call(d3.axisBottom(scaleX).ticks(24));

  // setup range input for date selection
  d3.select('#timeSelectionControl')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('max', config.svg.width)
    .attr('value', 0)
    .style('width', `${ config.svg.width + config.slider.padding }px`)
    .style('margin', `0 ${ config.svg.margin.y / 2 + config.slider.offset }px`);

  chart.append('g')
    .attr('transform', `translate(0, ${config.svg.margin.y + config.bar.height + config.bar.margin})`)
    .attr('class', 'infoBox');

  drawTimeBlocks();

  onTimeSelectionChange();

  timeSelectionControl.addEventListener('input', onTimeSelectionChange);

  // draw the timeSelectionIndicator over the timeBlocks previously drawn
  chart.append('rect')
    .attr('class', 'timeSelectionIndicator')
    .attr('width', 2)
    .attr('x', 0)
    .attr('y', config.svg.margin.y / 2)
    .attr('height', 220)
    .attr('fill', 'red');

  function onTimeSelectionChange() {
    timeSelectionLocation = timeSelectionControl.value;
    timeSelectionDisplay.value = scaleX.invert(timeSelectionLocation);

    drawTimeBlocks();
    drawInfoBox(timeSelectionLocation);

    // translate timeSelectionIndicator to the position selected by the timeSelectionControl
    chart.select('.timeSelectionIndicator')
      .attr('transform', `translate(${ timeSelectionLocation }, 0)`);
  }

  function drawInfoBox(selectedTimePosition) {
    const selectedDayPart = dayParts.filter(d => {
      return (scaleX(d.startDatetime) < selectedTimePosition &&
              selectedTimePosition < scaleX(d.stopDatetime));
    });
    console.log(selectedDayPart[0]);

    const group = chart.selectAll('.infoBox').data(selectedDayPart);
    const groupEnter = group.enter().append('g') // enter elements as groups [1]
      .attr('class', 'infoBox');

    groupEnter.append('text');

    groupEnter.select('text')
      .attr('x', d => scaleX(d.startDatetime))
      .attr('y', config.svg.margin.y)
      .text(d => d.label);

    group.exit().remove();
  }

  function drawTimeBlocks() {
    const groupAll = chart.selectAll('.block').data(dayParts);
    const groupAllEnter = groupAll.enter().append('g') // enter elements as groups [1]
      .attr('class', 'block');

    groupAllEnter.append('rect');

    groupAllEnter.select('rect')
      .attr('width', d =>  scaleX(d.stopDatetime) - scaleX(d.startDatetime))
      .attr('x', d => scaleX(d.startDatetime))
      .attr('y', config.svg.margin.y)
      .attr('height', config.bar.height)
      .attr('fill', d => colorScale(d.label));

    groupAll.exit().remove();
  }
}

// transforms dateTimeStings into js date objects
function cleanUpData(row) {
  return {
    description: row.description,
    startDatetime: new Date(stripTimezone(row.startDatetime)),
    stopDatetime: new Date(stripTimezone(row.stopDatetime)),
    label: row.label,
    type: row.type,
  };
}

// remove timezone info from datetimeString
function stripTimezone(datetimeString) {
  return datetimeString.split('+')[0];
}

// filters out strings that are the same as their predecessor [2]
function removeDuplicates(item, pos, arr) {
  return !pos || item != arr[pos - 1];
}

// [1] http://stackoverflow.com/questions/24912274/d3-update-data-with-multiple-elements-in-a-group
// [2] http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
