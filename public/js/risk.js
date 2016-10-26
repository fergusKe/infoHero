(function($) {
  $(function() {
    var TaipeiAreaArr = ["士林區", "文山區", "內湖區", "北投區", "中山區", "大安區", "信義區", "萬華區", "松山區", "大同區", "南港區", "中正區"];
    var TaipeiAreaInfo = {};
    TaipeiAreaInfo['全部'] = [];
    var locationParam = location.href.split("?")[1];
      if (locationParam) {
        var locationType = locationParam.split("=")[1];
      }
    
    d3.json("data/county.json", function(topodata) {
      d3.csv("data/mapInfo.csv", function(mapInfo) {
        // console.log('mapInfo = ', mapInfo);
        var result = {};
        var caseType = "各里總案件數";
        var TaipeiVillageArr = [];
        var village;
        var temp = [];
        for (var i = 0 ; i < mapInfo.length - 1; i++) {
          village = mapInfo[i]["里"];
          if(village){
            // console.log('village = ', village);
            village = village.replace("台","臺");
            result[village] = result[village] || {};
            result[village]["兄弟姊妹間暴力"] = +mapInfo[i]["兄弟姊妹間暴力"].replace("%", "") || 0;
            result[village]["老人保護"] = +mapInfo[i]["老人保護"].replace("%", "") || 0;
            result[village]["兒少保護"] = +mapInfo[i]["兒少保護"].replace("%", "") || 0;
            result[village]["親密關係"] = +mapInfo[i]["親密關係"].replace("%", "") || 0;
            result[village]["其他家虐"] = +mapInfo[i]["其他家虐"].replace("%", "") || 0;
            result[village]["低收"] = +mapInfo[i]["低收"].replace("%", "") || 0;
            result[village]["障礙"] = +mapInfo[i]["障礙"].replace("%", "") || 0;
            result[village]["各里總案件數"] = +mapInfo[i]["各里總案件數"].replace("%", "") || 0;
          }
        }

        var villageTopojson = topojson.feature(topodata, topodata.objects["Village_NLSC_121_1050715"]);
        var features = villageTopojson.features;
        
        features = features.map(function(f) {
          if ( f.properties.C_Name === "臺北市" && checkAvailability(TaipeiAreaArr, f.properties.T_Name) ) {
            if(result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]) {
              f["兄弟姊妹間暴力"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["兄弟姊妹間暴力"] || 0;
              f["老人保護"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["老人保護"] || 0;
              f["兒少保護"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["兒少保護"] || 0;
              f["親密關係"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["親密關係"] || 0;
              f["其他家虐"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["其他家虐"] || 0;
              f["低收"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["低收"] || 0;
              f["障礙"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["障礙"] || 0;
              f["各里總案件數"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["各里總案件數"] || 0;
            } else {
              f["兄弟姊妹間暴力"] = 0;
              f["老人保護"] = 0;
              f["兒少保護"] = 0;
              f["親密關係"] = 0; 
              f["其他家虐"] = 0;
              f["低收"] = 0;
              f["障礙"] = 0;
              f["各里總案件數"] = 0;      
            }

            TaipeiVillageArr.push(f);

            if (!TaipeiAreaInfo[f.properties.T_Name]){
              TaipeiAreaInfo[f.properties.T_Name]=[];
            }
            TaipeiAreaInfo[f.properties.T_Name].push(f);

            TaipeiAreaInfo['全部'].push(f);
          }
        });
        // console.log('features = ', features);
        // console.log('TaipeiAreaInfo = ', TaipeiAreaInfo);
        features = TaipeiVillageArr;
        villageTopojson.features = TaipeiVillageArr;
        // console.log('features = ', features);
        // console.log('TaipeiVillageArr = ', TaipeiVillageArr);
        // console.log('TaipeiVillageArr.area = ', TaipeiVillageArr.area);
        // console.log('villageTopojson = ', villageTopojson);

        var taipeiStatesData = topojson.feature(topodata, topodata.objects["Village_NLSC_121_1050715"]);

        // console.log('statesData = ', statesData);
        // console.log('taipeiStatesData = ', taipeiStatesData);

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
           '<b>台北市 ' + props.properties.V_Name + '</b><br />' + '案件數：' + props[caseType]
           : '請將滑鼠移至村里位置');
        };

        info.addTo(map);

        // get color depending on population density value
        function getColor(d) {
          return d > 26 ? '#5A0000' :
                 d > 21  ? '#9C0000' :
                 d > 16  ? '#DE1021' :
                 d > 11  ? '#FF4D52' :
                            '#FF7D84';
        }
        // typeOfCases = "全部";
        function style(features, typeOfCases) {
          // console.log('style = ', features);
          // console.log('typeOfCases = ', typeOfCases);
          if (typeOfCases == undefined) {
            features.thisValue = +features["各里總案件數"];
          } else {
            features.thisValue = +features[typeOfCases];
          }
          
          // console.log('typeOfCases = ', typeOfCases);
          

          if (locationType == 'all') {
            $('.type-name').text('全部');
            $('.type-num').text(8928);
            features.thisValue = +features["各里總案件數"];
            $('.nav-title2-list-box li').eq(0).addClass('active');
          } else if (locationType == 'old') {
            $('.type-name').text('老人保護');
            $('.type-num').text(541);
            features.thisValue = +features["老人保護"];
            $('.nav-title2-list-box li').eq(1).addClass('active');
          } else if (locationType == 'children') {
            $('.type-name').text('兒少保護');
            $('.type-num').text(681);
            features.thisValue = +features["兒少保護"];
            $('.nav-title2-list-box li').eq(2).addClass('active');
          } else if (locationType == 'intimate') {
            $('.type-name').text('親密關係');
            $('.type-num').text(4662);
            features.thisValue = +features["親密關係"];
            $('.nav-title2-list-box li').eq(3).addClass('active');
          } else if (locationType == 'other') {
            $('.type-name').text('其他家虐');
            $('.type-num').text(2729);
            features.thisValue = +features["其他家虐"];
            $('.nav-title2-list-box li').eq(4).addClass('active');
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
         // console.log('layer.feature = ', layer.feature);
         // layer.feature.thisValue = +layer.feature["兒少保護"];
         info.update(layer.feature);
        }

        var geojson;

        function resetHighlight(e) {
         geojson.resetStyle(e.target);
         info.update();
        }

        function zoomToFeature(e) {
         map.fitBounds(e.target.getBounds());
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

        /*切換行政區*/
        // $('.nav-title2-list li').click(function() {
        //   caseType = $(this).attr("name");
        //   console.log('caseType = ', caseType);
        //   $('.leaflet-zoom-animated g path').remove();
        //   geojson = L.geoJson(villageTopojson, {
        //     style: function (feature) {
        //       // console.log('feature = ', feature);
        //         return {
        //           weight: 2,
        //           opacity: 1,
        //           color: 'white',
        //           dashArray: '3',
        //           fillOpacity: 0.7,
        //           fillColor: getColor(feature[caseType])
        //         };
        //     },
        //     onEachFeature: onEachFeature
        //   }).addTo(map);
        // });

        map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');

        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

         var div = L.DomUtil.create('div', 'info legend'),
           grades = [0, 20, 40, 60, 80, 100],
           grades_data = [1, 11, 16, 21, 26, 65],
           labels = [],
           from, to;

         for (var i = 0; i < grades.length - 1; i++) {
           from = grades[i];
           from_data = grades_data[i]
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
        // console.log('TaipeiAreaInfo = ', TaipeiAreaInfo);
        rankList(TaipeiAreaInfo);

      });
    });

    function checkAvailability(arr, val) {
      return arr.some(function(arrVal) {
        return val === arrVal;
      });
    }

    // Statistics Chart
    // d3.csv("data/district_rank_area.csv", function(data) {
    //   console.log('data = ', data);
      
    // });
    // console.log('全部案件類型', info)
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
          // svg_width = 450,
          // svg_height = 250

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
        .domain(data.map(function(d) {return d.type;}))  // 影片有錯，是year，不是population
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
          // console.log('scale_x(d.type) = ', scale_x(d.type));
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
    /*show nav-list*/
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

      // navListBox.each(function() {
      //   $(this).find('li').eq(0).click();
      // })
      // var navList1_H = $('.nav-title1-list').outerHeight(true);
      // var navList2_H = $('.nav-title2-list').outerHeight(true);
      // var navList3_H = $('.nav-title3-list').outerHeight(true);
      // var navList4_H = $('.nav-title4-list').outerHeight(true);
      // console.log('navList1_H = ', navList1_H);
      
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
        // console.log('nowNavListBoxHeight = ', nowNavListBoxHeight);

        if (nowNavListBoxHeight > 180) {
          nowNavListBoxHeight = 180;
        }
        navListHeightArr[navNowIndex] = nowNavListBoxHeight;
        // console.log('navListHeightArr = ', navListHeightArr);

        navListBox.eq(navNowIndex).css({
          top: -navListHeightArr[navNowIndex] + navHoverShowHeight
        });
        // console.log('top = ', -navListHeightArr[navNowIndex] + navHoverShowHeight);

        // $('.nav-list-box').css({
        //   'overflow-y': 'hidden'
        // });
        
        // console.log('hover = ', navObj.index);
      }, function() {
        navTitle.removeClass('active');
        navObj.index = navNowIndex;
        navObj.dropdown[navObj.index].show = 0;
        navListBox.eq(navObj.index).css( hideObj );

        // console.log('leave = ', navObj.index);
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

      // var _navListShow_TL;
      var _navListShow_TL = new Array(4);
      // var _nowNavListShow_TL;
      navTitle.click(function() {
        // var nowNavListBoxHeight = navListBox.eq(navNowIndex).height();
        var navLi = navListBox.eq(navNowIndex).find('li');
        var navLiLength = navLi.length;
        navNowIndex = $(this).index();
        // _nowNavListShow_TL = _navListShow_TL[navNowIndex];

        // if (nowNavListBoxHeight > navListBoxMaxHeight) {
        //   console.log('too height');
        // }
        // console.log('navNowIndex = ', navNowIndex);
        // console.log('navObj.dropdown = ', navObj.dropdown[navNowIndex]);

        if( navObj.dropdown[navObj.index].show === 1 ) {
          // $('.nav-list-box').eq(navNowIndex).css({
          //   'overflow-y': 'hidden'
          // });
          TweenMax.to(navListBox.eq(navNowIndex), .3, {
            top: -navListHeightArr[navNowIndex] + navHoverShowHeight
          });
          // TweenMax.staggerFrom(navLi, .3, {
          //   delay: .3,
          //   top: 30,
          //   opacity: 0
          // }, .05);
          navObj.dropdown[navNowIndex].show = 0;
          navObj.index = navNowIndex;
          // navObj.dropdown[navNowIndex].show = 0;
        } else {
          TweenMax.to(navListBox.eq(navNowIndex), .3, {
            top: 0,
            onComplete: function() {
              // $('.nav-list-box').eq(navNowIndex).css({
              //   'overflow-y': 'auto'
              // });
            }
          });
          // navLi.css({
          //   top: 0
          // });
          // TweenMax.staggerFrom(navLi, .3, {
          //   delay: .3,
          //   top: 30,
          //   opacity: 0
          // }, .05)
          // console.log('_navListShow_TL = ', _navListShow_TL);
          if (!_navListShow_TL[navNowIndex]) {
            _navListShow_TL[navNowIndex] = new TimelineLite();
            _navListShow_TL[navNowIndex].add(
                TweenMax.staggerFrom(navLi, .3, {
                delay: .3,
                top: 30,
                opacity: 0
              }, .05)
            )
          }
          _navListShow_TL[navNowIndex].restart();
          
          // if (navLiLength > 10) {
          //   TweenMax.staggerFrom(navLi, .3, {
          //     delay: .3,
          //     top: 30,
          //     opacity: 0
          //   }, .05);
          // } else {
          //   TweenMax.staggerFrom(navLi, .3, {
          //     delay: .3,
          //     top: 30,
          //     opacity: 0
          //   }, .1);
          // }
          navObj.dropdown[navObj.index].show = 0;
          navObj.dropdown[navNowIndex].show = 1;
          navObj.index = navNowIndex;
        };
      });
      navListBox.on('click', 'li', function() {
        $(this).addClass('active').siblings('li').removeClass('active');
      });


      /*data*/
      // for ( var i = 0; i < TaipeiAreaInfo['全部'].length; i++ ) {
      //     name = TaipeiAreaInfo[area][i].properties.Substitute;
      //     j_navVillageCont.append( "<li><a href=\"javascript:;\">" + name + "</a></li>" );
      // }
      $('.nav-title3-list li').click(function() {
        if ($(this).hasClass('active')) return;

        var area = $(this).text();
        var name = '';
        var j_navVillageCont =  $('.nav-title4-list');
        j_navVillageCont.find('li').remove();
        // console.log('area = ', area);
        // console.log('TaipeiAreaInfo = ', TaipeiAreaInfo);
        
        // console.log('TaipeiAreaInfo[area].length = ', TaipeiAreaInfo[area].length);
        for ( var i = 0; i < TaipeiAreaInfo[area].length; i++ ) {
            name = TaipeiAreaInfo[area][i].properties.Substitute;
            j_navVillageCont.append( "<li><a href=\"javascript:;\">" + name + "</a></li>" );
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

    function rankList(pTaipeiAreaInfo) {
      // console.log('pTaipeiAreaInfo = ', pTaipeiAreaInfo);
      var arr = [21,20,10,5,56,49,34,26,1,14];
      
      // TaipeiAreaArr
      var areaArr = [];
      // console.log('allArr = ', allArr);
      
      
      // allArr.reverse();
      // console.log('allArr_new = ', allArr);
      // for (var i = 0; i < allArr.length; i++) {
      //   // console.log(allArr[i]['各里總案件數']);
      // }
      
    }

    d3.csv("data/district_rank_area.csv", function(data) {
      var oldArr = [];
      var newArr = [];
      for (var i = 0; i < data.length; i++) {
        oldArr[i] = data[i]['avg_predict'];
      }
      // console.log('oldArr = ', oldArr);
      bubbleSort(data, 'avg_predict');
      for (var i = 0; i < data.length; i++) {
        newArr[i] = data[i]['avg_predict'];
      }
      // console.log('newArr = ', newArr);
      var html = '';
      for (var j = 0; j < 10; j++) {
        // console.log('allArr[i] = ', allArr[i]['各里總案件數']);
        html += "<li>" + data[j]['district'] + "</li>"
      }
      $('.area-top10 ul').append(html);
    });
    d3.csv("data/district_rank_village.csv", function(data) {
      var oldArr = [];
      var newArr = [];
      for (var i = 0; i < data.length; i++) {
        oldArr[i] = data[i]['avg_predict'];
      }
      console.log('oldArr = ', oldArr);
      bubbleSort(data, 'avg_predict');
      for (var i = 0; i < data.length; i++) {
        newArr[i] = data[i]['avg_predict'];
      }
      console.log('newArr = ', newArr);
      var html = '';
      for (var j = 0; j < 10; j++) {
        // console.log('allArr[i] = ', allArr[i]['各里總案件數']);
        html += "<li>" + data[j]['town'] + "</li>"
      }
      $('.village-top10 ul').append(html);
    });

    /*setCaseType*/
    // function setCaseType() {
    //   var param = location.href.split("?")[1];
    //   if (param) {
    //     var type = param.split("=")[1];
    //   }
    //   // console.log('param = ', param);
    //   // console.log('type = ', type);
    //   if (type == 'all') {
    //     $('.type-name').text('全部');
    //     $('.type-num').text(8928);
    //     features.thisValue = +features["各里總案件數"];
    //   } else if (type == 'old') {
    //     $('.type-name').text('老人保護');
    //     $('.type-num').text(541);
    //     features.thisValue = +features["老人保護"];
    //   } else if (type == 'children') {
    //     $('.type-name').text('兒少保護');
    //     $('.type-num').text(681);
    //     features.thisValue = +features["兒少保護"];
    //   } else if (type == 'intimate') {
    //     $('.type-name').text('親密關係');
    //     $('.type-num').text(4662);
    //     features.thisValue = +features["親密關係"];
    //   } else if (type == 'other') {
    //     $('.type-name').text('其他家虐');
    //     $('.type-num').text(2729);
    //     features.thisValue = +features["其他家虐"];
    //   }
    // }
  });
})(jQuery)