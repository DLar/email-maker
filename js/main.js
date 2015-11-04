$(document).ready(function() {
	$('#patchdate, #dashdate, #editdate').datepicker({
		dateFormat: 'm/d'
	}).not('#editdate').datepicker('setDate', today);
	
	$('input[type=text]').blur(function() {
		$(this).val($.trim($(this).val()));
	});
	
	$('#hp1').change(function() {
		if($(this).is(':checked'))
			$('#hpromo1').val($(this).val());
		else
			$('#hpromo1').val('');
	});
	
	$('#hp2').change(function() {
		if($(this).is(':checked'))
			$('#hpromo2').val($(this).val());
		else
			$('#hpromo2').val('');
	});
	
	$('#accordion').accordion({
		heightStyle: 'content',
		collapsible: true
	});
	
	$('input[name=otherstate], input[name=patchcutline], input[name=editcutline]').click(function() {
		var check = $(this).is(':checked');
		$('input[name='+$(this).attr('name')+']').prop('checked', false);
		if(check) {
			$(this).prop('checked', true);
		}
	});
	
	$(document).keydown(function(e){
		if (e.keyCode === 8 || e.keyCode === 46) /* Backspace or Delete was pressed */
			removeSelected();
		else
			return;
	});
	
	$('input[title]').tooltip({
		position: { my: 'left+5', at: 'right' },
		disabled: true,
		open: function() {
			var that = this;
			setTimeout(function() {
				$(that).tooltip('disable');
			}, 2000);
		}
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
				
				var selections = document.getElementsByName('editcutline');
				for (i = 0; i < selections.length; i++) {
					if (selections[i].checked) {
						patches[currentPatch].cutline = parseInt(selections[i].value);
						break;
					}
					else
						patches[currentPatch].cutline = '';
				}
				
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
		$(this).addClass('selected').closest('div').addClass('selected');
		currentPatch = parseInt($(this).closest('div').attr('patch'));
		currentAsset = parseInt($(this).attr('asset'));
		console.log('Patch: ' + currentPatch + ' Asset: ' + currentAsset);
	});
	
	$('#emailbod').on('dblclick', '#patchlist div[patch]', function() {
		editname.value = patches[currentPatch].name;
		editdate.value = patches[currentPatch].date;
		edittime.value = patches[currentPatch].time;
		editfolder.value = patches[currentPatch].folder;
		editmerchant.value = patches[currentPatch].merchant;
		
		var selections = document.getElementsByName('editcutline');
		for (i = 0; i < selections.length; i++) {
			if (parseInt(selections[i].value) === patches[currentPatch].cutline)
				selections[i].checked = true;
			else
				selections[i].checked = false;
		}
				
		$('#editpop').dialog('open');
	});
});

// Globals
var patches = [];
var currentPatch = -1, currentAsset = -1;
var today = new Date();

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

Cutlines:
1 = Go Live
2 = Remove

States:
1 = Turn On
2 = Turn Off
3 = Removed
4 = Dash (Temporary)
5 = Dash (Temporary)
*/

function Patch(name, date, time, folder, merchant, cutline) {
	this.name = name;
	this.date = date;
	this.time = time;
	this.folder = folder;
	this.merchant = merchant;
	this.cutline = cutline || '';
	this.assets = [];
}

function PatchInfo(name, merchant, cutline) {
	this.name = name;
	this.merchant = merchant;
	this.cutline = cutline;
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
	var cutline = '';
	
	var selections = document.getElementsByName('patchcutline');
	for (i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			cutline = parseInt(selections[i].value);
			break;
		}
	}
	
	if (name === '') {
		$('#patchname').tooltip('enable').focus();
		return;
	}
	if (date === '') {
		$('#patchdate').tooltip('enable').focus();
		return;
	}
	if (time === '') {
		$('#patchtime').tooltip('enable').focus();
		return;
	}
	if (folder === '' || /\W/.test(folder)) {
		$('#patchfolder').tooltip('enable').focus();
		return;
	}
	if (merchant === '') {
		$('#patchmerchant').tooltip('enable').focus();
		return;
	}
	
	patches.push(new Patch(name, date, time, folder, merchant, cutline));
	currentPatch = patches.length - 1;
	
	buildOutput(0);
}

