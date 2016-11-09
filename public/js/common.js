// (function($) {
  var TaipeiAreaNameArr = ["士林區", "文山區", "內湖區", "北投區", "中山區", "大安區", "信義區", "萬華區", "松山區", "大同區", "南港區", "中正區"];
  var TaipeiAreaObj = {};
  TaipeiAreaObj['全部'] = [];
  var TaipeiVillageArr = [];
  var villageTopojson, features;
  var caseType = "各里總案件數";  // 要在地圖上顯示的案件類型
  /*取得網址上的參數*/
  var locationParam = location.href.split("?")[1];
  if (locationParam) {
    var locationType = locationParam.split("=")[1];
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
  $(function() {
    /*啟動loading效果*/
    $(".fakeloader").fakeLoader({
        bgColor:"#0296a9",
        zIndex: '1001',
        spinner:"spinner3"
    });
  });
    function getData(pCallBack) {
      if (location.pathname == "/type.html") {
        if (locationType == 'all' || locationType == undefined) {
          caseType = "各里總案件數";
          $('.type-name').text('全部');
          $('.type-num').text(8928);
          $('.nav-title2-list-box li').eq(0).addClass('active');
        } else if (locationType == 'old') {
          caseType = "老人保護";
          $('.type-name').text(caseType);
          $('.type-num').text(541);
          $('.nav-title2-list-box li').eq(1).addClass('active');
        } else if (locationType == 'children') {
          caseType = "兒少保護";
          $('.type-name').text(caseType);
          $('.type-num').text(681);
          $('.nav-title2-list-box li').eq(2).addClass('active');
        } else if (locationType == 'intimate') {
          caseType = "親密關係";
          $('.type-name').text(caseType);
          $('.type-num').text(4662);
          $('.nav-title2-list-box li').eq(3).addClass('active');
        } else if (locationType == 'other') {
          caseType = "其他家虐";
          $('.type-name').text(caseType);
          $('.type-num').text(2729);
          $('.nav-title2-list-box li').eq(4).addClass('active');
        }
      }

      /*取得台灣地圖資訊及風險指標*/
      d3.json("data/county.json", function(topodata) {
        d3.csv("data/case_village.csv", function(caseVillage) {
          var result = {};
          var village;
          var temp = [];
          for (var i = 0 ; i < caseVillage.length; i++) {
            village = caseVillage[i]["里"];
            if (village) {
              village = village.replace("台","臺");
              result[village] = result[village] || {};
              result[village]["兄弟姊妹間暴力"] = +caseVillage[i]["兄弟姊妹間暴力"].replace("%", "") || 0;
              result[village]["老人保護"] = +caseVillage[i]["老人保護"].replace("%", "") || 0;
              result[village]["兒少保護"] = +caseVillage[i]["兒少保護"].replace("%", "") || 0;
              result[village]["親密關係"] = +caseVillage[i]["親密關係"].replace("%", "") || 0;
              result[village]["女"] = +caseVillage[i]["女"].replace("%", "") || 0;
              result[village]["男"] = +caseVillage[i]["男"].replace("%", "") || 0;
              result[village]["小於18歲"] = +caseVillage[i]["小於18歲"].replace("%", "") || 0;
              result[village]["18到65歲"] = +caseVillage[i]["18到65歲"].replace("%", "") || 0;
              result[village]["大於65歲"] = +caseVillage[i]["大於65歲"].replace("%", "") || 0;
              result[village]["各里總案件數"] = +caseVillage[i]["各里總案件數"].replace("%", "") || 0;
              result[village]["兄弟姊妹間暴力Rank"] = +caseVillage[i]["兄弟姊妹間暴力Rank"].replace("%", "") || 0;
              result[village]["老人保護Rank"] = +caseVillage[i]["老人保護Rank"].replace("%", "") || 0;
              result[village]["兒少保護Rank"] = +caseVillage[i]["兒少保護Rank"].replace("%", "") || 0;
              result[village]["親密關係Rank"] = +caseVillage[i]["親密關係Rank"].replace("%", "") || 0;
              result[village]["低收Rank"] = +caseVillage[i]["低收Rank"].replace("%", "") || 0;
              result[village]["障礙Rank"] = +caseVillage[i]["障礙Rank"].replace("%", "") || 0;
            }
          }

          villageTopojson = topojson.feature(topodata, topodata.objects["Village_NLSC_121_1050715"]);
          features = villageTopojson.features;

          /*將風險指標加到地圖資訊上*/
          features = features.map(function(f) {
            if ( f.properties.C_Name === "臺北市" && checkAvailability(TaipeiAreaNameArr, f.properties.T_Name) ) {
              if(result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]) {
                f["兄弟姊妹間暴力"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["兄弟姊妹間暴力"] || 0;
                f["老人保護"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["老人保護"] || 0;
                f["兒少保護"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["兒少保護"] || 0;
                f["親密關係"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["親密關係"] || 0;
                f["女"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["女"] || 0;
                f["男"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["男"] || 0;
                f["小於18歲"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["小於18歲"] || 0;
                f["18到65歲"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["18到65歲"] || 0;
                f["大於65歲"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["大於65歲"] || 0;
                f["各里總案件數"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["各里總案件數"] || 0;
                f["兄弟姊妹間暴力Rank"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["兄弟姊妹間暴力Rank"] || 0;
                f["老人保護Rank"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["老人保護Rank"] || 0;
                f["兒少保護Rank"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["兒少保護Rank"] || 0;
                f["親密關係Rank"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["親密關係Rank"] || 0;
                f["低收Rank"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["低收Rank"] || 0;
                f["障礙Rank"] = +result[f.properties.C_Name + f.properties.T_Name + f.properties.V_Name]["障礙Rank"] || 0;
              } else {
                f["兄弟姊妹間暴力"] = 0;
                f["老人保護"] = 0;
                f["兒少保護"] = 0;
                f["親密關係"] = 0;
                f["女"] = 0;
                f["男"] = 0;
                f["小於18歲"] = 0;
                f["18到65歲"] = 0;
                f["大於65歲"] = 0;
                f["各里總案件數"] = 0;
                f["兄弟姊妹間暴力Rank"] = 0;
                f["老人保護Rank"] = 0;
                f["兒少保護Rank"] = 0;
                f["親密關係Rank"] = 0;
                f["低收Rank"] = 0;
                f["障礙Rank"] = 0;
              }

              /*所有里的陣列*/
              TaipeiVillageArr.push(f);

              /*將里的陣列用區做分類*/
              if (!TaipeiAreaObj[f.properties.T_Name]){
                TaipeiAreaObj[f.properties.T_Name]=[];
              }
              TaipeiAreaObj[f.properties.T_Name].push(f);

              TaipeiAreaObj['全部'].push(f);
            }
          });

          villageTopojson.features = TaipeiVillageArr;

  				setMap();
          setNav();



          /*關閉loading效果*/
          $(".fakeloader").fadeOut(500, function() {

          });

          d3.csv("data/case_type.csv", stringToNum, function(data) {
            if (typeof pCallBack === 'function') {
              pCallBack(data, TaipeiAreaObj);
            }
          });
        });
      });

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

        // 點擊選單
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

        $('.nav-title4-list li').click(function(e) {
          var villageName;
          villageName = $(this).text();
          store.set('villageName', villageName);
        });
      }

      /*heat-map*/
      function setMap() {
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

  			function style(features) {
  				return {
  					weight: 2,
  					opacity: 1,
  					color: 'white',
  					dashArray: '3',
  					fillOpacity: 0.7,
  					fillColor: getColor(features[caseType])
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
  		}

      function checkAvailability(arr, val) {
        return arr.some(function(arrVal) {
          return val === arrVal;
        });
      }
    }

  // });
// })(jQuery)
