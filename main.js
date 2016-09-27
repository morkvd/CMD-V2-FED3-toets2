/* global d3 */

/* Mark van Dijken */

function cleanDates(row) {
  return {
    description: row.description,
    startDatetime: row.startDatetime.split('+')[0],
    stopDatetime: row.stopDatetime.split('+')[0],
    label: row.label,
    type: row.type,
  };
}

d3.csv('20160919locations.csv', cleanDates, locationData => {
  const margin = {
    x: 60,
    y: 40,
  };

  const svg = {
    width: 1400,
    height: 180,
  };

  const bar = {
    height: 50,
    margin: 10,
  };

  console.log(locationData);

  const scaleX = d3.scaleTime()
    .domain([
      new Date('2016-09-19T00:00:00'),
      new Date('2016-09-20T00:00:00')
    ])
    .range([0, svg.width]);

  const chart = d3.select('svg')
    .attr('class', 'chart')
    .attr('width', svg.width + margin.x)
    .attr('height', svg.height + margin.y)
      .append('g')
      .attr('transform', `translate(${margin.x / 2}, ${margin.y})`);

  const bars = chart.selectAll('rect').data(locationData);

  bars.enter().append('rect')
    .attr('width', (d) =>  scaleX(new Date(d.stopDatetime)) - scaleX(new Date(d.startDatetime)))
    .attr('x', (d) => scaleX(new Date(d.startDatetime)))
    .attr('y', margin.y)
    .attr('height', bar.height);

  chart.append('g')
    .attr('transform', `translate(0, ${margin.y + bar.height + bar.margin})`)
    .call(d3.axisBottom(scaleX).ticks(24));
});
