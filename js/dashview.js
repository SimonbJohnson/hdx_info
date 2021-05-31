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
	if(bite.type=='map'){
		let mapID = 'map_'+index;
		$('#dash').append('<div id="'+mapID+'" class="col-md-6"><p class="biteinfo">'+bite.uniqueID+'</p></div>');
		
		mapOptions = {'scale':'linear','display':''};
		createMap('#'+mapID,bite,'',mapOptions,bite.title);
	}
	if(bite.type=='chart'){
		let chartID = 'chart_'+index;
		$('#dash').append('<div id="'+chartID+'" class="col-md-6"><p class="biteinfo">'+bite.uniqueID+'</p></div>');		
		createChart('#'+chartID,[bite],'',bite.title);
	}
}

processParams();