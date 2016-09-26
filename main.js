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

  const startDate = data
                      .map(entry => entry.startDate)
                      .map(dateStr => {
                        const [yy, mm, dd] = dateStr.split('-').map(str => +str);
                        return new Date(yy, mm, dd);
                      });
  console.log(startDate);

  const xScale = d3.scaleTime()
    .domain([new Date(2016, 9, 5), new Date(2016, 9, 24)])
    .range([0, 1000]);

  console.log(xScale);

});
