function loadIndex(){
	$.ajax({
		url: "index.json",
		dataType: 'json',
		success: function(results){
			initSearch(results)
		}
	});			
}

function loadSubIndex(filePath){
	$.ajax({
		url: filePath,
		dataType: 'json',
		success: function(results){
			populateResults(results)
		}
	});			
}

function createResults(primary,secondary){
	let filePath = ''
	if(secondary==null){
		filePath = 'indexes/'+primary+'/index.json';
	} else {
		filePath = 'indexes/'+primary+'/'+secondary+'.json';
	}
	loadSubIndex(filePath);
}

function populateResults(results){
	let files = [];
	if('files' in results){
		files = results.files;
	} else {
		files = results;
	}
	files.sort(function(a,b){
		return (a.d < b.d) ? 1 : -1
	});
	let resultsCount = files.length;
	$('#resultsinfo').html(resultsCount + ' files found');
	$('#results').html('');
	loadPackages(files,0);
}

function loadPackage(file,i){
	filePath = 'data/packages/'+file.p+'_modified2.json'
	$.ajax({
		url: filePath,
		dataType: 'json',
		success: function(results){
			addBites(results,i)
		}
	});
}

function loadPackages(files,count){
	let currentSet = files.splice(0,10);
	currentSet.forEach(function(file,i){
		loadPackage(file,i);
	});
}

function addBites(package,i){
	let packageInfos = {'title':package.title,'org':package.org,'infos':[],'count':i,'id':package.id,'downloads':package.downloads};
	let dateFilter = false;
	package.resources.forEach(function(resource){
		if('text' in resource.bites){
			resource.bites.text.bites.forEach(function(bite){
				if(bite.subtype=='datefilter'){
					dateFilter=true;
				}
			});
		}
	});

	package.resources.forEach(function(resource,i){
		if('charts' in resource.bites){
			resource.bites.charts.bites.forEach(function(bite){
				packageInfos = processBite(bite,packageInfos,resource,dateFilter,i);
			});
		}
	});
	package.resources.forEach(function(resource,i){
		if('maps' in resource.bites){
			resource.bites.maps.bites.forEach(function(bite){
				let info = {'dateFilter':dateFilter,'bite':bite}
				packageInfos = processBite(bite,packageInfos,resource,dateFilter,i);
			});
		}
	});
	if(packageInfos.infos.length>0){
		drawInfo(packageInfos,true,0,3);	
	}	
}

function processBite(bite,packageInfos,resource,dateFilter,i){
	let linkParts = resource.link.split('/');
	let fileName = linkParts[linkParts.length-1].split('.')[0];
	let idParts = bite.uniqueID.split('/');
	if(idParts.length<5){
		bite.priority = bite.priority -1;
	}
	let idLastPart = idParts[idParts.length-1];
	if(idLastPart != 'timefilter' && dateFilter == true){
		bite.text = 'Warning: This bite could be wrong, please check against source data';
		bite.priority = bite.priority -2;
	} else {
		bite.text = '';
	}
	if(idParts[0]=='map0003'){
		bite.priority = bite.priority + 2;
	}
	let info = {'dateFilter':dateFilter,'bite':bite,'link':fileName,'resource':i}
	let sum = bite.bite.reduce(function(total,d){
		if(isNaN(d[1])){
			return total;
		} else {
			return total+d[1]*1
		}
	},0);
	if(sum>0){
		packageInfos.infos.push(info);
	}
	return packageInfos
}

