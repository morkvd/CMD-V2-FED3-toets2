const pieWidth = 960;

function cleanup(row) {
  return {
    activity: row.Activity,
    location: row.Location,
    duration: row.Duration,
    endTime: row["End time"],
    endDate: row["End date"],
    endDay: row["End day"],
    startTime: row["Start time"],
    startDate: row["Start date"],
    startDay: row["Start day"],
    startWeek: row["Start week (ISO)"],
  };
}

d3.csv('timetable.csv', cleanup, data => {
  console.log(data);

  const pie = d3.select('svg');

  var arc = d3.arc()
    .innerRadius(50)
    .outerRadius(70)
    .startAngle(45 * (Math.PI/180)) //converting from degs to radians
    .endAngle(3) //just radians

  pie.append('path')
    .attr("d", arc)
    .attr("transform", "translate(200,200)");
});
