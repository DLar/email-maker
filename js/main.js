$(document).ready(function() {
	$('#app').hide();
	
	$('#patchdate, #dashdate, #editdate').datepicker({
		dateFormat: 'm/d'
	}).not('#editdate').datepicker('setDate', today);
	
	today.setHours(today.getHours()+2);
	today.setMinutes(Math.ceil(today.getMinutes() / 15) * 15);
	$('#approvaltime').val((today.getHours() % 12 || 12) + ((today.getMinutes() < 10) ? '' : ':' + today.getMinutes()) + ((today.getHours() < 12) ? 'am' : 'pm'));
	
	$('input[type=text]').blur(function() {
		$(this).val($.trim($(this).val()));
	});
	
	$('#oncall').change(function() {
		if(build === 1) 
			buildEOD();
	});
	$('#approvaltime').blur(function() {
		if(build === 0) 
			buildOutput();
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
	
	$('#eligibility').change(function() {
		if($(this).is(':checked'))
			$('#poptilename').val($(this).val());
		else
			$('#poptilename').val('');
	});
	
	$('#accordion').accordion({
		heightStyle: 'content',
		collapsible: true
	});
	
	$('input[name=otherstate], input[name=patchcutline]').click(function() {
		var check = $(this).is(':checked');
		$('input[name=' + $(this).attr('name') + ']').prop('checked', false);
		if(check) {
			$(this).prop('checked', true);
		}
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
	
	$('#editpatch').dialog({
		autoOpen: false,
		resizable: false,
		draggable: false,
		modal: true,
		minWidth: 300,
		buttons: {
			Save: function() {
				$(this).dialog('close');
				
				var info = patches[currentPatch].info;
				var names = document.getElementsByName('editname');
				var merchants = document.getElementsByName('editmerchant');
				var selections = document.getElementsByName('editlive');
				var selections2 = document.getElementsByName('editremove');
				var remove = parseInt(editremove.value);
				
				for (var i = 0; i < info.length; i++) {
					info[i].name = names[i].value;
					info[i].merchant = merchants[i].value;
					
					if (selections[i].checked) {
						info[i].cutline = parseInt(selections[i].value);
						continue;
					}
					else if (selections2[i].checked) {
						info[i].cutline = parseInt(selections2[i].value);
						continue;
					}
					else
						info[i].cutline = 0;
				}
				
				if (remove !== -1)
					patches[currentPatch].info.splice(remove, 1);
				
				patches[currentPatch].test1 = (edittest1.checked) ? true : false;
				patches[currentPatch].date = editdate.value;
				patches[currentPatch].time = edittime.value;
				patches[currentPatch].folder = editfolder.value;
				
				buildOutput();
			},
			Cancel: function() {
				$(this).dialog('close');
			}
		}
	});
	
	$('#editasset').dialog({
		autoOpen: false,
		resizable: false,
		draggable: false,
		modal: true,
		minWidth: 300,
		buttons: {
			Save: function() {
				$(this).dialog('close');
				
				patches[currentPatch].assets[currentAsset].name = editname.value;
				patches[currentPatch].assets[currentAsset].type = parseInt(edittype.value);
				patches[currentPatch].assets[currentAsset].state = parseInt(editstate.value);
				patches[currentPatch].assets[currentAsset].path = editpath.value;
				
				patches[currentPatch].assets = patches[currentPatch].assets.sort(sortAssets);
				buildOutput();
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
	});
	
	$('#emailbod').on('mousedown', '#patchlist span[asset]', function(e) {
		e.stopPropagation();
		$('.selected').removeClass('selected');
		$(this).addClass('selected').closest('div').addClass('selected');
		currentPatch = parseInt($(this).closest('div').attr('patch'));
		currentAsset = parseInt($(this).attr('asset'));
	});
	
	$('#emailbod').on('dblclick', '#patchlist div[patch]', function() {
		var temp = '', temp2 = '<option value="-1"></option>';
		var info = patches[currentPatch].info;
		for (var i = 0; i < info.length; i++) {
			temp += '<tr><td colspan="2"><label>Name:<input type="text" name="editname" value="' + info[i].name + '" /></label></td></tr>' +
				'<tr><td colspan="2"><label>Merchant:<input type="text" name="editmerchant" value="' + info[i].merchant + '" /></label></td></tr>' +
				'<tr><td colspan="2">Cutlines: <label><input type="checkbox" name="editlive" value="1" ' + ((info[i].cutline === 1) ? 'checked ' : '') + '/>Live</label> ' +
				'<label><input type="checkbox" name="editremove" value="2" ' + ((info[i].cutline === 2) ? 'checked ' : '') + '/>Remove</label></td></tr>';
			
			if (info.length > 1)
				temp2 += '<option value="' + i + '">' + info[i].name + '</option>';
		}
		editinfo.innerHTML = temp;
		editremove.innerHTML = temp2;
		
		edittest1.checked = patches[currentPatch].test1;
		editdate.value = patches[currentPatch].date;
		edittime.value = patches[currentPatch].time;
		editfolder.value = patches[currentPatch].folder;
		
		$('#editpatch').dialog('open');
	});
	
	$('#emailbod').on('dblclick', '#patchlist span[asset]', function(e) {
		e.stopPropagation();
		
		editname.value = patches[currentPatch].assets[currentAsset].name;
		edittype.value = patches[currentPatch].assets[currentAsset].type;
		editstate.value = patches[currentPatch].assets[currentAsset].state;
		editpath.value = patches[currentPatch].assets[currentAsset].path;
		
		$('#editasset').dialog('open');
	});
});

// Globals
var patches = [];
var currentPatch = -1, currentAsset = -1;
var today = new Date();
var build = 0;
// build = 0 -> Approval Email
// build = 1 -> Schedule Email

/*
Asset Types:
1 = Header Promo
2 = Homepage
3 = CUSP
5 = Designer Index
6 = Silo Main
7 = Silo Promo
8 = Drawer Ticker
9 = Popup
10 = Promo Tile
11 = Jump Page (F0)
12 = Graphic Header
13 = Silo Banner
14 = Nav Aux
15 = Video
16 = InSite
17 = Entry Page
18 = Checkout

Cutlines:
1 = Live
2 = Remove

States:
1 = Turn On
2 = Turn Off
3 = Removed
4 = Link
*/

function Patch(date, time, folder, info, test1) {
	this.date = date;
	this.time = time;
	this.folder = folder;
	this.info = [info];
	this.assets = [];
	this.test1 = test1 || false;
}

function Info(name, merchant, cutline) {
	this.name = name;
	this.merchant = merchant;
	this.cutline = cutline || 0;
}

function Asset(name, type, path, state) {
	this.name = name;
	this.type = type;
	this.path = path;
	this.state = state || 0;
}

function addPatch() {
	
	var name = patchname.value;
	var date = patchdate.value;
	var time = patchtime.value;
	var folder = patchfolder.value;
	var merchant = patchmerchant.value;
	var cutline = 0;
	
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
	
	patches.push(new Patch(date, time, folder, new Info(name, merchant, cutline)));
	currentPatch = patches.length - 1;
	
	buildOutput();
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
	
	buildOutput();
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
	buildOutput();
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

function combinePatches() {
	
	if (patches.length < 2) {
		$('#combinepatches').tooltip('enable').focus();
		return;
	}
	
	var combined = 0;
	for (var i = 0; i < patches.length; i++) {
		for (var j = i + 1; j < patches.length; j++) {
			if (patches[i].folder === patches[j].folder) {
				currentPatch = i;
				currentAsset = -1;
				patches[i].info = patches[i].info.concat(patches[j].info);
				addAssets(patches[j].assets);
				patches.splice(j, 1);
				j--;
				combined++;
			}
		}
	}
	
	buildOutput();
	
	if (combined > 0)
		alert('Successfully combined ' + combined + ' patches!');
	else
		$('#combinepatches').tooltip('enable').focus();
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
	buildOutput();
}

function exportJSON() {
	if (patches.length < 1) {
		$('#exportfile').tooltip('enable').focus();
		return;
	}
	
	for (var i = 0; i < patches.length; i++) {
		var blob = new Blob([JSON.stringify(patches.slice(i, i+1), null, '\t')], {type: 'text/plain;charset=utf-8'});
		saveAs(blob, patches[i].folder + '.json');
	}
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
	
	var hpromo = '';
	var hpromos = document.getElementsByName('hpromo');
	for (var i = 0; i < hpromos.length; i++) {
		if (hpromos[i].value !== '' && hpromo === '')
			hpromo = hpromos[i].value;
		else if (hpromos[i].value !== '' && hpromo !== '')
			hpromo += ' <span style="color:red">+</span> ' + hpromos[i].value;
	}
	if (hpromo !== '') {
		assets.push(new Asset(hpromo, 1, 'cat000000'));
	}
	
	var hpmg = document.getElementsByName('hpmg');
	var state;
	for (i = 0; i < hpmg.length; i++) {
		if (hpmg[i].value !== '') {
			state = (hpmg[i].parentElement.textContent === "Main 1P: ") ? 4 : 0;
			assets.push(new Asset((hpmg[i].parentElement.textContent + hpmg[i].value), 2, hpmg[i].getAttribute('path'), state));
		}
	}
	
	if (assets.length > 0) {
		addAssets(assets);
		buildOutput();
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
	var selections2 = document.getElementsByName('distate');
	var assets = [];
	var state;
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			state = (selections2[i].checked) ? parseInt(selections2[i].value) : 0;
			assets.push(new Asset(selections[i].parentElement.textContent, 5, selections[i].value, state));
		}
	}
	
	addAssets(assets);
	buildOutput();
}

function addCUSP() {
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('cusp');
	var selections2 = document.getElementsByName('cuspstate');
	var assets = [];
	var state;
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			state = (selections2[i].checked) ? parseInt(selections2[i].value) : 0;
			assets.push(new Asset(selections[i].parentElement.textContent, 3, selections[i].value, state));
		}
	}
	
	addAssets(assets);
	buildOutput();
}

function addSiloMain() {
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('sm');
	var selections2 = document.getElementsByName('smstate1');
	var selections3 = document.getElementsByName('smstate2');
	var assets = [];
	var state;
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			state = (selections2[i].checked) ? parseInt(selections2[i].value) : (selections3[i].checked) ? parseInt(selections3[i].value) : 0;
			assets.push(new Asset(selections[i].parentElement.textContent, 6, selections[i].value, state));
		}
	}
	
	addAssets(assets);
	buildOutput();
}

function addSiloPromo() {
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('sp');
	var selections2 = document.getElementsByName('spstate');
	var assets = [];
	var state;
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			state = (selections2[i].checked) ? parseInt(selections2[i].value) : 0;
			assets.push(new Asset(selections[i].parentElement.textContent, 7, selections[i].value, state));
		}
	}
	
	addAssets(assets);
	buildOutput();
}

