$(document).ready(function() {
	$('#hp1').change(function() {
		if($(this).is(':checked'))
			$('#hpromo1').prop('disabled', true).val($(this).val());
		else
			$('#hpromo1').prop('disabled', false).val('');
	});
	
	$('#hp2').change(function() {
		if($(this).is(':checked'))
			$('#hpromo2').prop('disabled', true).val($(this).val());
		else
			$('#hpromo2').prop('disabled', false).val('');
	});
	
	$('#dash1').change(function() {
		if($(this).is(':checked'))
			$('#afterdash1').prop('disabled', true).val($(this).val());
		else
			$('#afterdash1').prop('disabled', false).val('');
	});
	
	$('#dash2').change(function() {
		if($(this).is(':checked'))
			$('#afterdash2').prop('disabled', true).val($(this).val());
		else
			$('#afterdash2').prop('disabled', false).val('');
	});
	
	$('#patchdate, #dashdate, #editdate').datepicker({
		dateFormat: 'm/d'
	}).datepicker('setDate', today);
	
	$('input[type=text]').blur(function() {
		$(this).val($.trim($(this).val()));
	});
	
	$('#accordion').accordion({
		heightStyle: 'content'
	});
	
	$('input[title]').tooltip({
		position: { my: 'left+5', at: 'right' },
		disabled: true,
		open: function() {
			var that = this;
			setTimeout(function() {
				$(that).tooltip('disable');
			}, 2000)}
	});
	
	$('#combinepop').dialog({
		autoOpen: false,
		resizable: false,
		draggable: false,
		modal: true,
		minWidth: 300,
		buttons: {
			Combine: function() {
				$(this).dialog('close');
		
				var patch1 = parseInt(patchnames.getAttribute('patch1'));
				var patch2 = parseInt(patchnames.getAttribute('patch2'));
				
				patches[patch1].name = combinedname.value;
				patches[patch1].folder = combinedfolder.value;
				patches[patch1].merchant = combinedmerchants.value;
				
				currentPatch = patch1;
				currentAsset = -1;
				addAssets(patches[patch2].assets);
				patches.splice(patch2, 1);
				
				buildOutput(0);
				checkPatches();
			},
			Cancel: function() {
				$(this).dialog('close');
			}
		}
	});
	
	$('#editpop').dialog({
		autoOpen: false,
		resizable: false,
		draggable: false,
		modal: true,
		minWidth: 300,
		buttons: {
			Save: function() {
				$(this).dialog('close');
				
				patches[currentPatch].name = editname.value;
				patches[currentPatch].date = editdate.value;
				patches[currentPatch].time = edittime.value;
				patches[currentPatch].folder = editfolder.value;
				patches[currentPatch].merchant = editmerchant.value;
				
				buildOutput(0);
			},
			Cancel: function() {
				$(this).dialog('close');
			}
		}
	});
	
	//Bubble down from parent element since assets aren't available on document ready
	
	$('#emailbod').on('mousedown', '#patchlist div[patch]', function() {
		$('.selected').removeClass('selected');
		$(this).addClass('selected');
		currentPatch = parseInt($(this).attr('patch'));
		currentAsset = -1;
		console.log('Patch: ' + currentPatch + ' Asset: ' + currentAsset);
	});
	
	$('#emailbod').on('mousedown', '#patchlist span[asset]', function(e) {
		e.stopPropagation();
		$('.selected').removeClass('selected');
		$(this).addClass('selected').parents('div').addClass('selected');
		currentPatch = parseInt($(this).parents('div').attr('patch'));
		currentAsset = parseInt($(this).attr('asset'));
		console.log('Patch: ' + currentPatch + ' Asset: ' + currentAsset);
	});
	
	$('#emailbod').on('dblclick', '#patchlist div[patch]', function() {
		editname.value = patches[currentPatch].name;
		editdate.value = patches[currentPatch].date;
		edittime.value = patches[currentPatch].time;
		editfolder.value = patches[currentPatch].folder;
		editmerchant.value = patches[currentPatch].merchant;
		$('#editpop').dialog('open');
	});
});

// Globals
var patches = [];
var preDel = 0;
var currentPatch = -1, currentAsset = -1;
var today = new Date();
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/*
Asset Types:
1 = Header Promo
2 = Ticker
3 = Main
4 = Promo
5 = Designer Index
6 = Silo Main
7 = Silo Promo
8 = Drawer Ticker
9 = Popup
10 = Promo Tile
11 = F0
12 = Graphic Header
13 = Silo Banner
14 = Nav Aux
15 = Video
16 = InSite

States:
1 = Turn On
2 = Turn Off
3 = Removed
4 = Dash (Temporary)
5 = Dash (Temporary)
*/

