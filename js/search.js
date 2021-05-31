///////////////////
// Search functions
//////////////////

function initSearch(results){
	sortPrimaryTags(results)
}

function sortPrimaryTags(results){
	index = results
	tagList = []
	for(var tag in results){
		tagList.push({'tag':tag,'count':results[tag].count})
	}
	tagList = tagList.sort(function(a,b){
		return (a.count < b.count) ? 1 : -1
	});
	let topTags = tagList.slice(0, 20).map(function(d){
		return d.tag;
	});
	primarySuggestedTerms(topTags);
	allTags = tagList.map(function(d){
		return d.tag;
	});	
	populateAutoComplete(allTags);
}

function primarySuggestedTerms(terms){
	terms.forEach(function(term){
		$('#primarysuggestedterms').append('<div class="tag primary">'+term+'</div>');
	});
	$('.primary').on('click',function(e){
		let primaryTerm = $(this).html();
		updatePrimarySearch(primaryTerm);
	});
}

function secondarySuggestedTerms(terms,primary){
	terms.forEach(function(term){
		$('#secondarysuggestedterms').append('<div class="tag secondary">'+term+'</div>');
	});
	$('.secondary').on('click',function(e){
		let secondaryTerm = $(this).html();
		updateSecondarySearch(secondaryTerm,primary);
	});

    $('#search2').on('keyup',function(e){
	    if (e.key === 'Enter' || e.keyCode === 13 || e.keyCode === 32) {
	        let search = $('#search2').val();
	        searchList = search.trim();
	        secondaryTerm = searchList;
	        if(secondaryTerm in index){
	        	updateSecondarySearch(secondaryTerm,primary);
	        }
	    }
    });
}

function populateAutoComplete(list){
	$('#search1').autocomplete({
  		source: list
    });

    $('#search1').on('keyup',function(e){
	    if (e.key === 'Enter' || e.keyCode === 13 || e.keyCode === 32) {
	        let search = $('#search1').val();
	        searchList = search.trim();
	        primaryTerm = searchList;
	        if(primaryTerm in index){
	        	updatePrimarySearch(primaryTerm);
	        }
	    }
    });
}

function updatePrimarySearch(primaryTerm){
	$('#primaryterm').html('<div class="tag primary">'+primaryTerm+'</div>');
	$('#search1').hide();
	$('#primarysuggestedterms').hide();
	$('#search2').show();
	createResults(primaryTerm,null);
	updateSecondaryTerms(primaryTerm);
}

function updateSecondaryTerms(primaryTerm){
	tagList = index[primaryTerm].tags.sort(function(a,b){
		return (a.count < b.count) ? 1 : -1
	});
	let topTags = tagList.slice(0, 20).map(function(d){
		return d.tag;
	});
	let allTags = tagList.map(function(d){
		return d.tag;
	});

	console.log(allTags);
	secondarySuggestedTerms(topTags,primaryTerm);
	//$('#search1').autocomplete( "destroy" );
	$('#search2').autocomplete({
  		source: allTags
    });
}

function updateSecondarySearch(secondaryTerm,primary){
	$('#secondaryterm').html('<div class="tag secondary">'+secondaryTerm+'</div>');
	$('#search2').hide();
	$('#secondarysuggestedterms').hide();
	createResults(primary,secondaryTerm);
}