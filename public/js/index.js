// (function($) {

  $(function() {
    getData(setChart);
    // setChart();
  });

  /*案件類型直條圖*/
  function setChart(pData, pTaipeiAreaObj) {
    // d3.csv("data/case_type.csv", stringToNum, function(pData) {
      for (var i = 0; i < pData.length; i++) {
        if (pData[i]['案件類型'] === '老人保護') {
          pData['老人保護'] = pData[i]['總案件量'];
        } else if (pData[i]['案件類型'] === '兒少保護') {
          pData['兒少保護'] = pData[i]['總案件量'];
        } else if (pData[i]['案件類型'] === '親密關係') {
          pData['親密關係'] = pData[i]['總案件量'];
        } else if (pData[i]['案件類型'] === '兄弟姊妹間暴力') {
         pData['其他家虐'] = pData[i]['總案件量'];
       }
      }

      var data = [
        {type: '老人保護', value: +pData['老人保護']},
        {type: '兒少保護', value: +pData['兒少保護']},
        {type: '親密關係', value: +pData['親密關係']},
        {type: '其他家虐', value: +pData['其他家虐']}
      ];

      var width = 300,
        height = 200,
        margin = {left: 110, top: 30, right: 55, bottom: 30},
        svg_width = width + margin.left + margin.right,
        svg_height = height + margin.top + margin.bottom;

      var scale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) {return d.value;})])
        .range([0, width]);

      var scale_y = d3.scale.ordinal()
        .domain(data.map(function(d) {return d.type;}))
        .rangeBands([0, height], 0.15);

      var svg = d3.select(".chart-cont")
        .append("svg")
        .attr("width", svg_width)
        .attr("height", svg_height);

      var chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

      var x_axis = d3.svg.axis().scale(scale).ticks(5);
          y_axis = d3.svg.axis().scale(scale_y).orient("left");

      chart.append("g")
        .call(x_axis)
        .attr("transform", "translate(0, " + height + ")");
      chart.append("g")
        .call(y_axis);

      var bar = chart.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", function(d, i) {
          return "translate(0, " + scale_y(d.type) + ")";
        });

      bar.append("rect")
        .attr({
          "width": function(d) {return scale(d.value)},
          "height": scale_y.rangeBand()
        })
        .style("fill", "#00bcd4");

      bar.append("text")
        .text(function(d) {return d.value})
        .attr({
          "x": function(d) {return scale(d.value)},
          "y": scale_y.rangeBand()/2,
          "dx": 5,
          "dy": 6,
          "text-anchor": "start"
        });

      // chartAnimate();

      function chartAnimate() {
        bar.select("rect")
          .transition()
          .duration(2500)
          .attr({
            "width": function(d) {return scale(d.value)}
          });

        bar.select("text")
          .transition()
          .duration(2500)
          .attr({
            'x': function(d) {return scale(d.value)}
          })
          .tween('number', function(d) {
            var i = d3.interpolateRound(0, d.value);
            return function(t) {
              this.textContent = i(t);
            };
          });
      }
    // });
    setAreaTop10(caseType);
    setVillageTop10(caseType);

    function setAreaTop10(caseType) {
      var totalArr = [];
      var total = 0;

      for (var i = 0; i < TaipeiAreaNameArr.length; i++) {
        total = 0;
        for (var j = 0; j < pTaipeiAreaObj[TaipeiAreaNameArr[i]].length; j++) {
          total += pTaipeiAreaObj[TaipeiAreaNameArr[i]][j][caseType];
        }
        totalArr[i] = {};
        totalArr[i]['name'] = TaipeiAreaNameArr[i];
        totalArr[i]['value'] = total;
      }

      bubbleSort(totalArr, 'value');

      var html = '';
      for (var i = 0; i < 10; i++) {
        html += "<li>" + totalArr[i]["name"] + "</li>"
      }
      $('.area-top10 ul').append(html);
    }
    function setVillageTop10(caseType) {
      var allArr = pTaipeiAreaObj['全部'];
      bubbleSort(allArr, caseType);

      var html = '';
      for (var i = 0; i < 10; i++) {
        html += "<li>" + allArr[i]['properties']['T_Name'] + allArr[i]['properties']['Substitute'] + "</li>"
      }
      $('.village-top10 ul').append(html);
    }
  }
// })(jQuery)