function removeSelected() {
	if (currentPatch === -1 && currentAsset === -1) {
		$('#removeselected').tooltip('enable').focus();
		return;
	}
	else if (currentAsset !== -1) {
		patches[currentPatch].assets.splice(currentAsset, 1);
		
		if (patches[currentPatch].assets.length === 0 || currentAsset === patches[currentPatch].assets.length)
			currentAsset--;
	}
	else {
		patches.splice(currentPatch, 1);
		
		if (patches.length === 0 || currentPatch === patches.length)
			currentPatch--;
	}
	
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

function sortAssets(a, b) {
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
	
	for (var i = 0; i < patches.length; i++) {
		for (var j = i + 1; j < patches.length; j++) {
			if (patches[i].date === patches[j].date && patches[i].time === patches[j].time) {
				patchnames.innerHTML = patches[i].name + '<br />' + patches[j].name;
				patchnames.setAttribute('patch1', i);
				patchnames.setAttribute('patch2', j);
				combinedname.value = patches[i].name + ', ' + patches[j].name;
				combinedfolder.value = patches[i].folder;
				combinedmerchants.value = patches[i].merchant + ', ' + patches[j].merchant;
				
				$('#combinepop').dialog('open');
				return;
			}
		}
	}
	
	$('#checkpatches').tooltip('enable').focus();
}

function loadPrevious() {
	importJSON(localStorage.getItem('previous-json'));
}

function loadFile() {
	var file = FILE.files[0];
	if (file) {
		var reader = new FileReader();
		reader.onload = function() {
			importJSON(reader.result);
		};
		reader.readAsText(file);
	}
	else {
		$('#FILE').tooltip('enable').focus();
	}
}

function importJSON(data) {
	var json;
	try {
		json = JSON.parse(data);
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
	var blob = new Blob([JSON.stringify(patches, null, '\t')], {type: 'text/plain;charset=utf-8'});
	today = new Date();
	var name = (today.getMonth() + 1) + '_' + today.getDate() + '_' + (today.getYear() % 100) + '_';
	var hours = today.getHours();
	var period = 'am';
	if (hours >= 12) {
		hours -= 12;
		period = 'pm';
	}
	if (hours === 0)
		hours = 12;
	
	name += hours.toString() + today.getMinutes() + period + '.json';
	saveAs(blob, name);
}

function clearForm() {
	form1.reset();
	$('#patchdate, #dashdate').datepicker('setDate', today);
}

function selectText(containerid) {
	var container = document.getElementById(containerid);
	var range;
	
	if (container.innerHTML === '')
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
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var assets = [];
	var icid;
	
	var hpromo = '';
	var hpromos = document.getElementsByName('hpromo');
	for (var i = 0; i < hpromos.length; i++) {
		if (hpromos[i].value !== '' && hpromo === '')
			hpromo = hpromos[i].value;
		else if (hpromos[i].value !== '' && hpromo !== '')
			hpromo += ' <span style="color:red;">+</span> ' + hpromos[i].value;
	}
	if (hpromo !== '') {
		assets.push(new Asset(hpromo, 1, 'cat000000'));
	}
	
	var ticker = form1.ticker.value;
	if (ticker !== '') {
		assets.push(new Asset(ticker, 2, 'cat000000'));
	}
	
	var mains = document.getElementsByName('main');
	var micids = document.getElementsByName('micid');
	for (i = 0; i < mains.length; i++) {
		if (mains[i].value !== '') {
			icid = (micids[i].value !== '') ? micids[i].value : '';
			assets.push(new Asset(('Main ' + mains[i].getAttribute('data') + ': ' + mains[i].value), 3, 'cat000000', icid));
		}
	}
	
	var promos = document.getElementsByName('promo');
	var picids = document.getElementsByName('picid');
	for (i = 0; i < promos.length; i++) {
		if (promos[i].value !== '') {
			icid = (picids[i].value !== '') ? picids[i].value : '';
			assets.push(new Asset(('Promo ' + promos[i].getAttribute('data') + ': ' + promos[i].value), 4, 'cat000000', icid));
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
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('di');
	var assets = [];
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked)
			assets.push(new Asset(selections[i].getAttribute('data'), 5, selections[i].value));
	}
	
	addAssets(assets);
	buildOutput(0);
}

function addSiloMain4() {
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('sm4');
	var selections2 = document.getElementsByName('sm4state1');
	var selections3 = document.getElementsByName('sm4state2');
	var assets = [];
	var state;
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			state = (selections2[i].checked) ? parseInt(selections2[i].value) : (selections3[i].checked) ? parseInt(selections3[i].value) : '';
			assets.push(new Asset(selections[i].getAttribute('data'), 6, selections[i].value, '', state));
		}
	}
	
	addAssets(assets);
	buildOutput(0);
}