function addDrawerTicker() {
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('dt');
	var selections2 = document.getElementsByName('dtstate');
	var assets = [];
	var state;
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			state = (selections2[i].checked) ? parseInt(selections2[i].value) : 0;
			assets.push(new Asset(selections[i].parentElement.textContent, 8, selections[i].value, state));
		}
	}
	
	addAssets(assets);
	buildOutput();
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
	
	addAssets(new Asset(name, type, catid, state));
	buildOutput();
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
	
	if (eligibility.checked)
		folder = 'Eligibility/' + folder;
	else if (type !== 10)
		folder += '/' + folder;
	
	addAssets(new Asset(name, type, folder));
	
	buildOutput();
}

function addDash() {
	var time;
	var folder;
	var assets = [];
	var after1 = afterdash1.value;
	var after2 = afterdash2.value;
	var date = dashdate.value;
	var datesplit = date.split('/');
	
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
	
	time = '11:15am';
	folder = ((datesplit[0].length === 1) ? '0' : '') + datesplit[0] + '_' + ((datesplit[1].length === 1) ? '0' : '') + datesplit[1] + '_' + (today.getYear() % 100) + '_' + time.replace(':', '') + '_MDash_Start';
	
	patches.push(new Patch(date, time, folder, new Info('Midday Dash (Start)', 'Chandler')));
	currentPatch = patches.length - 1;
	assets.push(new Asset('Promo 4: Midday Dash', 2, 'cat000000/r_promo5', 4));
	assets.push(new Asset('Promo 4p1: Dash Sign-Up', 2, 'cat000000/r_promo5p1', 4));
	assets.push(new Asset('Midday Dash (Start)', 12, 'cat21000740'));
	assets.push(new Asset('Midday Dash', 9, 'MiddayDash/MiddayDash_popup'));
	addAssets(assets);
	assets = [];
	
	time = '3:30pm';
	folder = ((datesplit[0].length === 1) ? '0' : '') + datesplit[0] + '_' + ((datesplit[1].length === 1) ? '0' : '') + datesplit[1] + '_' + (today.getYear() % 100) + '_' + time.replace(':', '') + '_MDash_Over';
	
	patches.push(new Patch(date, time, folder, new Info('Midday Dash (Over)', 'Chandler'), true));
	currentPatch++;
	assets.push(new Asset(('Promo 4: ' + after1), 2, 'cat000000/r_promo5', 4));
	assets.push(new Asset(('Promo 4p1: ' + after2), 2, 'cat000000/r_promo5p1', 4));
	assets.push(new Asset('Midday Dash (Over)', 12, 'cat21000740', 4));
	addAssets(assets);
	
	buildOutput();
}