function Patch(name, date, time, folder, merchant) {
	this.name = name;
	this.date = date;
	this.time = time;
	this.folder = folder || '';
	this.merchant = merchant;
	this.assets = [];
}

function Asset(name, type, path, icid, state) {
	this.name = name;
	this.type = type;
	this.path = path;
	this.icid = icid || '';
	this.state = state || '';
}

function addPatch() {
	
	var name = patchname.value;
	var date = patchdate.value;
	var time = patchtime.value;
	var folder = patchfolder.value;
	var merchant = patchmerchant.value;
	
	if (name == '') {
		$('#patchname').tooltip('enable').focus();
		return;
	}
	if (date == '') {
		$('#patchdate').tooltip('enable').focus();
		return;
	}
	if (time == '') {
		$('#patchtime').tooltip('enable').focus();
		return;
	}
	if (folder == '' || /\W/.test(folder)) {
		$('#patchfolder').tooltip('enable').focus();
		return;
	}
	if (merchant == '') {
		$('#patchmerchant').tooltip('enable').focus();
		return;
	}
	
	var patch = new Patch(name, date, time, folder, merchant);
	patches.push(patch);
	currentPatch = patches.length - 1;
	
	buildOutput(0);
}

function removePatch() {
	if (currentPatch < 0) {
		$('#removepatch').tooltip('enable').focus();
		return;
	}
	
	patches.splice(currentPatch, 1);
	
	if (patches.length == 0 || currentPatch == patches.length)
		currentPatch--;
	
	buildOutput(0);
}

function patchMove() {
	var order = $('#patchlist').sortable('toArray', {attribute: 'patch'});
	order = order.map(Number);
	var temp = [];
	currentPatch = order.indexOf(currentPatch);
	
	for (var i = 0; i < patches.length; i++) {
		temp[i] = patches[order[i]];
	}
	
	patches = temp;
	buildOutput(0);
}

function noPatch() {
	$('#accordion').accordion({ active: 0 });
	$('#addpatch').tooltip('enable').tooltip('open');
	patchname.focus();
}

function addAssets(assets) {
	patches[currentPatch].assets = patches[currentPatch].assets.concat(assets);
	patches[currentPatch].assets = patches[currentPatch].assets.sort(sortAssets);
}

function removeAsset() {
	if (currentAsset < 0) {
		$('#removeasset').tooltip('enable').focus();
		return;
	}
	
	patches[currentPatch].assets.splice(currentAsset, 1);
	
	if (patches[currentPatch].assets.length == 0 || currentAsset == patches[currentPatch].assets.length)
		currentAsset--;
	
	buildOutput(0);
}

function sortAssets(a,b) {
	if (a.type < b.type)
		return -1;
	else if (a.type > b.type)
		return 1;
	else {
		if (a.state < b.state)
			return -1;
		else if (a.state > b.state)
			return 1;
		else
			return (a.name).localeCompare(b.name);
	}
}

function checkPatches() {
	
	if (patches.length < 2) {
		$('#checkpatches').tooltip('enable').focus();
		return;
	}
	
	var datesplit;
	
	for (var i = 0; i < patches.length; i++) {
		for (var j = i + 1; j < patches.length; j++) {
			if (patches[i].date == patches[j].date && patches[i].time == patches[j].time) {
				patchnames.innerHTML = patches[i].name + '<br />' + patches[j].name;
				patchnames.setAttribute('patch1', i);
				patchnames.setAttribute('patch2', j);
				combinedname.value = patches[i].name + ', ' + patches[j].name;
				combinedmerchants.value = patches[i].merchant + ', ' + patches[j].merchant;
				
				datesplit = patches[i].date.split('/');
				if (datesplit[0].length < 2)
					datesplit[0] = '0' + datesplit[0];
				if (datesplit[1].length < 2)
					datesplit[1] = '0' + datesplit[1];
				combinedfolder.value = (datesplit[0] + '_' + datesplit[1] + '_' + (today.getYear() % 100) + '_' + patches[i].time + '_' + patches[i].name + '_' + patches[j].name).replace(/\W/g, '');
				
				$('#combinepop').dialog('open');
				return;
			}
		}
	}
	
	$('#checkpatches').tooltip('enable').focus();
}