function addSiloPromo1() {
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('sp1');
	var selections2 = document.getElementsByName('sp1state');
	var assets = [];
	var state;
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			state = (selections2[i].checked) ? parseInt(selections2[i].value) : '';
			assets.push(new Asset(selections[i].getAttribute('data'), 7, selections[i].value, '', state));
		}
	}
	
	addAssets(assets);
	buildOutput(0);
}

function addDrawerTicker() {
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('dt');
	var assets = [];
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			assets.push(new Asset(selections[i].getAttribute('data'), 8, selections[i].value));
		}
	}
	
	addAssets(assets);
	buildOutput(0);
}

function addOther() {
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var name = othername.value;
	var catid = othercat.value;
	var type;
	var state;
	
	var selections = document.getElementsByName('other');
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			type = parseInt(selections[i].value);
			break;
		}
	}
	
	selections = document.getElementsByName('otherstate');
	for (i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			state = parseInt(selections[i].value);
			break;
		}
	}
	
	if (name === '') {
		$('#othername').tooltip('enable').focus();
		return;
	}
	if (catid === '' || catid === 'cat') {
		$('#othercat').tooltip('enable').focus();
		return;
	}
	
	addAssets(new Asset(name, type, catid, '', state));
	buildOutput(0);
}

function addPopTile(type) {
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var name = poptilename.value;
	var folder = poptilefolder.value;
	
	if (name === '') {
		$('#poptilename').tooltip('enable').focus();
		return;
	}
	if (folder === '' || /\W/.test(folder)) {
		$('#poptilefolder').tooltip('enable').focus();
		return;
	}
	
	if (name === 'Eligibility')
		addAssets(new Asset(name, type, ('Eligibility/' + folder), '', 3));
	else
		addAssets(new Asset(name, type, folder));
	
	buildOutput(0);
}

function addDash(dashType) {
	// dashType = 0 -> Midday Dash
	// dashType = 1 -> Twilight Dash
	
	var assets = [];
	var after1 = afterdash1.value;
	var after2 = afterdash2.value;
	var date = dashdate.value;
	var datesplit = date.split('/');
	var dash = ['Midday','Twilight'];
	var dashfolder = ['MDash', 'EveningDash'];
	
	if (date === '') {
		$('#dashdate').tooltip('enable').focus();
		return;
	}
	if (after1 === '') {
		$('#afterdash1').tooltip('enable').focus();
		return;
	}
	if (after2 === '') {
		$('#afterdash2').tooltip('enable').focus();
		return;
	}
	
	var time = '9am';
	var folder = datesplit[0] + '_' + datesplit[1] + '_' + (today.getYear() % 100) + '_' + time + '_' + dashfolder[dashType] + '_Before';
	
	patches.push(new Patch(dash[dashType] + ' Dash (Before)', date, time, folder, 'Chandler'));
	currentPatch = patches.length - 1;
	assets.push(new Asset(dash[dashType] + ' Dash (Before)', 12, 'cat21000740'));
	assets.push(new Asset(dash[dashType] + ' Dash', 9, 'MiddayDash/MiddayDash_popup', '', 3));
	addAssets(assets);
	assets = [];
	
	if (dashType === 1 && dashextended.checked)
		time = '3:59pm';
	else if (dashType === 1 && !dashextended.checked)
		time = '5:59pm';
	else
		time = '11:15am';
	folder = datesplit[0] + '_' + datesplit[1] + '_' + (today.getYear() % 100) + '_' + time.replace(':', '') + '_' + dashfolder[dashType] + '_Start';
	
	patches.push(new Patch(dash[dashType] + ' Dash (Start)', date, time, folder, 'Chandler'));
	currentPatch++;
	assets.push(new Asset('Promo 4: '+ dash[dashType] + ' Dash', 4, 'cat000000/r_promo4', '', 3));
	assets.push(new Asset('Promo 4p1: Dash Sign-Up', 4, 'cat000000/r_promo4p1', '', 3));
	assets.push(new Asset(dash[dashType] + ' Dash (Start)', 12, 'cat21000740'));
	assets.push(new Asset(dash[dashType] + ' Dash', 9, 'MiddayDash/MiddayDash_popup', '', 3));
	addAssets(assets);
	assets = [];
	
	if (dashType === 1)
		time = '8:59pm';
	else
		time = '3:29pm';
	folder = datesplit[0] + '_' + datesplit[1] + '_' + (today.getYear() % 100) + '_' + time.replace(':', '') + '_' + dashfolder[dashType] + '_Over';
	
	patches.push(new Patch(dash[dashType] + ' Dash (Over)', date, time, folder, 'Chandler'));
	currentPatch++;
	assets.push(new Asset(('Promo 4: ' + after1), 4, 'cat000000/r_promo4', '', 4));
	assets.push(new Asset(('Promo 4p1: ' + after2), 4, 'cat000000/r_promo4p1', '', 4));
	assets.push(new Asset(dash[dashType] + ' Dash (Over)', 12, 'cat21000740', '', 3));
	addAssets(assets);
	
	buildOutput(0);
}

