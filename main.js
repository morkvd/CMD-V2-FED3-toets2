const marginTop = 40;

d3.csv('20160919locations.csv', data => {
  console.log(data);

  const xScale = d3.scaleTime()
    .domain([
      new Date(2016, 9, 19),
      new Date(2016, 9, 20)
    ])
    .range([0, 1000])
    .ticks(24);

  console.log(xScale);

  const chart = d3.select('svg');


});
