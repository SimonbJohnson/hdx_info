function createMap(){

	let windowHeight = $(window).height();
	$('#dash').height(windowHeight);

    map = L.map('dash', { fadeAnimation: false }).setView([0, 0], 2);


    L.tileLayer.grayscale('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 14, minZoom: 1
    }).addTo(map);

}

function processParams(){
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	bites = urlParams.values()
	let infos = []
	for (const bite of bites){
		let parts = bite.split('.');
		let package = parts[0];
		let resource = parts[1];
		let biteID = parts[2];
		let info = {'package':package,'resource':resource,'id':biteID}
		infos.push(info);
	} 
	createDash(infos);
}

function createDash(infos){
	infos.forEach(function(info,i){
		loadPackage(info,i);
	})
}

function loadPackage(info,i){
	filePath = 'data/packages/'+info.package+'_modified2.json'
	$.ajax({
		url: filePath,
		dataType: 'json',
		success: function(results){
			findBite(results,info,i);
		}
	});
}

function findBite(result,info,i){
	let firstPart = info.id.split('/')[0].substr(0,5);
	let biteType = 'maps'
	if(firstPart == 'chart'){
		biteType = 'charts'
	}
	let matchingBite;
	console.log(info.id);
	result.resources[info.resource].bites[biteType].bites.forEach(function(bite){

		if(bite.uniqueID == info.id){
			matchingBite = bite;
		}
	});
	addBite(matchingBite,i);
	
}

function addBite(bite,index){
	console.log(bite);
	mapOptions = {'scale':'linear','display':''};
	addMapLayer(map,bite,bite.bite,mapOptions,bite.title);
	//map,bite,data,mapOptions,title
}

var map;
createMap();
processParams();