function buildOutput(build) {
	// build = 0 -> Approval Email
	// build = 1 -> Schedule Email
	
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
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var spacer = '<span style="color: red;">______________________________________________________________________</span><br /><br />';
	var temp; // For holding temporary information (usually constructed hrefs)
	
	
	if (build === 0) {
		temp = (approvaltime.value === '') ? 'ASAP' : approvaltime.value;
		temp = 'The ' + patches[0].date + ' (' + patches[0].time + ') Patches are Ready for Approvals by ' + temp + ' Today';
	}
	else if (build === 1)
		temp = "(NMO) " + ((today.getDay() === 5) ? "This Weekend's" : "Tonight's &amp; Tomorrow's") + " Patches Are Ready to Schedule";
	else
		temp = '';
	emailsub.innerHTML = temp;
	
	
	if (build === 0) {
		prehtml += '<strong>The <span style="color: red;">' + patches[0].date + ' (' + patches[0].time + ')</span> Patches are posted online at: <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
			'Please proof it and <span style="color: red;">respond</span> with <span style="color: red;">changes</span> or <span style="color: red;">your approval by ';
		prehtml += (approvaltime.value === '') ? 'ASAP</strong></span><br />' : (approvaltime.value + ' Today, ' + months[today.getMonth()] + ' ' + today.getDate() + '</strong></span><br />');
		prehtml += 'If you are getting the "category not found page" please do one of the following to check your link:<br />' +
			'<ol><li>Replace the "wnref1" in the url with www.neimanmarcus.com" or</li>' +
			'<li>Do step 1 again and then add "&cacheCheckSeconds=1" at the end of the url</li>' +
			'<li>Or move item from Temp Folder.</li></ol><br />';
	}
	else {
		prehtml += 'Producers,<br />' +
			"(NMO) " + ((today.getDay() === 5) ? "This Weekend's" : "Tonight's &amp; Tomorrow's") + " Patches Are Ready to Schedule!<br /><br />";
	}
	
	prehtml += spacer + '<span style="color:green;"><strong>On-Call Merchant/Marketing Content Owner:</strong><br />';
	
	for (var i = 0; i < patches.length; i++) {
		assets = patches[i].assets;
		prehtml += patches[i].name + ': ' + patches[i].merchant + '<br />';
		html += '<div patch="' + i + '">' + spacer;
		if (build === 1)
			html += '<span style="color: gray;"><strong>Folder: ' + patches[i].folder + '</strong></span><br /><br />';
		html += '<span style="color: red;"><strong>' + patches[i].date + ' (' + patches[i].time + ') ' + patches[i].name + '</strong></span><br />';
		
		if (patches[i].cutline === 1)
			html += '<span style="color: orange;"><strong>(' + patches[i].name + ' - Cutlines will go LIVE at this time)</strong></span><br /><br />';
		else if (patches[i].cutline === 2)
			html += '<span style="color: orange;"><strong>(' + patches[i].name + ' - Cutlines will go DOWN at this time)</strong></span><br /><br />';
		else
			html += '<br />';
		
		for (var j = 0; j < assets.length; j++) {
			switch (assets[j].type) {
				case 1:  // Header Promo
					if (j === 0) {
						html += '<strong>Homepage</strong> <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
							'Click above to view entire homepage &amp; headerpromo<br />(Drag browser window thinner to see mobile)<br />';
					}
					
					temp = 'http://' + href[build] + '/category/cat000000/r_header_promo.html';
					html += '<span asset="' + j + '">Header Promo: ' + assets[j].name + '<br />' +
							'<a href="' + temp + '">' + temp + '</a><br />';
					temp = 'http://' + href[build] + '/category/cat000000/r_mobile_header_promo.html';
					html += 'Mobile Headerpromo: ' + assets[j].name + '<br />' +
							'<a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 2:  // Ticker
					if (j === 0) {
						html += '<strong>Homepage</strong> <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
							'Click above to view entire homepage &amp; headerpromo<br />(Drag browser window thinner to see mobile)<br />';
					}
					
					html += '<span asset="' + j + '">Ticker: ' + assets[j].name + '</span><br />';
					
					break;
					
				case 3:  // Main
					if (j === 0) {
						html += '<strong>Homepage</strong> <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
							'Click above to view entire homepage &amp; headerpromo<br />(Drag browser window thinner to see mobile)<br />';
					}
					
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].icid !== '')
						html += ' <span style="color: lightseagreen;">icid=' + assets[j].icid + '</span></span><br />';
					else
						html += '</span><br />';
					
					break;
					
				case 4:  // Promo
					if (j === 0) {
						html += '<strong>Homepage</strong> <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
							'Click above to view entire homepage &amp; headerpromo<br />(Drag browser window thinner to see mobile)<br />';
					}
					
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 4 && build === 0) {
						temp = 'http://' + href[build + 2] + '/category/' + assets[j].path + '.html';
						html += ' <a href="' + temp + '">' + temp + '</a></span><br />';
					}
					else if (assets[j].state === 3 || assets[j].state === 4) {
						temp = 'http://' + href[build] + '/category/' + assets[j].path + '.html';
						html += ' <a href="' + temp + '">' + temp + '</a></span><br />';
					}
					
					else if (assets[j].icid !== '')
						html += ' <span style="color: lightseagreen;">icid=' + assets[j].icid + '</span></span><br />';
					else
						html += '</span><br />';
					
					break;
					
				case 5:  // Designer Index
					if (j === 0)
						html += '<strong>Designer Index:</strong><br />';
					else {
						if (assets[j-1].type !== 5)
							html += '<br /><strong>Designer Index:</strong><br />';
					}
					
					if (assets[j].path === 'cat45050736')
						temp = 'http://' + href[build] + '/category/' + assets[j].path + '/r_main_drawer_promo.html';
					else
						temp = 'http://' + href[build] + '/category/' + assets[j].path + '/r_designer_promo.html';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 6:  // Silo Main 4
					if (j === 0)
						html += '<strong>Silo Main 4:</strong><br />';
					else {
						if (assets[j-1].type !== 6)
							html += '<br /><strong>Silo Main 4:</strong><br />';
					}
					
					temp = (assets[j].path === 'cat980731') ? 'http://' + href[build] + '/Sale/' + assets[j].path + '/c.cat' : 'http://' + href[build] + '/category/' + assets[j].path + '/r_main.html';
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 1) // Turn On
						html += ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state === 2) // Turn Off
						html += ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else
						html += ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 7:  // Silo Promo 1
					if (j === 0)
						html += '<strong>Silo Promo 1:</strong><br />';
					else {
						if (assets[j-1].type !== 7)
							html += '<br /><strong>Silo Promo 1:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/category.jsp?itemId=' + assets[j].path + '&parentId=&siloId=' + assets[j].path;
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 3) // Removed
						html += ': <span style="color: green;">(Removed)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 8:  // Drawer Tickers
					if (j === 0)
						html += '<strong>Drawer Tickers:</strong><br />';
					else {
						if (assets[j-1].type !== 8)
							html += '<br /><strong>Drawer Tickers:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/category/' + assets[j].path + '/r_main_drawer_promo.html';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 9:  // Popups
					if (j === 0)
						html += '<strong>Popups:</strong><br />';
					else {
						if (assets[j-1].type !== 9)
							html += '<br /><strong>Popups:</strong><br />';
					}
					
					if (assets[j].state === 3)
						temp = 'http://' + href[build] + '/category/popup/' + assets[j].path + '.html';
					else
						temp = 'http://' + href[build] + '/category/popup/' + assets[j].path + '/' + assets[j].path + '.html';
					
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 10:  // Promo Tiles
					if (j === 0)
						html += '<strong>Promo Tiles:</strong><br />';
					else {
						if (assets[j-1].type !== 10)
							html += '<br /><strong>Promo Tiles:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/category/promotiles/' + assets[j].path + '.html';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 11:  // Jump Pages (F0)
					if (j === 0)
						html += '<strong>Jump Pages (F0):</strong><br />';
					else {
						if (assets[j-1].type !== 11)
							html += '<br /><strong>Jump Pages (F0):</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 12:  // Graphic Headers
					if (j === 0)
						html += '<strong>Graphic Headers:</strong><br />';
					else {
						if (assets[j-1].type !== 12)
							html += '<br /><strong>Graphic Headers:</strong><br />';
					}
					
					if (assets[j].state === 3 && build === 0)
						temp = 'http://' + href[build + 2] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					else
						temp = 'http://' + href[build] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 1) // Turn On
						html += ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state === 2 && build === 0) // Turn Off
						html += ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else if (assets[j].state === 2 && build === 1) // Turn Off
						html += ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 13:  // Silo Banners
					if (j === 0)
						html += '<strong>Silo Banners:</strong><br />';
					else {
						if (assets[j-1].type !== 13)
							html += '<br /><strong>Silo Banners:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 1) // Turn On
						html += ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state === 2 && build === 0) // Turn Off
						html += ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else if (assets[j].state === 2 && build === 1) // Turn Off
						html += ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 14:  // Nav Aux
					if (j === 0)
						html += '<strong>Nav Aux:</strong><br />';
					else {
						if (assets[j-1].type !== 14)
							html += '<br /><strong>Nav Aux:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 1) // Turn On
						html += ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state === 2 && build === 0) // Turn Off
						html += ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else if (assets[j].state === 2 && build === 1) // Turn Off
						html += ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 15:  // Videos
					if (j === 0)
						html += '<strong>Videos:</strong><br />';
					else {
						if (assets[j-1].type !== 15)
							html += '<br /><strong>Videos:</strong><br />';
					}
					
					temp = 'http://' + href[build] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 16:  // InSite
					if (j === 0)
						html += '<strong>InSite:</strong><br />';
					else {
						if (assets[j-1].type !== 16)
							html += '<br /><strong>InSite:</strong><br />';
					}
					
					temp = 'http://' + href[1] + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				default:
					break;
			}
			
		}
		
		html += '<br /></div>';
	}
	
	if (build === 1)
		prehtml += '<br /><span style="color: purple;">Creative: ' + oncall.value + '</span>';
	prehtml += '</span><br />';
	html += '</div>' + spacer + '<strong>What do the colors mean?</strong><br />' +
		'<span style="color: green;">GREEN: Merchant Action</span> | <span style="color: purple;">PURPLE: Creative Contact</span> | <span style="color: orange;">ORANGE: Production Action</span> |<br />' +
		'<span style="color: red;">RED: Patch Description</span> | <span style="color: gray;">GRAY: Mentos Folder Name</span> | <span style="color: magenta;">PINK: Homepage Scrolling icid tag</span> | <span style="color: blue;">BLUE: Category Link</span><br /><br />' + spacer;
	
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
