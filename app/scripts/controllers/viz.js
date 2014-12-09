define(['angular', 'jquery', 'lodash', 'data', 'd3', 'd3tip'], function (angular, $, _, data, d3) {
  'use strict';

  /**
   * @ngdoc function
   * @name pocketvizApp.controller:VizCtrl
   * @description
   * # VizCtrl
   * Controller of the pocketvizApp
   */
  angular.module('pocketvizApp.controllers.VizCtrl', [])
  .controller('VizCtrl', function ($scope) {

    // Get the data to visualize do some pre-processing
    data.getData();
    data.computeStats();
    data.filterOutliers();

    // DEBUG
    if(DEBUG) {
      console.log('readsList: ');
      console.log(data.readsList);
      console.log('stats: ');
      console.log(data.stats);
    }

    // Create #svgCanvas for the visualization
    // The width is calculated as number of days to visualize multiplied by the width for each day
    // The day width is calculated in order to make the average block three times as thick as it's high
    var margin = {top: 20, right: 50, bottom: 20, left: 10},
        svgHeight = 600,
        graphHeight = svgHeight - margin.top - margin.bottom,
        yScale = d3.scale.linear()
                         .range([0, (graphHeight-50)/2])
                         .domain([0, Math.max(data.stats.words.maxAddedPerDay, data.stats.words.maxReadPerDay)]),
        dayWidth = yScale(data.stats.words.averageLength)*3, // Approximate calculation
        svgWidth = Math.floor((data.stats.endTimestamp - data.stats.startTimestamp)/(60*60*24))*dayWidth,
        graphWidth = svgWidth - margin.right - margin.left,
        pocketviz = d3.select("#graph")
                      .append("svg")
                      .attr('id', 'svgCanvas')
                      .attr('width', svgWidth)
                      .attr('height', svgHeight)
                      .attr('viewbox', '0 0 '+svgWidth+' '+svgHeight)
                      .attr('preserveAspectRatio', 'xMinYMin');

    // Assign behaviour in case of window resize (for responsiveness) and size the canvas for starts
    var aspect = svgWidth / svgHeight,
        svgCanvas = $("#svgCanvas"),
        resizeCanvas = function () {
          var targetHeight = $('#graph').height();
          svgCanvas.attr("width", (targetHeight-10) * aspect);
          svgCanvas.attr("height", targetHeight-10);
        };
    $(window).on("resize", resizeCanvas);
    resizeCanvas();

    // Create a xScale() and yScale() functions
    var xScale = d3.time.scale.utc()
                        .range([0, graphWidth-margin.left-margin.right])
                        .domain([data.stats.startTime, data.stats.endTime])
                        .nice(),
        yScaleA = d3.scale.linear()
                          .range([0, (graphHeight-50)/2])
                          .domain([0, data.stats.words.maxAddedPerDay]),
        yScaleR = d3.scale.linear()
                          .range([0, (graphHeight-50)/2])
                          .domain([0, data.stats.words.maxReadPerDay]);

    // Create the xAxis and draw them
    var xAxis = d3.svg.axis()
                      .scale(xScale),
        addedAxisYear = pocketviz.append("g")
                                  .attr('id', 'addedAxisYear')
                                  .attr("class", "axis")
                                  .attr('transform', 'translate('+margin.left+','+(margin.top+25)+')')
                                  .call(xAxis.orient('top')
                                             .ticks(d3.time.year.utc, 1)
                                             .tickFormat(d3.time.format('%Y'))
                                             .innerTickSize(25)
                                       )
                                  .selectAll('text')
                                  .attr('y', -17)
                                  .attr('x', 5)
                                  .attr('style', 'text-anchor: left'),
        addedAxisMonth = pocketviz.append("g")
                                  .attr('id', 'addedAxisMonth')
                                  .attr("class", "axis")
                                  .attr('transform', 'translate('+margin.left+','+(margin.top+25)+')')
                                  .call(xAxis.orient('top')
                                             .ticks(d3.time.month.utc, 1)
                                             .tickFormat(d3.time.format('%b'))
                                             .innerTickSize(16)
                                       )
                                  .selectAll('text')
                                  .attr('y', -7)
                                  .attr('x', 5)
                                  .attr('style', 'text-anchor: left'),
        addedAxisDay = pocketviz.append("g")
                                  .attr('id', 'addedAxisDay')
                                  .attr("class", "axis")
                                  .attr('transform', 'translate('+margin.left+','+(margin.top+25)+')')
                                  .call(xAxis.orient('top')
                                             .ticks(d3.time.day.utc, 1)
                                             .tickFormat(d3.time.format(''))
                                             .innerTickSize(5)
                                       )
                                  .selectAll('text')
                                  .remove(),
        readAxisYear = pocketviz.append("g")
                                 .attr('id', 'readAxisYear')
                                 .attr("class", "axis")
                                 .attr('transform', 'translate('+margin.left+','+(graphHeight-margin.bottom)+')')
                                 .call(xAxis.orient('bottom')
                                            .ticks(d3.time.year.utc, 1)
                                            .tickFormat(d3.time.format('%Y'))
                                            .innerTickSize(25)
                                      )
                                 .selectAll('text')
                                 .attr('y', 17)
                                 .attr('x', 5)
                                 .attr('style', 'text-anchor: left'),
        readAxisMonth = pocketviz.append("g")
                                 .attr('id', 'readAxisMonth')
                                 .attr("class", "axis")
                                 .attr('transform', 'translate('+margin.left+','+(graphHeight-margin.bottom)+')')
                                 .call(xAxis.orient('bottom')
                                            .ticks(d3.time.month.utc, 1)
                                            .tickFormat(d3.time.format('%b'))
                                            .innerTickSize(16)
                                      )
                                 .selectAll('text')
                                 .attr('y', 7)
                                 .attr('x', 5)
                                 .attr('style', 'text-anchor: left'),
        readAxisDay = pocketviz.append("g")
                                 .attr('id', 'readAxisDay')
                                 .attr("class", "axis")
                                 .attr('transform', 'translate('+margin.left+','+(graphHeight-margin.bottom)+')')
                                 .call(xAxis.orient('bottom')
                                            .ticks(d3.time.day.utc, 1)
                                            .tickFormat(d3.time.format(''))
                                            .innerTickSize(5)
                                      )
                                 .selectAll('text')
                                 .remove();

    // TODO Add boxes to highlight adds and reads together with text


    // Add Tooltip
    var tooltip = d3.tip()
                    .attr('class', 'd3-tip')
                    .html(function(d) {
                      return d.resolved_title;
                    })
                    .offset([-12, 0]);
    pocketviz.call(tooltip)

    // Process points
    data.readsList = _.map(data.readsList, function (d) {

      // calculate values
      d.points             = {};
      d.points.addedRect   = {};
      d.points.addedRect.x = xScale(new Date(_.parseInt(d.day_added)*1000));
      d.points.addedRect.y = yScaleA(d.addedWordOffset);
      d.points.addedRect.w = dayWidth;
      d.points.addedRect.h = yScaleA(_.parseInt(d.word_count));

      d.points.readRect    = {};
      d.points.readRect.x  = xScale(new Date(_.parseInt(d.day_read)*1000));
      d.points.readRect.y  = 495-yScaleR(_.parseInt(d.word_count))-yScaleR(d.readWordOffset);
      d.points.readRect.w  = dayWidth;
      d.points.readRect.h  = yScaleR(_.parseInt(d.word_count));

      d.points.p1          = {};
      d.points.p1.x        = d.points.addedRect.x+d.points.addedRect.w;
      d.points.p1.y        = d.points.addedRect.y;

      d.points.p2          = {};
      d.points.p2.x        = d.points.readRect.x;
      d.points.p2.y        = d.points.readRect.y;
      d.points.p2.cx1      = d.points.p1.x+(d.points.p2.x-d.points.p1.x)/2;
      d.points.p2.cy1      = d.points.p2.y;
      d.points.p2.cx2      = d.points.p2.x-(d.points.p2.x-d.points.p1.x)/3;
      d.points.p2.cy2      = d.points.p2.y;

      d.points.p3          = {};
      d.points.p3.x        = d.points.readRect.x;
      d.points.p3.y        = d.points.readRect.y + d.points.readRect.h;

      d.points.p4          = {};
      d.points.p4.x        = d.points.addedRect.x + d.points.readRect.w;
      d.points.p4.y        = d.points.addedRect.y + d.points.addedRect.h;
      d.points.p4.cx1      = d.points.p4.x+(d.points.p3.x-d.points.p4.x)/2;
      d.points.p4.cy1      = d.points.p3.y;
      d.points.p4.cx2      = d.points.p4.x+(d.points.p3.x-d.points.p4.x)/3;
      d.points.p4.cy2      = d.points.p4.y;

      return d;
    });

    // Draw the data
    var dataPlots = pocketviz.append("g")
                             .attr('id', 'dataPlots')
                             .attr('transform', 'translate('+margin.left+','+(margin.top+25)+')')
                             .selectAll('g')
                             .data(data.readsList)
                             .enter()
                             .append('g')
                               .attr('class', 'readblock')
                               .attr('id', function (d) {
                                 return d.item_id;
                               });
    dataPlots.append('path')
             .attr('class', 'wave')
             .attr("d", function (d) {    // the d3 line function does not help in this case so we generate the d attr directly here
               var dStr = '';
               // build the string
               dStr += 'M ' + d.points.p1.x   + ',' + d.points.p1.y   + ' ';
               dStr += 'C ' + d.points.p2.cx1 + ',' + d.points.p2.cy1 + ' ' + d.points.p2.cx2 + ',' + d.points.p2.cy2 + ' ' + d.points.p2.x + ',' + d.points.p2.y + ' ';
               dStr += 'L ' + d.points.p3.x   + ',' + d.points.p3.y   + ' ';
               dStr += 'C ' + d.points.p4.cx1 + ',' + d.points.p4.cy1 + ' ' + d.points.p4.cx2 + ',' + d.points.p4.cy2 + ' ' + d.points.p4.x + ',' + d.points.p4.y + ' ';
               dStr += 'z';
               return dStr;
             })
             .attr("visibility", function(d,i){
               if(d.time_read == '0') return "hidden";
             })
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);;
    dataPlots.append('rect')
             .attr('class', 'added')
             .attr('x', function (d) { return d.points.addedRect.x })
             .attr('y', function (d) { return d.points.addedRect.y })
             .attr('width', function (d) { return d.points.addedRect.w })
             .attr('height', function (d) { return d.points.addedRect.h })
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);
    dataPlots.insert('rect',':first-child')
             .attr('class', 'read')
             .attr("visibility", function(d,i){
               if(d.time_read == '0') return "hidden";
             })
             .attr('x', function (d) { return d.points.readRect.x })
             .attr('y', function (d) { return d.points.readRect.y })
             .attr('width', function (d) { return d.points.readRect.w })
             .attr('height', function (d) { return d.points.readRect.h })
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);

    // Cleanup hidden stuff
    d3.selectAll("rect[visibility=hidden]").remove();
    d3.selectAll("path[visibility=hidden]").remove();


  });
});