function addCheckout() {
	if (currentPatch === -1) {
		noPatch();
		return;
	}
	
	var selections = document.getElementsByName('co');
	var selections2 = document.getElementsByName('costate');
	var assets = [];
	var state;
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked) {
			state = (selections2[i].checked) ? parseInt(selections2[i].value) : 0;
			assets.push(new Asset(selections[i].parentElement.textContent, 18, selections[i].value, state));
		}
	}
	
	addAssets(assets);
	buildOutput();
}

function switchApp() {
	build = 0;
	$('#app').hide();
	$('#eod').show();
	buildOutput();
}
	
function switchEOD() {
	build = 1;
	$('#eod').hide();
	$('#app').show();
	buildOutput();
}

function buildOutput() {
	
	//Debugging
	console.log('Patch: ' + currentPatch + ' Asset: ' + currentAsset);
	console.log(patches);
	
	if (patches.length < 1) {
		emailsub.innerHTML = '';
		emailbod.innerHTML = '';
		return;
	}
	
	localStorage.setItem('previous-json', JSON.stringify(patches));
	
	var prehtml = '';
	var html = '<div id="patchlist">';
	var assets, href, temp; // For holding temporary information (usually constructed hrefs)
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var spacer = '<span style="color: red">______________________________________________________________________</span><br /><br />';
	
	if (build === 0) {
		if (patches[0].info[0].name === 'Midday Dash (Start)')
			temp = 'MDash';
		else
			temp = patches[0].time;
		
		prehtml += '<strong>The <span style="color: red">' + patches[0].date + ' (' + temp + ')</span> Patches are posted online at: ' +
			'<a href="http://wn.ref1.nmg/index.jsp?mobilePreview=1">http://wn.ref1.nmg/index.jsp?mobilePreview=1</a><br />' +
			'Please proof it and <span style="color: red">respond</span> with <span style="color: red">changes</span> or <span style="color: red">your approval by ' +
			((approvaltime.value === '') ? approvaltime.placeholder : (approvaltime.value + ' Today, ' + months[today.getMonth()] + ' ' + today.getDate())) + '</strong></span><br />' +
			'If you are getting the "category not found page" please do one of the following to check your link:<br />' +
			'<ol><li>Replace the "wn.ref1.nmg" in the url with www.neimanmarcus.com" or</li>' +
			'<li>Do step 1 again and then add "&cacheCheckSeconds=1" at the end of the url</li>' +
			'<li>Or move item from Temp Folder.</li></ol><br />';
		
		temp = 'The ' + patches[0].date + ' (' + temp + ') Patches are Ready for Approvals by ' + ((approvaltime.value === '') ? approvaltime.placeholder : approvaltime.value) + ' Today';
	}
	else {
		temp = "(NMO) ";
		if (today.getDay() === 5)
			temp += "This Weekend's";
		else if (today.getDate() === parseInt(patches[0].date.split('/')[1]))
			temp += "Tonight's &amp; Tomorrow's";
		else
			temp += "Tomorrow's";
		temp += " Patches Are Ready to Schedule";
		
		prehtml += 'Producers,<br />' + temp + '!<br />';
	}
	emailsub.innerHTML = temp;
	
	prehtml += spacer + '<span style="color:green"><strong>On-Call Merchant/Marketing Content Owner:</strong>';
	
	for (var i = 0; i < patches.length; i++) {
		assets = patches[i].assets;
		if (build === 0) {
			if (patches[i].test1)
				href = 'wn.test1.nmg';
			else
				href = 'wn.ref1.nmg';
		}
		else
			href = 'www.neimanmarcus.com';
		
		html += '<div patch="' + i + '">' + spacer;
		if (build === 1)
			html += '<span style="color: gray"><strong>Folder: ' + patches[i].folder + '</strong></span><br /><br />';
		html += '<span style="color: red"><strong>' + patches[i].date + ' (' + patches[i].time + ') ';
		temp = '';
		for (var k = 0; k < patches[i].info.length; k++) {
			prehtml += '<br />' + patches[i].info[k].name + ': ' + patches[i].info[k].merchant;
			html += ((k === 0) ? patches[i].info[k].name : (', ' + patches[i].info[k].name));
			if (patches[i].info[k].cutline === 1 || patches[i].info[k].cutline === 2)
				temp += '<span style="color: orange"><strong>(' + patches[i].info[k].name + ' - Cutlines will go ' + ((patches[i].info[k].cutline === 1) ? 'LIVE' : 'DOWN') + ' at this time)</strong></span><br />';
		}
		html += '</strong></span><br />' + temp + '<br />';
		
		for (var j = 0; j < assets.length; j++) {
			switch (assets[j].type) {
				case 1: // Header Promo
					if (j === 0) {
						html += '<strong>Homepage</strong> <a href="http://' + href + '/index.jsp?mobilePreview=1">http://' + href + '/index.jsp?mobilePreview=1</a><br />' +
							'Click link above to view entire desktop &amp; mobile site<br />';
					}
					
					temp = 'http://' + href + '/category/cat000000/r_header_promo.html';
					html += '<span asset="' + j + '">Header Promo: ' + assets[j].name + '<br />' +
							'<a href="' + temp + '">' + temp + '</a><br />';
					temp = 'http://' + href + '/category/cat000000/r_mobile_header_promo.html';
					html += 'Mobile Headerpromo: ' + assets[j].name + '<br />' +
							'<a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 2: // Homepage
					if (j === 0) {
						html += '<strong>Homepage</strong> <a href="http://' + href + '/index.jsp?mobilePreview=1">http://' + href + '/index.jsp?mobilePreview=1</a><br />' +
							'Click link above to view entire desktop &amp; mobile site<br />';
					}
					
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 4) {
						temp = 'http://' + href + '/category/' + assets[j].path + '.html';
						html += ' <a href="' + temp + '">' + temp + '</a></span><br />';
					}
					else
						html += '</span><br />';
					
					break;
					
				case 3: // CUSP
					if (j === 0)
						html += '<strong>CUSP:</strong><br />';
					else if (assets[j-1].type !== 3)
						html += '<br /><strong>CUSP:</strong><br />';
					
					temp = (assets[j].path === 'r_cusp_promo') ? 'http://' + href + '/CUSP/cat58930763/c.cat' : 'http://' + href + '/category/cat58930763/' + assets[j].path + '.html';
					
					if (assets[j].state === 3) // Removed
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green">(Removed)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 5: // Designer Index
					if (j === 0)
						html += '<strong>Designer Indexes:</strong><br />';
					else if (assets[j-1].type !== 5)
						html += '<br /><strong>Designer Indexes:</strong><br />';
					
					temp = 'http://' + href + '/category/' + assets[j].path + '.html';
					
					if (assets[j].state === 3) // Removed
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green">(Removed)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 6: // Silo Mains
					if (j === 0)
						html += '<strong>Silo Mains:</strong><br />';
					else if (assets[j-1].type !== 6)
						html += '<br /><strong>Silo Mains:</strong><br />';
					
					temp = (assets[j].path === 'cat980731') ? 'http://' + href + '/Sale/' + assets[j].path + '/c.cat' : 'http://' + href + '/category/' + assets[j].path + '/r_main.html';
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 1) // Turn On
						html += ': <span style="color: green">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state === 2) // Turn Off
						html += ': <span style="color: green">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else
						html += ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 7: // Silo Promos
					if (j === 0)
						html += '<strong>Silo Promos:</strong><br />';
					else if (assets[j-1].type !== 7)
						html += '<br /><strong>Silo Promos:</strong><br />';
					
					temp = 'http://' + href + '/category.jsp?itemId=' + assets[j].path + '&parentId=&siloId=' + assets[j].path;
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 3) // Removed
						html += ': <span style="color: green">(Removed)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 8: // Drawer Tickers
					if (j === 0)
						html += '<strong>Drawer Tickers:</strong><br />';
					else if (assets[j-1].type !== 8)
						html += '<br /><strong>Drawer Tickers:</strong><br />';
					
					temp = 'http://' + href + '/category/' + assets[j].path + '/r_main_drawer_promo.html';
					
					if (assets[j].state === 3) // Removed
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green">(Removed)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 9: // Popups
					if (j === 0)
						html += '<strong>Popups:</strong><br />';
					else if (assets[j-1].type !== 9)
						html += '<br /><strong>Popups:</strong><br />';
					
					temp = 'http://' + href + '/category/popup/' + assets[j].path + '.html';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 10: // Promo Tiles
					if (j === 0)
						html += '<strong>Promo Tiles:</strong><br />';
					else if (assets[j-1].type !== 10)
						html += '<br /><strong>Promo Tiles:</strong><br />';
					
					temp = 'http://' + href + '/category/promotiles/' + assets[j].path + '.html';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 11: // Jump Pages (F0)
					if (j === 0)
						html += '<strong>Jump Pages (F0):</strong><br />';
					else if (assets[j-1].type !== 11)
						html += '<br /><strong>Jump Pages (F0):</strong><br />';
					
					temp = 'http://' + href + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 12: // Graphic Headers
					if (j === 0)
						html += '<strong>Graphic Headers:</strong><br />';
					else if (assets[j-1].type !== 12)
						html += '<br /><strong>Graphic Headers:</strong><br />';
					
					if (assets[j].state === 4 && build === 0)
						temp = 'http://' + href + '/category/' + assets[j].path + '/r_head_long.html';
					else
						temp = 'http://' + href + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 1) // Turn On
						html += ': <span style="color: green">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state === 2 && build === 0) // Turn Off Test
						html += ': <span style="color: green">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else if (assets[j].state === 2 && build === 1) // Turn Off Live
						html += ': <span style="color: green">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 13: // Silo Banners
					if (j === 0)
						html += '<strong>Silo Banners:</strong><br />';
					else if (assets[j-1].type !== 13)
						html += '<br /><strong>Silo Banners:</strong><br />';
					
					temp = 'http://' + href + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 1) // Turn On
						html += ': <span style="color: green">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state === 2 && build === 0) // Turn Off Test
						html += ': <span style="color: green">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else if (assets[j].state === 2 && build === 1) // Turn Off Live
						html += ': <span style="color: green">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 14: // Nav Aux
					if (j === 0)
						html += '<strong>Nav Aux:</strong><br />';
					else if (assets[j-1].type !== 14)
						html += '<br /><strong>Nav Aux:</strong><br />';
					
					temp = 'http://' + href + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name;
					if (assets[j].state === 1) // Turn On
						html += ': <span style="color: green">(Turn On)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else if (assets[j].state === 2 && build === 0) // Turn Off Test
						html += ': <span style="color: green">(Turn Off)</span> ' + assets[j].path + '</span><br />';
					else if (assets[j].state === 2 && build === 1) // Turn Off Live
						html += ': <span style="color: green">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 15: // Videos
					if (j === 0)
						html += '<strong>Videos:</strong><br />';
					else if (assets[j-1].type !== 15)
						html += '<br /><strong>Videos:</strong><br />';
					
					temp = 'http://' + href + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 16: // InSite
					if (j === 0)
						html += '<strong>InSite:</strong><br />';
					else if (assets[j-1].type !== 16)
						html += '<br /><strong>InSite:</strong><br />';
					
					temp = 'http://www.neimanmarcus.com/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 17: // Entry Pages
					if (j === 0)
						html += '<strong>Entry Pages:</strong><br />';
					else if (assets[j-1].type !== 17)
						html += '<br /><strong>Entry Pages:</strong><br />';
					
					temp = 'http://' + href + '/i/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				case 18: // Checkout
					if (j === 0)
						html += '<strong>Checkout:</strong><br />';
					else if (assets[j-1].type !== 18)
						html += '<br /><strong>Checkout:</strong><br />';
					
					temp = 'http://' + href + '/category/' + assets[j].path + '.html';
					
					if (assets[j].state === 3) // Removed
						html += '<span asset="' + j + '">' + assets[j].name + ': <span style="color: green">(Removed)</span> <a href="' + temp + '">' + temp + '</a></span><br />';
					else
						html += '<span asset="' + j + '">' + assets[j].name + ': <a href="' + temp + '">' + temp + '</a></span><br />';
					
					break;
					
				default:
					break;
			}
			
		}
		
		html += '<br /></div>';
	}
	
	prehtml += '</span><br />';
	if (build === 1)
		prehtml += '<span style="color: purple">Creative: ' + oncall.value + '</span><br />';
	html += '</div>' + spacer + '<strong>What do the colors mean?</strong><br />' +
		'<span style="color: green">GREEN: Merchant Action</span> | <span style="color: purple">PURPLE: Creative Contact</span> | <span style="color: orange">ORANGE: Production Action</span> |<br />' +
		'<span style="color: red">RED: Patch Description</span> | <span style="color: gray">GRAY: Mentos Folder Name</span> | <span style="color: blue">BLUE: Category Link</span><br /><br />' + spacer;
	
	prehtml = prehtml.replace(/Midday Dash \(Start\): Chandler<br \/>| \(Over\)/g, '');
	emailbod.innerHTML = prehtml + '<br />' + html;
	
	$('#patchlist div[patch=' + currentPatch + ']').addClass('selected').find('span[asset=' + currentAsset + ']').addClass('selected');
	$('#patchlist a').attr('target', '_blank');
}