

const svg = d3.select('svg'),
    width = +svg.attr('width'),
    height = +svg.attr('height'),
    innerRadius = 120,
    outerRadius = Math.min(width, height) / 2.1,
    g = svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


const xScaleOffset = Math.PI * 0 / 180;
const x = d3.scaleBand()
    .range([xScaleOffset, 2 * Math.PI + xScaleOffset])
    .align(0);


const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];



const months2 = {};
months.forEach((m, i) => {
    months2[m] = i;
});



const y = d3.scaleLinear().range([innerRadius, outerRadius]);

const zClasses = ['Holidays & observances', 'Events', 'Births', 'Deaths'];
const colors = ['#c40000', '#ece90e', '#49ec0e', '#444444'];
const columnNames = ['holidays_and_observances', 'events', 'births', 'deaths']

const z = d3.scaleOrdinal().range(colors);

d3.json('./en-events.json', (error, data) => {
    if (error) throw error;

    x.domain(data.map((d, j) => j));
    y.domain([0, d3.max(data, (d, j) => (d.events + d.births + d.deaths + d.holidays_and_observances))]);
    z.domain(columnNames);

    // Create Tooltips
    const tip = d3
        .tip()
        .attr('class', 'd3-tip')
        // .direction('e')
        // .offset([0, 5])
        // .on('mouseout', tip.hide)
        
        .html((a, index) => {
            return `
                <b>
                    <a href="https://en.wikipedia.org/wiki/${data[index].day}" target="_blank">
                        ${data[index].day.replace('_', ' ')}
                    </a>
                </p>
                <table>
                    <tr>
                        <td style="color:${colors[0]}">${data[index][columnNames[0]]}</td>
                        <td>&mdash; ${zClasses[0].replace(/_/, ' ')}</td>
                    </tr>
                    <tr>
                        <td style="color:${colors[1]}">${data[index][columnNames[1]]}</td>
                        <td>&mdash; ${zClasses[1]}</td>
                    </tr>
                    <tr>
                        <td style="color:${colors[2]}">${data[index][columnNames[2]]}</td>
                        <td>&mdash; ${zClasses[2]}</td>
                    </tr>
                    <tr>
                        <td style="color:${colors[3]}">${data[index][columnNames[3]]}</td>
                        <td>&mdash; ${zClasses[3]}</td>
                    </tr>
                </table>
                `;
        })
        ;
        
    svg.call(tip);


    d3.select('.d3-tip')
        // .selectAll('d3-tip')
        // .data(data)
    // .join('circle')
    // .attr('r', 3)
    // .append('path')
    .on('mouseleave', tip.hide);


    // .on('mouseout', tip.hide)
    // 

    g.append('g')
        .selectAll('g')
        .data(d3.stack().keys(columnNames)(data))
        .enter()
        .append('g')
        .attr('fill', (d, j) => z(j))
        .selectAll('path')
        .data((d, j) => d)
        .enter()
        .append('path')
        .on('mouseover', tip.show)
        
        .attr('d', d3.arc()
            .innerRadius((d, j) => y(d[0]))
            .outerRadius((d, j) => y(d[1]))
            .startAngle((d, j) => x(j))
            .endAngle((d, j) => x(j) + x.bandwidth())
            .padAngle(0.0)
            .padRadius(innerRadius)
        );

    const yAxis = g.append('g')
        .attr('text-anchor', 'middle');

    const yTicksValues = d3.ticks(0, 600, 2).slice(1);

    const yTick = yAxis
        .selectAll('g')
        .data(yTicksValues)
        
        .enter()
        .append('g');

    yTick.append('circle')
        .attr('fill', 'none')
        .attr('stroke', '#ccddcc')
        .attr('r', y);

    yTick.append('text')
        .attr('y', (d, j) => -y(d))
        .attr('dy', '0.35em')
        .attr('fill', 'none')
        .attr('stroke', '#fff')
        .attr('stroke-width', 5)
        .text(y.tickFormat(5, 's'));

    yTick.append('text')
        .attr('y', (d, j) => -y(d))
        .attr('dy', '0.35em')
        .text(y.tickFormat(5, 's'));


    const label = g.append('g')
        .selectAll('g')
        .data(data)
        .enter().append('g')
        .attr('text-anchor', 'middle')
        .attr('transform', (d, j) => 'rotate(' + ((x(j) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ')translate(' + innerRadius + ',0)');

    label.append('line')
        .attr('x2', (d, j) => (d.day.split('_')[1] === '1') ? -7 : -4)
        .attr('stroke', '#000');

    label.append('text')
        .attr('transform', (d, j) => (x(j) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? 'rotate(90)translate(0,16)' : 'rotate(-90)translate(0,-9)')
        .text((d, j) => (d.day.split('_')[1] === '15')
            ? d.day.substr(0, 3).toLowerCase()
        : '');

    // Legend
    const legend = g.append('g')
        .selectAll('g')
        .data(zClasses)
        .enter().append('g')
        .attr('transform', (d, i) => 'translate(-50,' + (i - (zClasses.length - 1) / 2) * 25 + ')');

    legend.append('circle')
        .attr('r', 8)
        .attr('fill', z);

    legend.append('text')
        .attr('x', 15)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .text((d, j) => d);

});