function drawInfo(package,init=true,start=0,end=3){
	let bitesPerPackage = 0;
	package.infos.sort(function(a,b){
		return b.bite.priority - a.bite.priority;
	});
	let id = 'package'+package.id;
	if(init==true){

		$('#results').append('<div id="'+id+'" class="row package"><div class="col-md-12"><p class="packagetitle">'+package.title+ '</p><p>'+package.org+'</p></div></div>');
		$('#id').append();
	}
	package.infos.forEach(function(info,i){
		if(bitesPerPackage<end && bitesPerPackage>=start){
			console.log(info);
			if(info.bite.type=='map'){
				let mapID = 'map_'+packageCount+'_'+bitesPerPackage;
				console.log(mapID);
				biteCount++;
				$('#'+id).append('<div id="'+mapID+'" class="col-md-4"><p class="biteinfo">'+info.bite.uniqueID+'</p><p class="bitefile">'+info.link+'</p><p class="bitefile">'+info.bite.text+'</p></div>');
				
				mapOptions = {'scale':'linear','display':''};
				createMap('#'+mapID,info.bite,'',mapOptions,info.bite.title);
				addVote('#'+mapID,package.downloads,i);
				$('#'+mapID).append('<span id="adddash'+mapID+'"><button id="addbutton'+mapID+'" class="btn smallbtn">Add to dash</button></span> - <span id="addmapcontainer'+mapID+'"><button id="addmap'+mapID+'" class="btn smallbtn">Add to map</button></span>');
				$('#addbutton'+mapID).on('click',function(){
					addToDash({'package':package.id,'resource':info.resource,'bite':info.bite.uniqueID,'title':info.bite.title});
					$('#adddash'+mapID).html('Added!');
				});
				$('#addmap'+mapID).on('click',function(){
					addToMap({'package':package.id,'resource':info.resource,'bite':info.bite.uniqueID,'title':info.bite.title});
					$('#addmapcontainer'+mapID).html('Added!');
				});
			}
			if(info.bite.type=='chart'){
				let chartID = 'chart_'+packageCount+'_'+bitesPerPackage;
				biteCount++;
				$('#'+id).append('<div id="'+chartID+'" class="col-md-4"><p class="biteinfo">'+info.bite.uniqueID+'</p><p class="bitefile">'+info.link+'</p><p class="bitefile">'+info.bite.text+'</p></div>');
				
				createChart('#'+chartID,[info.bite],'',info.bite.title);
				addVote('#'+chartID,package.downloads,i);
				$('#'+chartID).append('<span id="adddash'+chartID+'"><button id="addbutton'+chartID+'" class="btn smallbtn">Add to dash</button></span>');
				$('#addbutton'+chartID).on('click',function(){
					addToDash({'package':package.id,'resource':info.resource,'bite':info.bite.uniqueID,'title':info.bite.title});
					$('#adddash'+chartID).html('Added!');
				});
			}
		}
		bitesPerPackage++;
		
	});
	$('#'+id).append('<div class="col-md-12"><button id="load'+id+'" class="btn">Load more insights from this data set</button></div>');
	
	$('#load'+id).on('click',function(){
		$('#load'+id).remove();
		drawInfo(package,false,end,end+6);
	});

	packageCount++;
}

function addVote(id,num,iteration){
	let votes = Math.round(num*Math.pow(0.9,iteration)/10);
	$(id).append('<div><p>Is this useful?<span class="vote"> &#8593 '+votes+' &#8595</span></div>');
}

function addToDash(biteDetails){
	dashview.push(biteDetails);
	
	$('#dashview').css('height','140px');
	$('#dashview').css('border-bottom','1px solid #000');
	$('#dashview1').html('Your Dash');
	$('#search').css('margin-top','140px');
	let titles = '';
	dashview.forEach(function(dash){
		titles += dash.title+', ';
	});
	$('#dashview1').append('<p>Charts and Maps: '+titles+'</p>');
	$('#dashview1').append('<p><button id="opendash1" class="btn smallbtn" href="">Open</button></p>');
	$('#opendash1').on('click',function(){
		opendash(dashview);
	})	
}

function addToMap(biteDetails){
	dashmap.push(biteDetails);
	
	$('#dashview').css('height','140px');
	$('#dashview').css('border-bottom','1px solid #000');
	$('#dashview2').html('Your Map');
	$('#search').css('margin-top','140px');
	let titles = '';
	dashmap.forEach(function(dash){
		titles += dash.title+', ';
	});
	$('#dashview2').append('<p>Layers: '+titles+'</p>');
	$('#dashview2').append('<p><button id="openmap" class="btn smallbtn" href="">Open</button></p>');
	$('#openmap').on('click',function(){
		openmap(dashmap);
	})	
}

function opendash(dashview){
	let url = 'dash.html?';
	dashview.forEach(function(dash,i){
		let component = dash.package+'.'+dash.resource+'.'+dash.bite;
		let urlpart = 'dash'+i+'='+encodeURIComponent(component)+'&';
		url +=urlpart;
	});
	window.open(url, '_blank').focus();
}

function openmap(dashview){
	let url = 'map.html?';
	dashview.forEach(function(dash,i){
		let component = dash.package+'.'+dash.resource+'.'+dash.bite;
		let urlpart = 'map'+i+'='+encodeURIComponent(component)+'&';
		url +=urlpart;
	});
	window.open(url, '_blank').focus();
}

var biteCount = 0;
var packageCount = 0;
var index = {};
var dashview = [];
var dashmap = [];
loadIndex();