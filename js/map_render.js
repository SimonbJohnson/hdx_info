function addMapLayer(map,bite,data,mapOptions,title){
    var bounds = [];
    var clickOn = null;
    let display = mapOptions.display;
    let scale = mapOptions.scale;
    let displayColumn = 0;
    let idTag = bite.uniqueID.split('/')[1];
    let idColumn = '';
    if(display!=''){
        data[1].forEach(function(d,i){
            if(d == display){
                displayColumn = i;
            }
        });
    }
    /* removing for the purpose of this app 
    data[1].forEach(function(d,i){
        if(d == idTag){
            idColumn = i;
        }
    });*/
    if(title==null){
        title = bite.title;
    }

    if(bite.subtype=='choropleth'){
        createChoroplethMap();
    }

    if(bite.subtype == 'point'){
        createPointMap();
    }

    function createPointMap(){
        console.log('add pont layer');
        let sizeColumn = null;
        let colourColumn = null;
        let maxValue;
        let minValue;
        let range;

        let discreteColors = ['#F44336','#2196F3','#4CAF50','#FFEB3B','#795548','#9E9E9E','#9C27B0','#FFA726'];
        let categories = [];
        let addOther = false;

        let infoBox = false;
        let circleOver = false;
        console.log(bite);
        if(mapOptions.size!='' && mapOptions.size!=null){
            sizeColumn = getColumn(bite.bite,mapOptions.size);
            if (sizeColumn != null) {
                maxValue = bite.bite[2][1][sizeColumn];
                minValue = bite.bite[2][1][sizeColumn];
                if(scale=='log'){
                    if(isNaN(Math.log(bite.bite[2][1][sizeColumn]))|| Math.log(bite.bite[2][1][sizeColumn])<0){
                        maxValue = 0;
                        minValue = 0;
                    } else {
                        maxValue = Math.log(bite.bite[2][1][sizeColumn]);
                        minValue = Math.log(bite.bite[2][1][sizeColumn]);
                    }
                }

                bite.bite[2].forEach(function(d,i){
                    if(i>1){
                        if(scale == 'log'){
                            let logValue = Math.log(d[sizeColumn]);
                            if(isNaN(logValue) || logValue<0){
                                logValue=0;
                            }   
                            if(logValue>maxValue){
                                maxValue = logValue;
                            }
                            if(logValue<minValue){
                                minValue = logValue;
                            }                    
                        } else {
                            let value = parseFloat(d[sizeColumn]);
                            if(isNaN(value)){
                                value = 0;
                            }
                            if(value>maxValue){
                                maxValue = value;
                            }
                            if(value<minValue){
                                minValue = value;
                            }                         
                        }
                  
                    }

                });

                range = maxValue-minValue
            }// else {
            //    mapOptions.size = null;
            //}
        }
        if(mapOptions.colour!='' && mapOptions.colour!=null){
            colourColumn = getColumn(bite.bite,mapOptions.colour);
            if(colourColumn!=null){
                bite.bite[2].forEach(function(d,i){
                    if(i>1){
                        if(categories.length<discreteColors.length-1){
                            let value = d[colourColumn];
                            if(categories.indexOf(value)==-1){
                                categories.push(value);
                            }
                        } else {
                            addOther = true;
                        }
                    }                    
                });
            }
        }

        if(addOther){
            categories.push('Other');
        }

        var circles = [];

        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info infohover');
            L.DomEvent.disableClickPropagation(this._div);
            return this._div;
        };

        info.update = function (info) { 
            this._div.innerHTML = (info ?
                info
                : 'Hover for value');
        };
        console.log(map);
        info.addTo(map);

        $('.info').on('mouseover',function(){infoBox = true;});
        $('.info').on('mouseout',function(){infoBox = false;info.update();});

        bite.bite[0].forEach(function(d,i){
            if(i>0){
                if(!isNaN(d) && !isNaN(bite.bite[1][i])){

                    let radius = 5;
                    if(mapOptions.size!='' && mapOptions.size!=null){
                        if(scale == 'log'){
                            let logValue = Math.log(bite.bite[2][i][sizeColumn]);
                            if(isNaN(logValue) || logValue<0){
                                logValue=0;
                            }
                            radius = (logValue-minValue)/range*10+2;
                        } else {
                            radius = (bite.bite[2][i][sizeColumn]-minValue)/range*10+2;
                        }
                        if(isNaN(radius)){
                            radius = 5;
                        };                       
                    }

                    let style = {
                            className: 'circlepoint',
                            fillOpacity: 0.75,
                            radius: radius,
                            weight:1
                        }

                    if(mapOptions.colour!='' && mapOptions.colour!=null){
                        let value = bite.bite[2][i][colourColumn];
                        let cat = categories.indexOf(value);
                        let colour;
                        if(cat>-1){
                            colour = discreteColors[cat];
                        } else {
                            colour = discreteColors[discreteColors.length-1];
                        }
                        style['fillColor'] = colour;
                        style['color'] = colour;
                        style['className']  = '';

                    }

                    var circle = L.circleMarker([d, bite.bite[1][i]], style).addTo(map);

                    circle.on('mouseover',function(){
                        circleOver = true;
                        var text = '';
                        bite.bite[3][0].forEach(function(d,j){
                            if(j<8){
                                text += '<p>'+d+': '+bite.bite[2][i][j]+'</p>';
                            }
                        });
                        info.update(text);
                    });
                    circle.on('mouseout',function(){
                        circleOver = false;
                        setTimeout(function(){
                            if(infoBox==false && circleOver==false){
                            info.update();
                             }
                        },100);
                    });
                    circles.push(circle);
                } else {
                    console.log('Skipping badly formed lat/lon: ' +d+','+bite.bite[1][i])
                }
            }
        });
        if(mapOptions.colour!='' && mapOptions.colour!=null){
            var legend = L.control({position: 'bottomright'});
            legend.onAdd = function (map) {

                var div = L.DomUtil.create('div', 'info legend')

                categories.forEach(function(c,i){
                    div.innerHTML += '<i style="background-color:'+discreteColors[i]+';"></i> ';
                    div.innerHTML += categories[i]+'<br />';
                })
                return div;
            };

            legend.addTo(map);
        }
        var group = new L.featureGroup(circles).setZIndex(500);
        map.fitBounds(group.getBounds().pad(0.1));        
    }

    function createChoroplethMap(){

        var maxValue = bite.bite[1][1];
        var minValue = bite.bite[1][1];

        bite['lookup'] = {}

        bite.bite.forEach(function(d){
            if(d[1]>maxValue){
                maxValue = d[1];
            }
            if(d[1]<minValue){
                minValue = d[1];
            }
            bite.lookup[d[0]] = d[1];
        });

        if(maxValue-5<minValue){
            minValue = maxValue-6;
        }

        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info infohover');
            L.DomEvent.disableClickPropagation(this._div);
            this.update();
            return this._div;
        };

        info.update = function (name,id) {
            value = 'No Data';
            let displayValue = [];
            bite.bite.forEach(function(d){
                        if(d[0]==id){
                            value=d[1];
                        }
                    });
            if(display != null && display.length>0){
                data.forEach(function(d,i){
                    if(d[idColumn]==id){
                        if(displayValue.indexOf(d[displayColumn])==-1){
                            displayValue.push(d[displayColumn]);
                        }
                        
                    }
                });
            }
            displayValue = displayValue.join('</p><p>')
            if(value==0){
                displayValue='';
            }      
            if(scale=='binary'){
                if(value==0){
                    value = 'No';
                }
                if(value>0) {
                    value= 'Yes';
                }
            }

            this._div.innerHTML = (id ?
                '<p><b>'+name+':</b> ' + value + '</p><p>'+displayValue+'</p>'
                : 'Hover for value');
        };

        info.addTo(map);

        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend')
            var grades = getScale(scale,minValue,maxValue);
            var classes = ['mapcolornone','mapcolor0','mapcolor1','mapcolor2','mapcolor3','mapcolor4'];

            div = createLegend(div,scale,grades,classes);

            return div;
        };

        legend.addTo(map);

        loadGeoms(bite.geom_url,bite.geom_attribute,bite.name_attribute,display);

        function getScale(scale){
            var grades = ['No Data', Number(minValue.toPrecision(3)), Number(((maxValue-minValue)/4+minValue).toPrecision(3)), Number(((maxValue-minValue)/4*2+minValue).toPrecision(3)), Number(((maxValue-minValue)/4*3+minValue).toPrecision(3)), Number(((maxValue-minValue)/4*4+minValue).toPrecision(3))]
            if(scale=='log'){
                grades.forEach(function(g,i){
                    if(i>0){
                        grades[i] = Number((Math.exp(((i-1)/4)*Math.log(maxValue - minValue))+minValue).toPrecision(3));
                    }
                });
            }
            if(scale=='binary'){
                grades = ['No Data',0,1];
            }
            return grades;
        }

        function createLegend(div,scale,grades,classes){
            if(scale=='binary'){
                div.innerHTML += '<i class="'+classes[0]+'"></i> No<br />';
                div.innerHTML += '<i class="'+classes[5]+'"></i> Yes<br />';
            } else {
                let html = '';
                for (var i = 0; i < grades.length; i++) {
                    html += '<p class="legendelement"><i class="'+classes[i]+'"></i> ';
                    html += isNaN(Number(grades[i])) ? grades[i] : Math.ceil(grades[i]);
                    html += ((i + 1)<grades.length ? i==0 ? '' : ' &ndash; ' + Math.floor(grades[i + 1]) + '' : '+');
                    html += '</p>';
                }
                div.innerHTML = html    
            }
            return div;
        }

        function loadGeoms(urls,geom_attributes,name_attributes){
            var total = urls.length;
            $('.infohover').html('Loading Geoms: '+total + ' to go');
            $.ajax({
                url: urls[0],
                dataType: 'json',
                success: function(result){
                    var geom = {};
                    if(result.type=='Topology'){
                      geom = topojson.feature(result,result.objects.geom);
                    } else {
                      geom = result;
                    }              
                    var layer = L.geoJson(geom,
                        {
                            style: styleClosure(geom_attributes[0]),
                            onEachFeature: onEachFeatureClosure(geom_attributes[0],name_attributes[0])
                        }
                    ).addTo(map).bringToBack();
                    if(urls.length>1){
                        loadGeoms(urls.slice(1),geom_attributes.slice(1),name_attributes.slice(1));
                    } else {
                        $('.infohover').html('Hover for value');
                        fitBounds();
                    }

                },
                error: function(err){
                    console.log(err);
                }
            });          
        }

        function onEachFeatureClosure(geom_attribute,name_attribute){
            return function onEachFeature(feature, layer) {
                var featureCode = feature.properties[geom_attribute];
                if(!isNaN(bite.lookup[featureCode])){
                  bounds.push(layer.getBounds());
                }
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: clickFeature,
                });
            }

            function highlightFeature(e) {
                if(clickOn===null){
                    info.update(e.target.feature.properties[name_attribute],e.target.feature.properties[geom_attribute]);
                }
            }

            function clickFeature(e) {
                info.update(e.target.feature.properties[name_attribute],e.target.feature.properties[geom_attribute]);
                if(clickOn == e.target.feature.properties[geom_attribute]){
                    clickOn=null;
                } else {
                    clickOn = e.target.feature.properties[geom_attribute];
                }
            }

            function resetHighlight(e) {
                if(clickOn===null){
                    info.update();
                }
            }   

        }

        function styleClosure(geom_attribute){
            return function style(feature) {
                return {
                    className: getClass(feature.properties[geom_attribute]),
                    weight: 1,
                    opacity: 1,
                    color: '#999999',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }
        } 

        function getClass(id){
            var value = 0;
            var found = false;
            bite.bite.forEach(function(d){
                if(d[0]==id){
                    value=d[1];
                    found = true;
                }
            });
            if(found){
                //in future this should take the values calculated in grades/legend
                if(scale=='log'){
                    var maxDivide = Math.log(maxValue-minValue)
                    if(maxDivide ==0){return 'mapcolor'+4}
                    return 'mapcolor'+Math.floor(Math.log(value-minValue)/Math.log(maxValue-minValue)*4);
                } else if(scale=='binary'){
                    if(value>0){
                        return 'mapcolor4';
                    } else {
                        return 'mapcolor0';
                    }
                }
                else {
                    return 'mapcolor'+Math.floor((value-minValue)/(maxValue-minValue)*4);
                }
            } else {
                return 'mapcolornone';
            }
        }        
    }

    function fitBounds(){
        if(bounds.length>0){
            var fitBound = bounds[0];
            bounds.forEach(function(bound){
              if(fitBound._northEast.lat<bound._northEast.lat){
                fitBound._northEast.lat=bound._northEast.lat;
              }
              if(fitBound._northEast.lng<bound._northEast.lng){
                fitBound._northEast.lng=bound._northEast.lng;
              }
              if(fitBound._southWest.lng>bound._southWest.lng){
                fitBound._southWest.lng=bound._southWest.lng;
              }
              if(fitBound._southWest.lat>bound._southWest.lat){
                fitBound._southWest.lat=bound._southWest.lat;
              }                           
            });
            fitBound._northEast.lng=fitBound._northEast.lng+(fitBound._northEast.lng-fitBound._southWest.lng)*0.2;
            map.fitBounds(fitBound);
        }
    }        

}

function getColumn(bite,tag){
    let column = null;
    let justTag = tag.split('+')[0];
    let tagAttributes = tag.split('+');
    tagAttributes.shift();
    console.log(bite);
    bite[2][0].forEach(function(d,i){
        let matchTag = d.split('+')[0];
        if(matchTag == justTag){

            let matchAtts = d.split('+');
            matchAtts.shift();

            let noMatch = false;

            tagAttributes.forEach(function(att){
                if(matchAtts.indexOf(att)==-1){
                    noMatch = true;
                }
            });

            if(!noMatch){
                column = i;
            }
        }
    });
    return column;
}