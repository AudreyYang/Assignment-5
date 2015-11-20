/**
 * Created by audreyyang on 11/20/15.
 */
console.log("Assignment 5");
var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;
var canvas = d3.select('.canvas');
var map = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');
//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLngLat = [-71.088066,42.315520]; //from http://itouchmap.com/latlong.html
var projection = d3.geo.mercator()
    .translate([width/2,height/2])
    .center([bostonLngLat[0],bostonLngLat[1]])
    .scale(100000/.5)
//TODO: create a geo path generator
var pathGenerator = d3.geo.path().projection(projection);
//TODO: create a color scale
var colorScale=d3.scale.linear().domain([0,300000]).range(['red','blue']);
//var colorScale = d3.scale.linear().domain([0,.2]).range(['white','blue']);
//TODO: create a d3.map() to store the value of median HH income per block group
var incomeById=d3.map()
//TODO: import data, parse, and draw
queue()
    .defer(d3.json,'data/bos_census_blk_group.geojson')
    .defer(d3.json,'data/bos_neighborhoods.geojson')
    .defer(d3.csv,'data/acs2013_median_hh_income.csv',parseData)
    .await(function(err,census,neighbors){
        draw(census,neighbors)
    })
function parseData(d){
    incomeById.set(
        d.geoid,
        {income:+d.B19013001, name:d.name}
    )
}
function draw(census,neighbors){
    var mapA = map.append('g')
        .selectAll('.map-census')
        .data(census.features)
        .enter()
        .append('g')
        .attr('class','map-census')
    mapA
        .append('path')
        .attr('d', pathGenerator)
        .style('fill',function(d){
            var income=(incomeById.get(d.properties.geoid)).income
            console.log(income);
            return colorScale(income);})
        .call(getTooltips)
    var mapB= map.append('g')
        .selectAll('.map2-neighbors')
        .data(neighbors.features)
        .enter()
        .append('g')
        .attr('class','map2-neighbors')
    mapB
        .append('path')
        .attr('d', pathGenerator)
        .style('fill','none')
        .style('stroke','white')
    mapB
        .append('text')
        .attr('class','text')
        .attr("text-anchor", "middle")
        .text(function(d){return d.properties.Name;})
        .attr('dx',function(d){return pathGenerator.centroid(d)[0]})
        .attr('dy',function(d){return pathGenerator.centroid(d)[1]})
        .style('fill','rgb(100,100,100)')
    mapB
        .on('mouseenter',function(d){
            //console.log(this);
            d3.selectAll('text')
                .transition().style('fill','rgb(77,225,38)')
        })
        .on('mouseleave',function(d){
            d3.selectAll('text').style('fill','rgb(100,100,100)')
        })
}
function getTooltips(selection){
    selection
        .on('mouseenter',function(d){
            var name=(incomeById.get(d.properties.geoid)).name
            var value=(incomeById.get(d.properties.geoid)).income
            console.log("name is "+name)
            console.log("income is "+income)
            var tooltip=d3.select('.custom-tooltip');
            tooltip
                .transition()
                .style('opacity',1);
            tooltip.select('#value').html(income);
        })
        .on('mousemove',function(){
            var xy=d3.mouse(canvas.node());
            var tooltip=d3.select('.custom-tooltip');
            tooltip
                .style('left',xy[0]+50+'px')
                .style('top',(xy[1]+50)+'px')
            //.html('test');
        })
        .on('mouseleave',function(){
            var tooltip=d3.select('custom-tooltip')
                .transition()
                .style('opacity',0);
        }
    )
}