function loadPrev() {
	var json = localStorage.getItem('previous-json');
	importJSON(json);
}

function loadFile() {
	var file = form1.file.files[0];
	if (file) {
		var reader = new FileReader();
		reader.onload = function() {
			importJSON(reader.result);
		}
		reader.readAsText(file);
	}
	else {
		$('#file').tooltip('enable').focus();
	}
}

function importJSON(data) {
	try {
		var json = JSON.parse(data);
	}
	catch(e) {
		$('#loadfile').tooltip('enable').focus();
		console.log(e);
		return;
	}
	
	currentPatch = patches.length;
	patches = patches.concat(json);
	buildOutput(0);
}

function exportJSON() {
	var json = JSON.stringify(patches, null, '\t');
	var blob = new Blob([json], {type: 'text/plain;charset=utf-8'});
	today = new Date();
	var name = (today.getMonth() + 1) + '_' + today.getDate() + '_' + (today.getYear() % 100) + '_';
	var hours = today.getHours();
	var period = 'am';
	if (hours >= 12) {
		hours -= 12;
		period = 'pm';
	}
	if (hours == 0)
		hours = 12;
	
	name += hours.toString() + today.getMinutes() + period + '.json';
	saveAs(blob, name);
}

function clearForm() {
	form1.reset();
	$('#patchdate, #dashdate').datepicker('setDate', today);
	$('#hpromo1, #hpromo2, #afterdash1, #afterdash2').prop('disabled', false);
}

function selectText(containerid) {
	var container = document.getElementById(containerid);
	var range;
	
	if (container.innerHTML == '')
		return;
	
	if (document.body.createTextRange) {
		range = document.body.createTextRange();
		range.moveToElementText(container);
		range.select();
	}
	else if (window.getSelection) {	
		range = document.createRange();
		range.selectNodeContents(container);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
	}
}

function addHomepage() {
	if (currentPatch < 0) {
		noPatch();
		return;
	}
	
	var asset;
	var assets = [];
	var catid = 'cat000000';
	var icid;
	
	var hpromo = '';
	var hpromos = document.getElementsByName('hpromo');
	for (var i = 0; i < hpromos.length; i++) {
		if (hpromos[i].value != '' && hpromo == '')
			hpromo = hpromos[i].value;
		else if (hpromos[i].value != '' && hpromo != '')
			hpromo += ' <span style="color:red;">+</span> ' + hpromos[i].value;
	}
	if (hpromo != '') {
		asset = new Asset(hpromo, 1, catid);
		assets.push(asset);
	}
	
	var ticker = form1.ticker.value;
	if (ticker != '') {
		asset = new Asset(ticker, 2, catid);
		assets.push(asset);
	}
	
	var mains = document.getElementsByName('main');
	var micids = document.getElementsByName('micid');
	for (i = 0; i < mains.length; i++) {
		if (mains[i].value != '') {
			icid = (micids[i].value != '') ? micids[i].value : '';
			asset = new Asset(('Main ' + mains[i].getAttribute('data') + ': ' + mains[i].value), 3, catid, icid);
			assets.push(asset);
		}
	}
	
	var promos = document.getElementsByName('promo');
	var picids = document.getElementsByName('picid');
	for (i = 0; i < promos.length; i++) {
		if (promos[i].value != '') {
			icid = (picids[i].value != '') ? picids[i].value : '';
			asset = new Asset(('Promo ' + promos[i].getAttribute('data') + ': ' + promos[i].value), 4, catid, icid);
			assets.push(asset);
		}
	}
	
	if (assets.length > 0) {
		addAssets(assets);
		buildOutput(0);
	}
	else
		$('#addhomepage').tooltip('enable').focus();
}

function addDesignerIndex() {
	if (currentPatch < 0) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('di');
	var asset;
	var assets = [];
	var catid;
	for (var j = 0; j < selections.length; j++) {
		if (selections[j].checked) {
			catid = selections[j].value;
			asset = new Asset(selections[j].getAttribute('data'), 5, catid);
			assets.push(asset);
		}
	}
	
	addAssets(assets);
	buildOutput(0);
}

