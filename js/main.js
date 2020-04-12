$(document).ready(function() {
	$('#patchdate, #editdate').datepicker({
		dateFormat: 'm/d'
	}).not('#editdate').datepicker('setDate', today);
	
	today.setHours(today.getHours()+2);
	today.setMinutes(Math.ceil(today.getMinutes() / 15) * 15);
	$('#approvaltime').val((today.getHours() % 12 || 12) + ((today.getMinutes() < 10) ? '' : ':' + today.getMinutes()) + ((today.getHours() < 12) ? 'am' : 'pm'));
	
	$('input[type=text]').blur(function() {
		$(this).val($.trim($(this).val()));
		
		if ($(this).attr('id') != 'patchtime' && $(this).attr('id') != 'approvaltime' && $(this).attr('id') != 'edittime') {
			$(this).val($(this).val().replace(':', ''));
		}
	});
	
	$('#oncall').change(function() {
		if (build === 1) { buildOutput(); }
	});
	$('#approvaltime').blur(function() {
		if (build === 0) { buildOutput(); }
	});
	
	$('#accordion').accordion({
		heightStyle: 'content',
		collapsible: true
	});
	
	$('input[name=patchcutline]').click(function() {
		var check = $(this).is(':checked');
		$('input[name=' + $(this).attr('name') + ']').prop('checked', false);
		if (check) { $(this).prop('checked', true); }
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
		minWidth: 400,
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
					
					if (selections[i].checked) { info[i].cutline = parseInt(selections[i].value); continue; }
					else if (selections2[i].checked) { info[i].cutline = parseInt(selections2[i].value); continue; }
					else { info[i].cutline = 0; }
				}
				
				if (remove !== -1) { patches[currentPatch].info.splice(remove, 1); }
				
				patches[currentPatch].date = editdate.value;
				patches[currentPatch].time = edittime.value;
				patches[currentPatch].folder = editfolder.value;
				patches[currentPatch].aemother = editother.value;
				patches[currentPatch].aemhome = edithome.value;
				
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
			temp += '<tr><td><label>Name:<input type="text" name="editname" value="' + info[i].name + '" /></label></td>' +
				'<td><label>Merchant:<input type="text" name="editmerchant" value="' + info[i].merchant + '" /></label></td></tr>' +
				'<tr><td colspan="2">Cutlines: <label><input type="checkbox" name="editlive" value="1" ';
			if (info[i].cutline === 1) { temp += 'checked '; }
			temp += '/>Live</label> <label><input type="checkbox" name="editremove" value="2" ';
			if (info[i].cutline === 2) { temp += 'checked '; }
			temp += '/>Remove</label></td></tr>';
			
			if (info.length > 1) { temp2 += '<option value="' + i + '">' + info[i].name + '</option>'; }
		}
		editinfo.innerHTML = temp;
		editremove.innerHTML = temp2;
		
		editdate.value = patches[currentPatch].date;
		edittime.value = patches[currentPatch].time;
		editfolder.value = patches[currentPatch].folder;
		editother.value = patches[currentPatch].aemother;
		edithome.value = patches[currentPatch].aemhome;
		
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
var brand;
var patches = [];
var currentPatch = -1, currentAsset = -1;
var today = new Date();
var build = 0;
// 0 = Approval Email
// 1 = Schedule Email

function Patch(date, time, folder, info) {
	this.date = date;
	this.time = time;
	this.folder = folder;
	this.info = [info];
	this.assets = [];
	this.aemother = '';
	this.aemhome = '';
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
	for (var i = 0; i < selections.length; i++) {
		if (selections[i].checked) { cutline = parseInt(selections[i].value); break; }
	}
	
	if (!name) { $('#patchname').tooltip('enable').focus(); return; }
	if (!date) { $('#patchdate').tooltip('enable').focus(); return; }
	if (!time) { $('#patchtime').tooltip('enable').focus(); return; }
	if (/\W/.test(folder)) { $('#patchfolder').tooltip('enable').focus(); return; }
	if (!merchant) { $('#patchmerchant').tooltip('enable').focus(); return; }
	
	patches.push(new Patch(date, time, folder, new Info(name, merchant, cutline)));
	currentPatch = patches.length - 1;
	
	patches[currentPatch].aemhome = aemhome.value;
	patches[currentPatch].aemother = aemother.value;
	
	buildOutput();
}

function removeSelected() {
	if (currentPatch === -1 && currentAsset === -1) {
		$('#removeselected').tooltip('enable').focus(); return;
	} else if (currentAsset !== -1) {
		patches[currentPatch].assets.splice(currentAsset, 1);
		
		if (patches[currentPatch].assets.length === 0 || currentAsset === patches[currentPatch].assets.length) { currentAsset--; }
	} else {
		patches.splice(currentPatch, 1);
		
		if (patches.length === 0 || currentPatch === patches.length) { currentPatch--; }
	}
	
	buildOutput();
}

function noPatch() {
	$('#accordion').accordion({ active: 0 });
	$('#addpatch').tooltip('enable').tooltip('open');
	patchname.focus();
}

function addAssets(assets) {
	if (assets.length > 0) {
		patches[currentPatch].assets = patches[currentPatch].assets.concat(assets);
		patches[currentPatch].assets = patches[currentPatch].assets.sort(sortAssets);
	}
}

function sortAssets(a, b) {
	if (a.type < b.type) { return -1; }
	else if (a.type > b.type) { return 1; }
	else {
		if (a.state < b.state) { return -1; }
		else if (a.state > b.state) { return 1; }
		else { return (a.name).localeCompare(b.name); }
	}
}

function combinePatches() {
	if (patches.length < 2) { $('#combinepatches').tooltip('option', 'content', 'Need more patches').tooltip('enable').focus(); return; }
	
	var combined = 0;
	for (var i = 0; i < patches.length; i++) {
		for (var j = i + 1; j < patches.length; j++) {
			if (patches[i].folder === patches[j].folder) {
				currentPatch = i;
				currentAsset = -1;
				patches[i].info = patches[i].info.concat(patches[j].info);
				addAssets(patches[j].assets);
				if (patches[j].aemhome) { patches[i].aemhome = patches[j].aemhome; }
				if (patches[j].aemother) { patches[i].aemother = patches[j].aemother; }
				patches.splice(j, 1);
				j--;
				combined++;
			}
		}
	}
	
	buildOutput();
	
	if (combined > 0) { $('#combinepatches').tooltip('option', 'content', 'Combined ' + combined + ' patches').tooltip('enable').focus(); }
	else { $('#combinepatches').tooltip('option', 'content', 'No patches combined').tooltip('enable').focus(); }
}

function loadPrevious() {
	importJSON(localStorage.getItem(brand + '-previous'));
}

function loadFiles(files) {
	if (files.length > 0) {
		for (var i = 0; i < files.length; i++) {
			var reader = new FileReader();
			reader.onload = function(e) {
				importJSON(e.target.result);
			};
			reader.readAsText(files[i]);
		}
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
	if (patches.length < 1) { $('#exportfile').tooltip('enable').focus(); return; }
	
	for (var i = 0; i < patches.length; i++) {
		var blob = new Blob([JSON.stringify(patches.slice(i, i+1), null, '\t')], {type: 'text/plain;charset=utf-8'});
		
		var temp = 'No_Name';
		if (patches[i].folder) { temp = patches[i].folder; }
		else if (patches[i].aemhome) { temp = patches[i].aemhome; }
		else if (patches[i].aemother) { temp = patches[i].aemother; }
		
		saveAs(blob, temp + '.json');
	}
}

function clearForm() {
	$('#form1 input[type=text]').not('.no-reset input').val('');
}

function selectText(containerid) {
	var container = document.getElementById(containerid);
	var range;
	
	if (!container.innerHTML) { return; }
	
	if (document.body.createTextRange) {
		range = document.body.createTextRange();
		range.moveToElementText(container);
		range.select();
		document.execCommand('copy');
	} else if (window.getSelection) {	
		range = document.createRange();
		range.selectNodeContents(container);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
		document.execCommand('copy');
	}
}

function addSingle(nameId, pathId, typesName) {
	if (currentPatch === -1) { noPatch(); return; }
	
	var name = document.getElementById(nameId).value;
	var path = document.getElementById(pathId).value;
	var types = document.getElementsByName(typesName);
	var type;
	for (var i = 0; i < types.length; i++) {
		if (types[i].checked) { type = parseInt(types[i].value); break; }
	}
	
	if (!name) { $('#' + nameId).tooltip('enable').focus(); return; }
	
	addAssets([new Asset(name, type, path)]);
	buildOutput();
}

function addTexts(inputsName, type, pathsName) {
	if (currentPatch === -1) { noPatch(); return; }
	
	var inputs = document.getElementsByName(inputsName);
	var paths = document.getElementsByName(pathsName);
	var assets = [], name, path;
	
	for (var i = 0; i < inputs.length; i++) {
		if (!inputs[i].value) { continue; }
		else if (pathsName) {
			name = inputs[i].value;
			path = paths[i].value;
		} else {
			name = inputs[i].parentElement.textContent.replace(':', ' -') + inputs[i].value;
			path = inputs[i].getAttribute('data-path');
		}
		
		assets.push(new Asset(name, parseInt(type), path));
	}
	
	addAssets(assets);
	buildOutput();
}

function addChecks(inputsName, type, statesName) {
	if (currentPatch === -1) { noPatch(); return; }
	
	var inputs = document.getElementsByName(inputsName);
	var states = document.getElementsByName(statesName);
	var assets = [], name, path, state;
	
	for (var i = 0; i < inputs.length; i++) {
		if (!inputs[i].checked) { continue; }
		else if (statesName && states[i].checked) { state = parseInt(states[i].value); }
		else { state = 0; }
		
		name = inputs[i].parentElement.textContent;
		path = inputs[i].value;
		
		assets.push(new Asset(name, parseInt(type), path, state));
	}
	
	addAssets(assets);
	buildOutput();
}

function switchBuild(button) {
	if (build === 0) { build = 1; button.value = 'Generate Approval'; }
	else if (build === 1) { build = 0; button.value = 'Generate Schedule'; }
	buildOutput();
}

function getLink(type, path) {
	var href = lib[brand].domains[build];

	if (brand === 'NM') {
		switch (type) {
			case 0:
				if (build === 0) { href = lib[brand].domains[1] + '?personalize=true'; } break;
			case 10:
				if (!path) { return ''; }
			case 6:
			case 7:
			case 8:
			case 9:
				href = lib[brand].domains[1] + 'c/' + path + '?cacheCheckSeconds=1'; break;
			case 13:
				href += 'category/popup/' + path + '/' + path + '.html'; break;
			case 14:
				href += 'c/' + path + '?cacheCheckSeconds=1'; break; 
			case 15:
				href += 'category/' + path + '.html'; break; 
			default:
				return '';
		}
	}

	if (brand === 'LB/MAG') {
		if (type === 1 || type === 2) { href += 'c/' + path + '?cacheCheckSeconds=1'; }
		else { return ''; }
	}

	if (brand === 'HC') {
		switch (type) {
			case 0:
				break;
			case 3:
				href += 'category/' + path + '/r_main_drawer_promo.html'; break;
			case 4:
				href += 'category/' + path + '/r_head_long.html'; break;
			case 5:
				href += 'category/popups/r_horchow_popup.html'; break;
			case 6:
				href += 'category/search/r_promo.html'; break;
			case 7:
				href += 'category/product/r_promo1.html'; break;
			default:
				return '';
		}
	}

	if (brand === 'LC') {
		switch (type) {
			case 0:
				break;
			case 2:
				href += 'category/cat000000/r_header_promo2.html'; break;
			case 4:
				href += 'category/' + path + '.html'; break;
			case 5:
			case 6:
			case 7:
				href += path + '/c.cat'; break;
			case 8: 
				href += 'category/promotiles/' + path + '.html'; break;
			case 9:
				href += 'category/popup/Promo/' + path + '.html'; break;
			case 10:
				href += 'category/cat000000/promo_sticker/r_promo_sticker.html'; break;
			case 11:
				href += 'category/checkout_spc/promo_areas/checkout_top1.html'; break;
			case 12:
				href += 'category/storeresults/r_banner.html'; break;
			case 13:
				href += 'category/product/r_promo1.html'; break;
			default:
				return '';
		}
	}

	if (brand === 'APP') {
		if (type === 0 && build === 0) {
			href += 'c/cat54940733?cacheCheckSeconds=1';
			var href2 = 'https://s3-us-west-2.amazonaws.com/nmmobile-builds/cfa/operational/CFA_operational.html';
			return '<b>Test App:</b> <a href="' + href2 + '">' + href2 + '</a><br><b>CSV File:</b> <a href="' + href + '">' + href + '</a>';
		}
		else if (type === 0 && build === 1) { href += 'category/cat000000/the_app/the_app.csv'; }
		else if (type === 1 && path) { return ' <span style="color: green">(' + path + ')</span>'; }
		else { return ''; }
	}

	if (brand === 'NTF') {
		if (type === 1) { href += 'content/dam/neiman-marcus/FINAL/APP/NTF/' + path + '.jpg'; }
		else { return ''; }
	}

	return '<a href="' + href + '">' + href + '</a>';
}

function buildOutput() {
	//Debugging
	//console.log('Patch: ' + currentPatch + ' Asset: ' + currentAsset);
	//console.log(patches);
	
	if (patches.length < 1) { emailsub.innerHTML = ''; emailbod.innerHTML = ''; return; }
	
	localStorage.setItem(brand + '-previous', JSON.stringify(patches));
	
	var temp, header, body = '<div id="patchlist">';
	var spacer = '<span style="color: red">______________________________________________________________________</span><br><br>';
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	
	if (patches[0].date !== patches[patches.length-1].date) { temp = patches[0].date + '-' + patches[patches.length-1].date; }
	else { temp = patches[0].date + ' (' + patches[0].time + ')'; }
	
	if (build === 0) {
		emailsub.innerHTML = '[' + brand + '] ' + temp + ' ' + lib[brand].header + ' Ready for Approval by ' + ((approvaltime.value) ? approvaltime.value : approvaltime.placeholder);
		header = 'The <span style="color: red"><b>' + temp + '</b></span> ' + lib[brand].header.toLowerCase() + ' now ready to review online.<br>' +
			'Please respond with changes or approval by <span style="color: red"><b>' +
			((approvaltime.value) ? (approvaltime.value + ' Today, ' + months[today.getMonth()] + ' ' + today.getDate()) : approvaltime.placeholder) + '.</span></b><br>';
	} else {
		emailsub.innerHTML = '[' + brand + '] ' + temp + ' ' + lib[brand].header + ' Ready to Schedule';
		header = 'Producers,<br>The ' + temp + ' ' + brand + ' ' + lib[brand].header.toLowerCase() + ' ready to schedule!<br>';
	}
	header += spacer + '<span style="color:green"><b>Merchant/Marketing Owner:</b>';
	
	for (var i = 0; i < patches.length; i++) {
		body += spacer + '<div patch="' + i + '">';
		
		if (build === 1) {
			body += '<b><span style="color: gray">';
			if (patches[i].folder) { body += 'Category Folder: ' + patches[i].folder + '<br>'; }
			if (patches[i].aemhome) { body += 'Home Launch: ' + patches[i].aemhome + '<br>'; }
			if (patches[i].aemother) { body += 'Other Launch: ' + patches[i].aemother + '<br>'; }
			body += '<br></span></b>';
		}
		
		temp = '';
		body += '<b><span style="color: red">' + patches[i].date + ' (' + patches[i].time + ') ';
		for (var k = 0; k < patches[i].info.length; k++) {
			header += '<br>' + patches[i].info[k].name + ': ' + patches[i].info[k].merchant;
			if (k > 0) { body += ', '; }
			body += patches[i].info[k].name;
			if (patches[i].info[k].cutline !== 0) {
				temp += '<br>(' + patches[i].info[k].name + ' - Cutlines will go ' + lib.cutlines[patches[i].info[k].cutline] + ' at this time)';
			}
		}
		body += '</span><span style="color: orange">' + temp + '</span></b>';
		temp = getLink(0,'');
		if (temp) { body += '<br><br>' + temp; }
		
		for (var j = 0; j < patches[i].assets.length; j++) {
			if (j === 0 || patches[i].assets[j-1].type !== patches[i].assets[j].type) {
				body += '<br><br><b>' + lib[brand].types[patches[i].assets[j].type] + '</b>';
			}
			body += '<br><span asset="' + j + '">' + patches[i].assets[j].name;
			if (patches[i].assets[j].state !== 0) {
				body += ' <span style="color: ' + ((patches[i].assets[j].state === 5) ? 'magenta' : 'green') + '">(' + lib.states[patches[i].assets[j].state] + ')</span>';
			}
			temp = getLink(patches[i].assets[j].type, patches[i].assets[j].path);
			if (temp) { body += ': ' + temp; }
			body += '</span>';
		}
		
		body += '</div>';
	}
	
	header += '</span>';
	if (build === 1) header += '<br><span style="color: purple">Creative: ' + oncall.options[oncall.selectedIndex].textContent + ' ' + oncall.value + '</span>';
	
	body += '</div>' + spacer + '<strong>What do the colors mean?</strong><br>' +
	'<span style="color: green">GREEN: Merchant Action</span> | <span style="color: purple">PURPLE: Creative Contact</span> | <span style="color: orange">ORANGE: Production Action</span> |<br>' +
	'<span style="color: red">RED: Patch Description</span> | <span style="color: gray">GRAY: Mentos Folder Name</span> | <span style="color: blue">BLUE: Category Link</span><br>' + spacer;
	
	emailbod.innerHTML = header + body;
	
	$('#patchlist div[patch=' + currentPatch + ']').addClass('selected').find('span[asset=' + currentAsset + ']').addClass('selected');
	$('#patchlist a').attr('target', '_blank');
}