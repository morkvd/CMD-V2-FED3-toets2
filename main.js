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

  const chart = d3.select('svg');

  const [startDate, endDate] = d3.extent(data, entry => entry.startDate);
  const [startYear, startMonth, startDay] = startDate.split('-');
  const [endYear, endMonth, endDay] = endDate.split('-');

  const xScale = d3.scaleTime()
    .domain([
      new Date(startYear, startMonth, startDay),
      new Date(endYear, endMonth, endDay)
    ])
    .range([0, 1000]);

  console.log(xScale);
});

// [1]: http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