function addSiloMain4() {
	if (currentPatch < 0) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('sm4');
	var selections2 = document.getElementsByName('sm4state1');
	var selections3 = document.getElementsByName('sm4state2');
	var asset;
	var assets = [];
	var catid;
	var state;
	for (var j = 0; j < selections.length; j++) {
		if (selections[j].checked) {
			catid = selections[j].value;
			state = (selections2[j].checked) ? parseInt(selections2[j].value) : (selections3[j].checked) ? parseInt(selections3[j].value) : '';
			asset = new Asset(selections[j].getAttribute('data'), 6, catid, '', state);
			assets.push(asset);
		}
	}
	
	addAssets(assets);
	buildOutput(0);
}

function addSiloPromo1() {
	if (currentPatch < 0) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('sp1');
	var selections2 = document.getElementsByName('sp1state');
	var asset;
	var assets = [];
	var catid;
	var state;
	for (var j = 0; j < selections.length; j++) {
		if (selections[j].checked) {
			catid = selections[j].value;
			state = (selections2[j].checked) ? parseInt(selections2[j].value) : '';
			asset = new Asset(selections[j].getAttribute('data'), 7, catid, '', state);
			assets.push(asset);
		}
	}
	
	addAssets(assets);
	buildOutput(0);
}

function addDrawerTicker() {
	if (currentPatch < 0) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('dt');
	var asset;
	var assets = [];
	var catid;
	for (var j = 0; j < selections.length; j++) {
		if (selections[j].checked) {
			catid = selections[j].value;
			asset = new Asset(selections[j].getAttribute('data'), 8, catid);
			assets.push(asset);
		}
	}
	
	addAssets(assets);
	buildOutput(0);
}

function addOther() {
	if (currentPatch < 0) {
		noPatch();
		return;
	}
	
	var name = othername.value;
	var catid = othercat.value;
	var type;
	var state;
	
	var selections = document.getElementsByName('other');
	for (var j = 0; j < selections.length; j++) {
		if (selections[j].checked) {
			type = parseInt(selections[j].value);
			break;
		}
	}
	
	selections = document.getElementsByName('otherstate')
	for (j = 0; j < selections.length; j++) {
		if (selections[j].checked)
			state = parseInt(selections[j].value);
	}
	
	if (name == '') {
		$('#othername').tooltip('enable').focus();
		return;
	}
	if (catid == '' || catid == 'cat') {
		$('#othercat').tooltip('enable').focus();
		return;
	}
	
	var asset = new Asset(name, type, catid, '', state);
	addAssets(asset);
	buildOutput(0);
}

function addPopTile(type) {
	if (currentPatch < 0) {
		noPatch();
		return;
	}
	
	var name = poptilename.value;
	var folder = poptilefname.value;
	
	if (name == '') {
		$('#poptilename').tooltip('enable').focus();
		return;
	}
	if (folder == '' || /\W/.test(folder)) {
		$('#poptilefname').tooltip('enable').focus();
		return;
	}
	
	var asset = new Asset(name, type, folder);
	addAssets(asset);
	buildOutput(0);
}

