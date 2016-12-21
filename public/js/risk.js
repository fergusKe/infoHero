(function($) {
  $(function() {
    /*啟動loading效果*/
    $(".fakeloader").fakeLoader({
        bgColor:"#0296a9",
        zIndex: '1001',
        spinner:"spinner3"
    });
    var TaipeiAreaNameArr = ["士林區", "文山區", "內湖區", "北投區", "中山區", "大安區", "信義區", "萬華區", "松山區", "大同區", "南港區", "中正區"];
    var TaipeiAreaObj = {};
    TaipeiAreaObj['全部'] = [];
    var locationParam = location.href.split("?")[1];
    if (locationParam) {
      var locationType = locationParam.split("=")[1];
    }

    d3.json("data/county.json", function(topodata) {
      d3.csv("data/district_rank_village.csv", function(mapInfo) {
        var result = {};
        var caseType = "avg_predict";
        var TaipeiVillageArr = [];
        var TaipeiVillageNameArr = [];
        var village;
        var temp = [];
        for (var i = 0 ; i < mapInfo.length - 1; i++) {
          village = mapInfo[i]["town"];
          if(village){
            // console.log('village = ', village);
            // village = village.replace("台","臺");
            TaipeiVillageNameArr[i] = village;
            result[village] = result[village] || {};
            result[village]["avg_predict"] = +(+mapInfo[i]["avg_predict"]).toFixed(2);
            result[village]["fivequintiles"] = +(+mapInfo[i]["fivequintiles"]).toFixed(2);
          }
        }

        var villageTopojson = topojson.feature(topodata, topodata.objects["Village_NLSC_121_1050715"]);
        var features = villageTopojson.features;

        features = features.map(function(f) {
          if ( f.properties.C_Name === "臺北市" && checkAvailability(TaipeiAreaNameArr, f.properties.T_Name) ) {
            if(result[f.properties.Substitute]) {
              f["avg_predict"] = +result[f.properties.Substitute]["avg_predict"] || 1;
              f["fivequintiles"] = +result[f.properties.Substitute]["fivequintiles"] || 1;
            } else {
              f["avg_predict"] = 1;
              f["fivequintiles"] = 1;
            }

            TaipeiVillageArr.push(f);

            if (!TaipeiAreaObj[f.properties.T_Name]){
              TaipeiAreaObj[f.properties.T_Name]=[];
            }
            TaipeiAreaObj[f.properties.T_Name].push(f);

            TaipeiAreaObj['全部'].push(f);
          }
        });

        features = TaipeiVillageArr;
        villageTopojson.features = TaipeiVillageArr;

        var taipeiStatesData = topojson.feature(topodata, topodata.objects["Village_NLSC_121_1050715"]);

        var map = L.map('map').setView([25.08112, 121.5602], 11);

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
          maxZoom: 18,
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
          id: 'mapbox.light'
        }).addTo(map);

        // control that shows state info on hover
        var info = L.control();

        info.onAdd = function (map) {
         this._div = L.DomUtil.create('div', 'info');
         this.update();
         return this._div;
        };

        info.update = function (props) {
         this._div.innerHTML = '<h4>台北市熱區地圖</h4>' +  (props ?
           '<b>台北市 ' + props.properties.V_Name + '</b><br />' + '風險分數：' + props[caseType]
           : '請將滑鼠移至村里位置');
        };

        info.addTo(map);

        // get color depending on population density value
        function getColor(d) {
          return d >= 5 ? '#5A0000' :
                 d >= 4 ? '#9C0000' :
                 d >= 3 ? '#DE1021' :
                 d >= 2 ? '#FF4D52' :
                           '#FF7D84';
        }
        function style(features, typeOfCases) {
          if (typeOfCases == undefined) {
            features.thisValue = +features["fivequintiles"];
          } else {
            features.thisValue = +features[typeOfCases];
          }

          return {
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
            fillColor: getColor(features.thisValue)
          };
        }

        function highlightFeature(e) {
         var layer = e.target;

         layer.setStyle({
           weight: 5,
           color: '#666',
           dashArray: '',
           fillOpacity: 0.7
         });

         if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
           layer.bringToFront();
         }

         info.update(layer.feature);
        }

        var geojson;

        function resetHighlight(e) {
         geojson.resetStyle(e.target);
         info.update();
        }

        function zoomToFeature(e) {
          var layer = e.target;
          var villageName = layer.feature.properties.Substitute;
   			 //  map.fitBounds(e.target.getBounds());
          store.set('villageName', villageName);
          top.location.href = 'village.html';
        }

        function onEachFeature(feature, layer) {
          layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
          });
        }

        geojson = L.geoJson(villageTopojson, {
          style: style,
          onEachFeature: onEachFeature
        }).addTo(map);

        map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');

        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

         var div = L.DomUtil.create('div', 'info legend'),
           grades = [0, 20, 40, 60, 80, 100],
           grades_data = [0, 1, 2, 3, 4, 5],
           labels = [],
           from, to;

         for (var i = 0; i < grades.length - 1; i++) {
           from = grades[i];
           from_data = grades_data[i];
           to = grades[i + 1];

           labels.push(
             '<i style="background:' + getColor(from_data + 1) + '"></i> ' +
             from + (to ? '&ndash;' + to : '+'));
         }

         div.innerHTML = labels.join('<br>');
         return div;
        };

        legend.addTo(map);

        setNav();
        rankList(TaipeiAreaObj);
        district_rank_area();
        district_rank_village(mapInfo);

        /*關閉loading效果*/
        $(".fakeloader").fadeOut(500, function() {

        });

      });
    });

    function checkAvailability(arr, val) {
      return arr.some(function(arrVal) {
        return val === arrVal;
      });
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

      var svg = d3.select(".distribution-Statistics")
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
        .style("fill", "#489de4");

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
        .rangeBands([0, width], 0.3);

      var svg = d3.select(".distribution-Statistics2")
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
        .style("fill", "#489de4");

      bar.append("text")
        .text(function(d) {return d.value})
        .attr({
          "y": function(d) {return scale(d.value)},
          "x": scale_x.rangeBand()/2,
          "dy": -5,
          "text-anchor": "middle"
        });
    }

    function stringToNum(d) {
      d.value = +d.value;
      return d;
    }

    /*nav*/
    function setNav() {
      var navTitle = $('.nav-title');
      var navListBox = $('.nav-list-box');
      var navListBoxLi = $('.nav-list-box li');
      var navList = $('.nav-list');
      var navListBoxMaxHeight = 180;
      var navList1_H = $('.nav-title1-list-box').height();
      var navList2_H = $('.nav-title2-list-box').height();
      var navList3_H = $('.nav-title3-list-box').height();
      var navList4_H = $('.nav-title4-list-box').height();

      var navListHeightArr = [navList1_H, navList2_H, navList3_H, navList4_H];
      var navNowIndex = 0;
      var navObj = {
        index: 0,
        dropdown: [{
          name: 'title1',
          show: 0
        },{
          name: 'title2',
          show: 0
        },{
          name: 'title3',
          show: 0
        },{
          name: 'title4',
          show: 0
        }]
      }
      var navHoverShowHeight = 5;
      var showObj = {
        display: 'block'
      }
      var hideObj = {
        display: 'none'
      }
      navTitle.hover(function() {
        navNowIndex = $(this).index();
        navTitle.removeClass('active').eq(navNowIndex).addClass('active');

        navListBox.css( hideObj ).eq(navNowIndex).css({
          display: 'block'
        });
        if (navNowIndex == 3) {
          $('.nav-list-box').eq(navNowIndex).css({
            'overflow-y': 'hidden'
          });
        }
        var nowNavListBoxHeight = navListBox.eq(navNowIndex).find('ul').outerHeight(true);

        if (nowNavListBoxHeight > 180) {
          nowNavListBoxHeight = 180;
        }
        navListHeightArr[navNowIndex] = nowNavListBoxHeight;

        navListBox.eq(navNowIndex).css({
          top: -navListHeightArr[navNowIndex] + navHoverShowHeight
        });
      }, function() {
        navTitle.removeClass('active');
        navObj.index = navNowIndex;
        navObj.dropdown[navObj.index].show = 0;
        navListBox.eq(navObj.index).css( hideObj );
      });
      navListBox.hover(function() {
        $(this).css( showObj );
        navTitle.removeClass('active').eq(navNowIndex).addClass('active');
        if (navNowIndex == 3) {
          $('.nav-list-box').eq(navNowIndex).css({
            'overflow-y': 'auto'
          });
        }
      }, function() {
        navListBox.eq(navObj.index).css( hideObj );
        navObj.dropdown[navObj.index].show = 0;
        navTitle.removeClass('active');
      });

      var _navListShow_TL = new Array(4);
      navTitle.click(function() {
        var navLi = navListBox.eq(navNowIndex).find('li');
        var navLiLength = navLi.length;
        navNowIndex = $(this).index();

        if( navObj.dropdown[navObj.index].show === 1 ) {
          TweenMax.to(navListBox.eq(navNowIndex), .3, {
            top: -navListHeightArr[navNowIndex] + navHoverShowHeight
          });

          navObj.dropdown[navNowIndex].show = 0;
          navObj.index = navNowIndex;
        } else {
          TweenMax.to(navListBox.eq(navNowIndex), .3, {
            top: 0,
            onComplete: function() {

            }
          });

          if (!_navListShow_TL[navNowIndex]) {
            _navListShow_TL[navNowIndex] = new TimelineLite();
            if (navNowIndex == 3) {
              navListBox.eq(navNowIndex).find('li:lt(12)').addClass('show');

              _navListShow_TL[navNowIndex].add(function() {
                $('.nav-title4-list-box').animate({scrollTop: 0}, 0);
                navListBox.eq(navNowIndex).find('li:not(.show)').css({opacity: 0});
              })
              _navListShow_TL[navNowIndex].add(
                  TweenMax.staggerFrom(navListBox.eq(navNowIndex).find('li.show'), .3, {
                  delay: .3,
                  top: 30,
                  opacity: 0
                }, .05)
              )
              _navListShow_TL[navNowIndex].add(
                TweenMax.fromTo(navListBox.eq(navNowIndex).find('li:not(.show)'), .3, {
                  top: 30,
                  opacity: 0
                }, {
                  top: 0,
                  opacity: 1
                }), "-=0.3"
              )
            } else {
              _navListShow_TL[navNowIndex].add(
                  TweenMax.staggerFrom(navLi, .3, {
                  delay: .3,
                  top: 30,
                  opacity: 0
                }, .05)
              )
            }
          }
          _navListShow_TL[navNowIndex].restart();

          navObj.dropdown[navObj.index].show = 0;
          navObj.dropdown[navNowIndex].show = 1;
          navObj.index = navNowIndex;
        };
      });
      navListBox.on('click', 'li', function() {
        $(this).addClass('active').siblings('li').removeClass('active');
      });

      // nav-data
      $('.nav-title3-list li').click(function() {
        if ($(this).hasClass('active')) return;
        var area = $(this).text();
        var name = '';
        var j_navVillageCont =  $('.nav-title4-list');
        j_navVillageCont.find('li').remove();
        for ( var i = 0; i < TaipeiAreaObj[area].length; i++ ) {
            name = TaipeiAreaObj[area][i].properties.Substitute;
            j_navVillageCont.append( "<li><a href=\"village.html\">" + name + "</a></li>" );
        }
        _navListShow_TL[3] = false;
      });
      $('.nav-title3-list li').eq(0).click();
    }

    var swap = function(data, i, j){
        var tmp = data[i];
        data[i] = data[j];
        data[j] = tmp;
    };
    var bubbleSort = function(data, type){
        var flag = true;
        for(var i = 0; i < data.length - 1 && flag; i++){
            flag = false;
            for(var j = 0; j < data.length - i - 1; j++){
                if(data[j+1][type] > data[j][type]){
                    swap(data, j+1, j);
                    flag = true;
                }
            }
        }
    };

    function rankList(pTaipeiAreaObj) {
      // TaipeiAreaNameArr
      var areaArr = [];
    }

    function district_rank_area() {
      d3.csv("data/district_rank_area.csv", function(data) {

        bubbleSort(data, 'avg_predict');

        var html = '';
        for (var j = 0; j < 10; j++) {
          html += "<li>" + data[j]['district'] + "</li>"
        }
        $('.area-top10 ul').append(html);
      });
    }

    function district_rank_village(mapInfo) {
      var data = mapInfo;

      bubbleSort(data, 'avg_predict');



      var html = '',
          area = '';
      for (var j = 0; j < 10; j++) {
        area = getArea(data[j]['town']);
        html += "<li>" + area + data[j]['town'] + "</li>"
      }
      $('.village-top10 ul').append(html);

      function getArea(town) {
        var area = '';
        for (var i = 0; i < TaipeiAreaNameArr.length; i++) {
          for (var j = 0; j < TaipeiAreaObj[TaipeiAreaNameArr[i]].length; j++) {
            if (TaipeiAreaObj[TaipeiAreaNameArr[i]][j]['properties']['Substitute'] == town) {
              area = TaipeiAreaObj[TaipeiAreaNameArr[i]][j]['properties']['T_Name'];
            }
          }
        }
        return area;
      }
    }
  });
})(jQuery)
