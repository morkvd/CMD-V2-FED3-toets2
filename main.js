/* global d3 */

/* By Mark van Dijken */

d3.csv('20160919locations.csv', cleanUpData, plot);

// settings object
const config = {
  svg: {
    width: 1400,
    height: 200,
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


// draw the visualisation
function plot(dayParts) {

  // creates time formating function (example from stackoverflow [4])'
  // nl locale definition
  const nl_NL = {
    'dateTime': '%a %e %B %Y %T',
    'date': '%d-%m-%Y',
    'time': '%H:%M:%S',
    'periods': ['AM', 'PM'],
    'days': ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
    'shortDays': ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
    'months': ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
    'shortMonths': ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
  }; // copied from d3 locales on github [5]

  // create a timeFormatLocale object
  const NL = d3.timeFormatLocale(nl_NL);

  // create timeFormatting functions from the timeFormatLocale object
  const formatTimeHMS = NL.format('%X');
  const formatTimeHM = NL.format('%H:%M');

  const scaleX = d3.scaleTime()
    .domain([ new Date('2016-09-19T00:00:00'), new Date('2016-09-20T00:00:00') ]) // (TODO: load dates from data instead of hard-coding it)
    .range([0, config.svg.width]);

  const xAxis = d3.axisBottom(scaleX)
    .ticks(24)
    .tickFormat(formatTimeHM);

  // grab all labels from data, sort them, then remove all duplicate stings
  const uniqueLabels = dayParts.map(d => d.label)
    .sort()
    .filter(removeDuplicates);

  // create a scale which maps all possible label values to `d3.schemeCategory10` colors
  const colorScale = d3.scaleOrdinal()
    .domain(uniqueLabels)
    .range(d3.schemeCategory10);

  // little box that details about selected time
  const detailsBox = document.querySelector('#details');

  // setup chart
  const chart = d3.select('svg')
    .attr('class', 'chart')
    .attr('width', config.svg.width + config.svg.margin.x)
    .attr('height', config.svg.height + config.svg.margin.y)
      .append('g')
    .attr('transform', `translate(${ config.svg.margin.x / 2 }, 0)`);

  // add x-axis
  chart.append('g')
    .attr('transform', `translate(0, ${config.svg.margin.y + config.bar.height + config.bar.margin})`)
    .call(xAxis);

  // setup range input for date selection
  d3.select('#timeSelectionControl')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('max', config.svg.width)
    .attr('value', 0)
    .style('width', `${ config.svg.width + config.slider.padding }px`)
    .style('margin', `0 ${ config.svg.margin.y / 2 + config.slider.offset }px`);

  // input element that controls currently selected time
  const timeSelectionControl = document.querySelector('#timeSelectionControl');
  timeSelectionControl.addEventListener('input', onTimeSelectionChange);

  // setup infoBox
  chart.append('g')
    .attr('transform', `translate(0, ${config.svg.margin.y + config.bar.height + config.bar.margin})`)
    .attr('class', 'infoBox');

  drawTimeBlocks();

  // setup the timeSelectionIndicator
  const timeSelectionIndicatorContainer = chart.append('g')
    .attr('class', 'timeSelectionIndicator');

  timeSelectionIndicatorContainer.append('rect')
    .attr('width', 2)
    .attr('x', 0)
    .attr('y', config.svg.margin.y / 2)
    .attr('height', 170)
    .attr('fill', 'red');

  timeSelectionIndicatorContainer.append('text')
    .text('00:00:00')
    .attr('fill', 'black')
    .attr('x', '-29')
    .attr('y', '220')
    .attr('font-size', '16')
    .attr('font-family', 'Arial');

  // runs every time the range input is moved
  function onTimeSelectionChange() {
    drawTimeBlocks();
    drawInfoBox(timeSelectionControl.value);
    updateTimeSelectionIndicator(timeSelectionControl.value);
  }

  // translate timeSelectionIndicator to the position selected by the timeSelectionControl
  function updateTimeSelectionIndicator(selectedTimePosition) {
    timeSelectionIndicatorContainer.attr('transform', `translate(${ selectedTimePosition }, 0)`);
    timeSelectionIndicatorContainer.select('text').remove();
    timeSelectionIndicatorContainer.append('text')
      .text(formatTimeHMS(scaleX.invert(selectedTimePosition)))
      .attr('fill', 'black')
      .attr('x', '-29')
      .attr('y', '220')
      .attr('font-size', '16')
      .attr('font-family', 'Arial');
  }

  // draw the info box
  function drawInfoBox(selectedTimePosition) {
    const selectedDayPart = dayParts.filter(d => {
      return (scaleX(d.startDatetime) < selectedTimePosition &&
              selectedTimePosition < scaleX(d.stopDatetime));
    });

    console.log(selectedDayPart[0]);

    detailsBox.innerHTML = '';
    if (selectedDayPart[0]) {
      const htmlFragment = `
        <div class="additional-info">
          <p>Label: ${ selectedDayPart[0].label }</p>
          <p>Omschrijving: ${ selectedDayPart[0].description }</p>
          <p>${ formatTimeHM(selectedDayPart[0].startDatetime) } - ${formatTimeHM(selectedDayPart[0].stopDatetime)}</p>
        </div>
      `;
      detailsBox.insertAdjacentHTML('afterbegin', htmlFragment); // hacky way to add info box, TODO: fix this [3]
    }
  }

  // draw the time blocks
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

// sources:
// [1] http://stackoverflow.com/questions/24912274/d3-update-data-with-multiple-elements-in-a-group
// [2] http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
// [3] http://stackoverflow.com/questions/814564/inserting-html-elements-with-javascript
// [4] http://stackoverflow.com/questions/24385582/localization-of-d3-js-d3-locale-example-of-usage
// [5] https://github.com/d3/d3-time-format/blob/master/locale/nl-NL.json