function addDash(dashType) {
	var patch;
	var asset;
	var assets = [];
	var after1 = afterdash1.value;
	var after2 = afterdash2.value;
	var date = dashdate.value;
	var datesplit = date.split('/');
	var dash = ['Midday','Twilight'];
	var dashfile = ['MDash', 'EveningDash'];
	
	if (date == '') {
		$('#dashdate').tooltip('enable').focus();
		return;
	}
	if (after1 == '') {
		$('#afterdash1').tooltip('enable').focus();
		return;
	}
	if (after2 == '') {
		$('#afterdash2').tooltip('enable').focus();
		return;
	}
	
	var time = '9am';
	
	patch = new Patch(dash[dashType] + ' Dash (Before)', date, time, (datesplit[0] + '_' + datesplit[1] + '_' + (today.getYear() % 100) + '_9am_' + dashfile[dashType] + '_Before'), 'Natasha');
	patches.push(patch);
	currentPatch = patches.length - 1;
	asset = new Asset(dash[dashType] + ' Dash (Before)', 12, 'cat21000740');
	addAssets(asset);
	
	if (dashType == 1 && dashextended.checked)
		time = '3:59pm'
	else if (dashType == 1 && !dashextended.checked)
		time = '5:59pm';
	else
		time = '11:29am';
	
	patch = new Patch(dash[dashType] + ' Dash (Start)', date, time, (datesplit[0] + '_' + datesplit[1] + '_' + (today.getYear() % 100) + '_1129am_' + dashfile[dashType] + '_Start'), 'Natasha');
	patches.push(patch);
	currentPatch++;
	asset = new Asset('Promo 4: '+ dash[dashType] + ' Dash', 4, 'cat000000/r_promo4', '', 3);
	assets.push(asset);
	asset = new Asset('Promo 4p1: Dash Sign-Up', 4, 'cat000000/r_promo4p1', '', 3);
	assets.push(asset);
	asset = new Asset(dash[dashType] + ' Dash (Start)', 12, 'cat21000740');
	assets.push(asset);
	asset = new Asset(dash[dashType] + ' Dash', 9, 'MiddayDash/MiddayDash_popup', '', 3);
	assets.push(asset);
	addAssets(assets);
	assets = [];
	
	if (dashType == 1)
		time = '3:59pm'
	else
		time = '8:59pm';
	
	patch = new Patch(dash[dashType] + ' Dash (Over)', date, '1:29pm', (datesplit[0] + '_' + datesplit[1] + '_' + (today.getYear() % 100) + '_129pm_' + dashfile[dashType] + '_Over'), 'Natasha');
	patches.push(patch);
	currentPatch++;
	asset = new Asset(('Promo 4: ' + after1), 4, 'cat000000/r_promo4', '', 4);
	assets.push(asset);
	asset = new Asset(('Promo 4p1: ' + after2), 4, 'cat000000/r_promo4p1', '', 4);
	assets.push(asset);
	asset = new Asset(dash[dashType] + ' Dash (Over)', 12, 'cat21000740', '', 3);
	assets.push(asset);
	addAssets(assets);
	
	buildOutput(0);
}

