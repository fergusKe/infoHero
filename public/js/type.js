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
    } else if (locationType == 'other') {
      for (var i = 0; i < pData.length; i++) {
        if (pData[i]['案件類型'] === '兄弟姊妹間暴力') {
          index = i;
        }
      }
    }

    chartGender(pData[index]);
    chartAge(pData[index]);

    setTypeTitle(caseType, pData[index]);
    setAreaTop10(caseType);
    setVillageTop30(caseType);
    setVillageTop5(caseType);

    function setTypeTitle(caseType, pData) {
      var type, data;
      switch(true) {
        case caseType === '各里總案件數':
          type = '全部';
          $('.nav-title2-list-box li').eq(0).addClass('active');
          break;
        case caseType === '老人保護':
          type = caseType;
          $('.nav-title2-list-box li').eq(1).addClass('active');
          break;
        case caseType === '兒少保護':
          type = caseType;
          $('.nav-title2-list-box li').eq(2).addClass('active');
          break;
        case caseType === '親密關係':
          type = caseType;
          $('.nav-title2-list-box li').eq(3).addClass('active');
          break;
        case caseType === '兄弟姊妹間暴力':
          type = '其他家虐';
          $('.nav-title2-list-box li').eq(4).addClass('active');
          break;
      }
      pData = +pData['總案件量'];
      $('.type-name').text(type);
      $('.type-num').text(pData);
    }
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
    function setVillageTop30(caseType) {
      var allArr = pTaipeiAreaObj['全部'];
      bubbleSort(allArr, caseType);

      var html = '';
      for (var i = 0; i < 30; i++) {
        html += "<li>" + allArr[i]['properties']['T_Name'] + allArr[i]['properties']['Substitute'] + "</li>"
      }
      $('.village-top10 ul').append(html);
    }
    function setVillageTop5(caseType) {
      var caseType = '';
      $('.chartType').change(function() {
        caseType = $(this).val() || '士林區';
        setVillageTop5Val();
      }).change();

      function setVillageTop5Val() {
        var allArr = pTaipeiAreaObj[caseType];
        bubbleSort(allArr, caseType);
        var html = '';
        for (var i = 0; i < 5; i++) {
          html += "<li>" + allArr[i]['properties']['Substitute'] + "</li>"
        }
        $('.top5 ul li').remove();
        $('.top5 ul').append(html);
      }
    }
  }
  function adjustVal(data) {
    var dataArr = [];
    var totalVal = 0;
    var maxVal = data[0].value;
    var maxIndex = 0;
    var difference = 0;
    for(var i = 0; i < data.length; i++) {
      dataArr.push(data[i].value);
      totalVal += data[i].value;
      if (data[i].value > maxVal) {
        maxIndex = i;
        maxVal = data[i].value;
      }
    }
    difference = 100 - totalVal;
    data[maxIndex].value += difference;
    return data;
  }
  function chartGender(pData) {
    var data = [
      {type: '男', value: Math.round( +pData['男'].replace("%", "") )},
      {type: '女', value: Math.round( +pData['女'].replace("%", "") )}
    ];
    data = adjustVal(data);

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
        {type: '~18', value: Math.round( +pData['小於18歲'].replace("%", "") )},
        {type: '18~65', value: Math.round( +pData['18到65歲'].replace("%", "") )},
        {type: '65~', value: Math.round( +pData['大於65歲'].replace("%", "") )}
      ];
      data = adjustVal(data);
      
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
