// (function($) {

  $(function() {
    getData(setChart);
  });

  /*案件類型直條圖*/
  function setChart(pData, pTaipeiAreaObj) {
    var index;
    if (locationType == 'all' || locationType == undefined) {
      for (var i = 0; i < pData.length; i++) {
        if (pData[i]['案件類型'] === '全部案件類型') {
          index = i;
        }
      }
    } else if (locationType == 'old') {
      for (var i = 0; i < pData.length; i++) {
        if (pData[i]['案件類型'] === '老人保護') {
          index = i;
        }
      }
    } else if (locationType == 'children') {
      for (var i = 0; i < pData.length; i++) {
        if (pData[i]['案件類型'] === '兒少保護') {
          index = i;
        }
      }
    } else if (locationType == 'intimate') {
      for (var i = 0; i < pData.length; i++) {
        if (pData[i]['案件類型'] === '親密關係') {
          index = i;
        }
      }
    }
    chartGender(pData[index]);
    chartAge(pData[index]);

    if (locationType == 'all') {
        var newType = '各里總案件數';
        var totalObj = [
          {
            "name": "士林區",
            "value": 1046
          },
          {
            "name": "文山區",
            "value": 957
          },
          {
            "name": "內湖區",
            "value": 896
          },
          {
            "name": "北投區",
            "value": 785
          },
          {
            "name": "中山區",
            "value": 782
          },
          {
            "name": "大安區",
            "value": 782
          },
          {
            "name": "萬華區",
            "value": 756
          },
          {
            "name": "信義區",
            "value": 756
          },
          {
            "name": "松山區",
            "value": 631
          },
          {
            "name": "大同區",
            "value": 587
          },
          {
            "name": "南港區",
            "value": 439
          },
          {
            "name": "中正區",
            "value": 410
          },
        ];
      } else if (locationType == 'old') {
        var newType = '老人保護';
        var totalObj = [
          {
            "name": "文山區",
            "value": 73
          },
          {
            "name": "士林區",
            "value": 63
          },
          {
            "name": "信義區",
            "value": 56
          },
          {
            "name": "大安區",
            "value": 54
          },
          {
            "name": "內湖區",
            "value": 50
          },
          {
            "name": "萬華區",
            "value": 46
          },
          {
            "name": "北投區",
            "value": 40
          },
          {
            "name": "松山區",
            "value": 39
          },
          {
            "name": "大同區",
            "value": 36
          },
          {
            "name": "中正區",
            "value": 32
          },
          {
            "name": "中山區",
            "value": 30
          },
          {
            "name": "南港區",
            "value": 20
          }
        ];
      } else if (locationType == 'children') {
        var newType = '兒少保護';
        var totalObj = [
          {
            "name": "士林區",
            "value": 89
          },
          {
            "name": "文山區",
            "value": 79
          },
          {
            "name": "萬華區",
            "value": 65
          },
          {
            "name": "中山區",
            "value": 63
          },
          {
            "name": "大安區",
            "value": 60
          },
          {
            "name": "信義區",
            "value": 58
          },
          {
            "name": "北投區",
            "value": 56
          },
          {
            "name": "內湖區",
            "value": 53
          },
          {
            "name": "大同區",
            "value": 42
          },
          {
            "name": "松山區",
            "value": 39
          },
          {
            "name": "南港區",
            "value": 36
          },
          {
            "name": "中正區",
            "value": 23
          },
        ];
      } else if (locationType == 'intimate') {
        var newType = '親密關係';
        var totalObj = [
          {
            "name": "士林區",
            "value": 527
          },
          {
            "name": "內湖區",
            "value": 514
          },
          {
            "name": "文山區",
            "value": 456
          },
          {
            "name": "大安區",
            "value": 445
          },
          {
            "name": "中山區",
            "value": 434
          },
          {
            "name": "萬華區",
            "value": 414
          },
          {
            "name": "北投區",
            "value": 381
          },
          {
            "name": "信義區",
            "value": 368
          },
          {
            "name": "松山區",
            "value": 342
          },
          {
            "name": "大同區",
            "value": 275
          },
          {
            "name": "南港區",
            "value": 236
          },
          {
            "name": "中正區",
            "value": 220
          },
        ];
      }

      setAreaTop10(newType, totalObj);
      setVillageTop30(newType);
      setVillageTop5(newType);

      function setAreaTop10(newType, totalObj) {
        var totalArr = [];
        var total = 0;
        for (var i = 0; i < TaipeiAreaNameArr.length; i++) {
          total = 0;
          for (var j = 0; j < pTaipeiAreaObj[TaipeiAreaNameArr[i]].length; j++) {
            total += pTaipeiAreaObj[TaipeiAreaNameArr[i]][j][newType];
          }
          totalArr[i] = total;
        }
        var html = '';
        for (var i = 0; i < 10; i++) {
          html += "<li>" + totalObj[i]["name"] + "</li>"
        }
        $('.area-top10 ul').append(html);
      }
      function setVillageTop30() {
        var allArr = pTaipeiAreaObj['全部'];
        bubbleSort(allArr, [newType]);
        var html = '';
        for (var i = 0; i < 30; i++) {
          html += "<li>" + allArr[i]['properties']['Substitute'] + "</li>"
        }
        $('.village-top10 ul').append(html);
      }
      function setVillageTop5() {
        var caseType = '';
        $('.chartType').change(function() {
          caseType = $(this).val() || '士林區';
          setVillageTop5Val();
        }).change();

        function setVillageTop5Val() {
          var allArr = pTaipeiAreaObj[caseType];
          bubbleSort(allArr, [newType]);
          var html = '';
          for (var i = 0; i < 5; i++) {
            html += "<li>" + allArr[i]['properties']['Substitute'] + "</li>"
          }
          $('.top5 ul li').remove();
          $('.top5 ul').append(html);
        }
      }
  }
  function chartGender(pData) {
    var data = [
      {type: '男', value: +pData['男'].replace("%", "")},
      {type: '女', value: +pData['女'].replace("%", "")}
    ]
    var width = 130,
        height = 140,
        margin = {left: 50, top: 30, right: 30, bottom: 30},
        svg_width = width + margin.left + margin.right,
        svg_height = height + margin.top + margin.bottom;

    var scale = d3.scale.linear()
      .domain([0, d3.max(data, function(d) {return d.value;})])
      .range([height, 0]);

    var scale_x = d3.scale.ordinal()
      .domain(data.map(function(d) {return d.type;}))
      .rangeBands([0, width], 0.5);

    var svg = d3.select(".chart-gender")
      .append("svg")
      .attr("width", svg_width)
      .attr("height", svg_height);

    var chart = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var x_axis = d3.svg.axis().scale(scale_x);
      y_axis = d3.svg.axis().scale(scale).orient("left").ticks(5);

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
        return "translate(" + scale_x(d.type) + ", 0)";
      });

    bar.append("rect")
      .attr({
        "y": function(d) {return scale(d.value)},
        "width": scale_x.rangeBand(),
        "height": function(d) {return height - scale(d.value)}
      })
      .style("fill", "#00bcd4");

    bar.append("text")
      .text(function(d) {return d.value})
      .attr({
        "y": function(d) {return scale(d.value)},
        "x": scale_x.rangeBand()/2,
        "dy": -5,
        "text-anchor": "middle"
      });
  }
  function chartAge(pData) {
      var data = [
        {type: '~18', value: +pData['小於18歲'].replace("%", "")},
        {type: '18~65', value: +pData['18到65歲'].replace("%", "")},
        {type: '65~', value: +pData['大於65歲'].replace("%", "")}
      ];

      var width = 130,
        height = 140,
        margin = {left: 50, top: 30, right: 30, bottom: 30},
        svg_width = width + margin.left + margin.right,
        svg_height = height + margin.top + margin.bottom;

      var scale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) {return d.value;})])
        .range([height, 0]);

      var scale_x = d3.scale.ordinal()
        .domain(data.map(function(d) {return d.type;}))
        .rangeBands([0, width], 0.3);

      var svg = d3.select(".chart-age")
        .append("svg")
        .attr("width", svg_width)
        .attr("height", svg_height);

      var chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

      var x_axis = d3.svg.axis().scale(scale_x);
        y_axis = d3.svg.axis().scale(scale).orient("left").ticks(5);

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
          return "translate(" + scale_x(d.type) + ", 0)";
        });

      bar.append("rect")
        .attr({
          "y": function(d) {return scale(d.value)},
          "width": scale_x.rangeBand(),
          "height": function(d) {return height - scale(d.value)}
        })
        .style("fill", "#00bcd4");

      bar.append("text")
        .text(function(d) {return d.value})
        .attr({
          "y": function(d) {return scale(d.value)},
          "x": scale_x.rangeBand()/2,
          "dy": -5,
          "text-anchor": "middle"
        });
    }

// })(jQuery)