function buildOutput(build) {
	// build = 0 -> build approval
	// build = 1 -> build schedule
	
	//Debugging
	console.log('Patch: ' + currentPatch + ' Asset: ' + currentAsset);
	console.log(patches);
	
	if (patches.length < 1) {
		emailsub.innerHTML = '';
		emailbod.innerHTML = '';
		return;
	}
	
	localStorage.setItem('previous-json', JSON.stringify(patches));
	
	var prehtml ='';
	var html = '<div id="patchlist">';
	var assets = [];
	var href = ['wn.ref1.nmg','www.neimanmarcus.com','wn.test1.nmg'];
	var spacer = '<span style="color: red;">_____________________________________________________________________</span>';
	var temp; // For holding temporary information (usually constructed hrefs)
	
	
	if (build == 0) {
		temp = (approvaltime.value == '') ? 'ASAP' : approvaltime.value;
		temp = '<p>The ' + patches[0].date + ' (' + patches[0].time + ') Patches are Ready for Approvals by ' + temp + ' Today</p>';
	}
	else if (build == 1 && today.getDay() == 5)
		temp = "<p>(NMO) This Weekend's Patches Are Ready to Schedule</p>";
	else if (build == 1)
		temp = "<p>(NMO) Tonight's &amp; Tomorrow's Patches Are Ready to Schedule</p>";
	else
		temp = '';
	emailsub.innerHTML = temp;
	
	
	if (build == 0) {
		prehtml += '<p><strong>The <span style="color: red;">' + patches[0].date + ' (' + patches[0].time + ')</span> Patches are posted online at: <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
			'Please proof it and <span style="color: red;">respond</span> with <span style="color: red;">changes</span> or <span style="color: red;">your approval by ';
		prehtml += (approvaltime.value == '') ? 'ASAP</strong></span></p>' : (approvaltime.value + ' Today, ' + months[today.getMonth()] + ' ' + today.getDate() + '</strong></span></p>');
		prehtml += '<p>If you are getting the "category not found page" please do one of the following to check your link:</p>' +
			'<ol><li>Replace the "wnref1" in the url with www.neimanmarcus.com" or</li>' +
			'<li>Do step 1 again and then add "&cacheCheckSeconds=1" at the end of the url</li>' +
			'<li>Or move item from Temp Folder.</li></ol>';
	}
	else {
		prehtml += 'Producers,<br />' +
			"(NMO) Tomorrow's Patches Are Ready to Schedule!<br />";
	}
	
	prehtml += spacer + '<p style="color:green;"><strong>On-Call Merchant/Marketing Content Owner:</strong></p>' + '<p style="color: green;">';
	
	for (var i = 0; i < patches.length; i++) {
		assets = patches[i].assets;
		prehtml += patches[i].name + ': ' + patches[i].merchant + '<br />';
		html += '<div patch="' + i + '">' + spacer + '<p style="color: red;"><strong>' + patches[i].date + ' (' + patches[i].time + ') ' + patches[i].name + '</strong></p>';
		
		if (build == 1)
			html += '<p style="color: gray;"><strong>Folder: ' + patches[i].folder + '</strong></p>';
		
		for (var j = 0; j < assets.length; j++) {
			switch (assets[j].type) {
				case 1:  // Header Promo
					if (j == 0) {
						html += '<p><strong>Homepage</strong> <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
							'<span style="color: blue;">Click above to view entire homepage &amp; headerpromo</span><br />' +
							'(Drag browser window thinner to see mobile)<br />';
					}
					
					temp = 'http://' + href[build] + '/category/cat000000/r_header_promo.html';
					html += '<span asset="' + j + '">Header Promo: ' + assets[j].name + '<br />' +
							'<a href="' + temp + '">' + temp + '</a><br />';
					temp = 'http://' + href[build] + '/category/cat000000/r_mobile_header_promo.html';
					html += 'Mobile Headerpromo: ' + assets[j].name + '<br />' +
							'<a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 2:  // Ticker
					if (j == 0) {
						html += '<p><strong>Homepage</strong> <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
							'<span style="color: blue;">Click above to view entire homepage &amp; headerpromo</span><br />';
					}
					
					html += '<span asset="' + j + '">Ticker: ' + assets[j].name + '</span><br />';
					
					break;
					
				case 3:  // Main
					if (j == 0) {
						html += '<p><strong>Homepage</strong> <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
							'<span style="color: blue;">Click above to view entire homepage &amp; headerpromo</span><br />';
					}
					
					if (assets[j].icid != '')
						html += '<span asset="' + j + '">' + assets[j].name + ' <span style="color: lightseagreen;">icid=' + assets[j].icid + '</span></span><br />';
					else
						html += '<span asset="' + j + '">' + assets[j].name + '</span><br />';
					
					break;
					
				case 4:  // Promo
					if (j == 0) {
						html += '<p><strong>Homepage</strong> <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
							'<span style="color: blue;">Click above to view entire homepage &amp; headerpromo</span><br />';
					}
					
					if (assets[j].state == 4 && build == 0) {
						temp = 'http://' + href[build + 2] + '/category/' + assets[j].path + '.html';
						html += '<span asset="' + j + '">' + assets[j].name + ' <a href="' + temp + '">' + temp + '</a></span><br />';
					}
					else if (assets[j].state == 3 || assets[j].state == 4) {
						temp = 'http://' + href[build] + '/category/' + assets[j].path + '.html';
						html += '<span asset="' + j + '">' + assets[j].name + ' <a href="' + temp + '">' + temp + '</a></span><br />';
					}
					
					else if (assets[j].icid != '')
						html += '<span asset="' + j + '">' + assets[j].name + ' <span style="color: lightseagreen;">icid=' + assets[j].icid + '</span></span><br />';
					else
						html += '<span asset="' + j + '">' + assets[j].name + '</span><br />';
					
					break;
					
				case 5:  // Designer Index
					if (j == 0)
						html += '<p><strong>Designer Index:</strong><br />';
					else {
						if (assets[j-1].type != 5)
							html += '</p><p><strong>Designer Index:</strong><br />';
					}
					
					if (assets[j].path == 'cat45050736')
						temp = 'http://' + href[build] + '/category/' + assets[j].path + '/r_main_drawer_promo.html';
					else
						temp = 'http://' + href[build] + '/category/' + assets[j].path + '/r_designer_promo.html';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 6:  // Silo Main 4
					if (j == 0)
						html += '<p><strong>Silo Main 4:</strong><br />';
					else {
						if (assets[j-1].type != 6)
							html += '</p><p><strong>Silo Main 4:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/category/' + assets[j].path + '/r_main.html';
					if (assets[j].state == 1) // Turn On
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state == 2) // Turn Off
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else
						html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 7:  // Silo Promo 1
					if (j == 0)
						html += '<p><strong>Silo Promo 1:</strong><br />';
					else {
						if (assets[j-1].type != 7)
							html += '</p><p><strong>Silo Promo 1:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/category.jsp?itemId=' + assets[j].path + '&parentId=&siloId=' + assets[j].path;
					if (assets[j].state == 3) // Removed
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Removed)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 8:  // Drawer Tickers
					if (j == 0)
						html += '<p><strong>Drawer Tickers:</strong><br />';
					else {
						if (assets[j-1].type != 8)
							html += '</p><p><strong>Drawer Tickers:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/category/' + assets[j].path + '/r_main_drawer_promo.html';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 9:  // Popups
					if (j == 0)
						html += '<p><strong>Popups:</strong><br />';
					else {
						if (assets[j-1].type != 9)
							html += '</p><p><strong>Popups:</strong><br />';
					}
					
					if (assets[j].state == 3)
						temp = 'http://' + href[build] + '/category/popup/' + assets[j].path + '.html';
					else
						temp = 'http://' + href[build] + '/category/popup/' + assets[j].path + '/' + assets[j].path + '.html';
					
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 10:  // Promo Tiles
					if (j == 0)
						html += '<p><strong>Promo Tiles:</strong><br />';
					else {
						if (assets[j-1].type != 10)
							html += '</p><p><strong>Promo Tiles:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/category/promotiles/' + assets[j].path + '.html';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 11:  // Jump Pages (F0)
					if (j == 0)
						html += '<p><strong>Jump Pages (F0):</strong><br />';
					else {
						if (assets[j-1].type != 11)
							html += '</p><p><strong>Jump Pages (F0):</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 12:  // Graphic Headers
					if (j == 0)
						html += '<p><strong>Graphic Headers:</strong><br />';
					else {
						if (assets[j-1].type != 12)
							html += '</p><p><strong>Graphic Headers:</strong><br />';
					}
					
					if (assets[j].state == 3 && build == 0)
						temp = 'http://' + href[build + 2] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					else
						temp = 'http://' + href[build] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					
					if (assets[j].state == 1) // Turn On
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state == 2 && build == 0) // Turn Off
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else if (assets[j].state == 2 && build == 1) // Turn Off
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 13:  // Silo Banners
					if (j == 0)
						html += '<p><strong>Silo Banners:</strong><br />';
					else {
						if (assets[j-1].type != 13)
							html += '</p><p><strong>Silo Banners:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					if (assets[j].state == 1) // Turn On
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state == 2 && build == 0) // Turn Off
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else if (assets[j].state == 2 && build == 1) // Turn Off
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 14:  // Nav Aux
					if (j == 0)
						html += '<p><strong>Nav Aux:</strong><br />';
					else {
						if (assets[j-1].type != 14)
							html += '</p><p><strong>Nav Aux:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					if (assets[j].state == 1) // Turn On
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state == 2 && build == 0) // Turn Off
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else if (assets[j].state == 2 && build == 1) // Turn Off
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 15:  // Videos
					if (j == 0)
						html += '<p><strong>Videos:</strong><br />';
					else {
						if (assets[j-1].type != 15)
							html += '</p><p><strong>Videos:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 16:  // InSite
					if (j == 0)
						html += '<p><strong>InSite:</strong><br />';
					else {
						if (assets[j-1].type != 16)
							html += '</p><p><strong>InSite:</strong><br />';
					}
					
					temp = 'http://' + href[1] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				default:
					break;
			}
			
		}
		
		html += '</p></div>';
	}
	
	if (build == 1)
		prehtml += '<span style="color: purple;">Creative: ' + oncall.value + '</span>';
	prehtml += '</p>';
	html += '</div>' + spacer + '<p><strong>What do the colors mean?</strong><br />' +
		'<span style="color: green;">GREEN: Merchant Action</span> | <span style="color: purple;">PURPLE: Creative Contact</span> | <span style="color: orange;">ORANGE: Production Action</span> |<br />' +
		'<span style="color: red;">RED: Patch Description</span> | <span style="color: gray;">GRAY: Mentos Folder Name</span> | <span style="color: magenta;">PINK: Homepage Scrolling icid tag</span> | <span style="color: blue;">BLUE: Category Link</span></p>' + spacer;
	
	emailbod.innerHTML = prehtml + html;
	
	$('#patchlist div[patch=' + currentPatch + ']').addClass('selected').find('span[asset=' + currentAsset + ']').addClass('selected');
	$('#patchlist a').attr('target', '_blank');
	$('#patchlist').sortable({
		placeholder: 'sortable-placeholder',
		cursor: 'move',
		forcePlaceholderSize: true,
		update: patchMove,
		create: function(){
			$(this).height($(this).height());
		}
	});
}
