$(document).ready(function() {
	$("#hp1").change(function( event ) {
		if($(this).is(":checked")) {
			$('#hpromo1').prop('disabled', true).val($(this).val());
		}
		else {
			$('#hpromo1').prop('disabled', false).val("");
		}
	});
	$("#hp2").change(function( event ) {
		if($(this).is(":checked")) {
			$('#hpromo2').prop('disabled', true).val($(this).val());
		}
		else {
			$('#hpromo2').prop('disabled', false).val("");
		}
	});
	$("#dash1").change(function( event ) {
		if($(this).is(":checked")) {
			$('#afterdash1').prop('disabled', true).val($(this).val());
		}
		else {
			$('#afterdash1').prop('disabled', false).val("");
		}
	});
	$("#dash2").change(function( event ) {
		if($(this).is(":checked")) {
			$('#afterdash2').prop('disabled', true).val($(this).val());
		}
		else {
			$('#afterdash2').prop('disabled', false).val("");
		}
	});
	
	$(".datepicker").datepicker({
		dateFormat: "m/d"
	});
	$(".datepicker").datepicker('setDate', today);
	$("input[type=text]").blur(function() {
		$(this).val( $.trim( $(this).val() ) );
	});
	$( "#accordion" ).accordion({
		heightStyle: "content"
	});
});

// Globals
var patches = [];
var preDel = 0;
var currentID = 0;
var today = new Date();
var months = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"];

/*
Types:
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

States:
1 = Turn On
2 = Turn Off
3 = Removed
4 = Dash (Temporary)
5 = Dash (Temporary)
*/

function Asset(name, type, path, icid, state) {
	this.name = name;
	this.type = type;
	this.path = path;
	this.icid = icid || "";
	this.state = state || "";
}

function Patch(name, date, time, folder, merchant) {
	this.name = name;
	this.date = date;
	this.time = time;
	this.folder = folder || "";
	this.merchant = merchant;
	this.id = preDel;
	this.assets = [];
}

function addPatch() {
	
	var name = form1.patchname.value;
	var date = form1.patchdate.value;
	var time = form1.patchtime.value + form1.patchperiod.value;
	var folder = form1.patchfolder.value;
	var merchant = form1.merchant.value;
	
	if (name == '') {
		alert("Missing patch name.");
		form1.patchname.focus();
		return;
	}
	if (date == '') {
		alert("Missing patch date.");
		form1.patchdate.focus();
		return;
	}
	if (time == 'am' || time == 'pm') {
		alert("Missing patch time.");
		form1.patchtime.focus();
		return;
	}
	if (folder == '' || /\s/.test(folder)) {
		alert("Missing or invalid patch folder name.");
		form1.patchfolder.focus();
		return;
	}
	if (merchant == '') {
		alert("Missing merchant name.");
		form1.merchant.focus();
		return;
	}
	
	preDel++;
	var patch = new Patch(name, date, time, folder, merchant);
	patches.push(patch);
	currentID = preDel;
	
	buildOutput(0);
	console.log("Current ID: " + currentID);
	console.log(patches);
}

function removePatch() {
	if (currentID > 0)
	{	
		for (var i = 0; i < patches.length; i++) {
			if(patches[i].id == currentID) {
				patches.splice(i, 1);
				
				if (patches.length == 0)
					currentID = 0;
				else if (i == patches.length)
					currentID = patches[i-1].id;
				else
					currentID = patches[i].id;
				
				buildOutput(0);
				break;
			}
		}
		
		console.log("Current ID: " + currentID);
		console.log(patches);
	}
	else {
		alert("No more patches to remove.");
	}
}

function needPatch() {
	alert("Must have at least 1 patch before adding any assets.");
	$("#accordion").accordion({ active: 0 });
	form1.patchname.focus();
}

function exportJSON() {
	var json = JSON.stringify(patches, null, "\t");
	var blob = new Blob([json], {type: "text/plain;charset=utf-8"});
	today = new Date();
	var name = (today.getMonth() + 1) + "_" + today.getDate() + "_" + today.getFullYear().toString().substr(2,2) + "_";
	var hours = today.getHours();
	var period = "am";
	if (hours >= 12) {
		hours -= 12;
		period = "pm";
	}
	if (hours == 0) {
		hours = 12;
	}
	name += hours.toString() + today.getMinutes() + period + ".json";
	saveAs(blob, name);
}

function loadFile() {
	var file = form1.FILE.files[0];
	if (file) {
		var reader = new FileReader();
		reader.onload = function() {
			importJSON(reader.result);
		}
		reader.readAsText(file);
	}
	else {
		alert("Missing input file.");
	}
}

function importJSON(data) {
	var json = JSON.parse(data);
	
	if (json.length < 1) {
		alert("Empty or corrupt JSON file.");
		return;
	}
	
	currentID = preDel + 1;
	for (i = 0; i < json.length; i++) {
		preDel++;
		json[i].id = preDel;
	}
	
	patches = patches.concat(json);
	buildOutput(0);
	
	console.log("Current ID: " + currentID);
	console.log(patches);
}

function loadPrev() {
	var json = localStorage.getItem("previous-json");
	importJSON(json);
}

function compareAssets(a,b) {
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

function addAssets(assets) {
	for (var i = 0; i < patches.length; i++) {
		if(patches[i].id == currentID) {
			patches[i].assets = patches[i].assets.concat(assets);
			patches[i].assets = patches[i].assets.sort(compareAssets);
			console.log(patches[i].assets);
			break;
		}
	}
	
	buildOutput(0);
	console.log(patches);
}

function patchMove() {
	var order = $("#patchlist").sortable("toArray", {attribute: "patchid"});
	order = order.map(Number);
	var place;
	var temp = [];
	
	for (var i = 0; i < patches.length; i++) {
		place = order.indexOf(patches[i].id);
		temp[place] = patches[i];
	}
	
	patches = temp;
	buildOutput(0);
	console.log(patches);
}

function clearForm() {
	form1.reset();
	$(".datepicker").datepicker('setDate', today);
	$('#hpromo1, #hpromo2').prop('disabled', false);
	$('#afterdash1, #afterdash2').prop('disabled', false);
}

function removeAsset() {
	for (var i = 0; i < patches.length; i++) {
		if (patches[i].id == currentID) {
			patches[i].assets.pop();
			
			buildOutput(0);
			console.log(patches[i].assets);
			break;
		}
	}
}

function addHomepage() {
	if (currentID <= 0) {
		needPatch();
		return;
	}
	
	var asset;
	var assets = [];
	var catid = "cat000000";
	var icid;
	
	var hpromo = "";
	var hpromos = document.getElementsByName("hpromo");
	for (var i = 0; i < hpromos.length; i++) {
		if (hpromos[i].value != "" && hpromo == "") {
			hpromo = hpromos[i].value;
		}
		else if (hpromos[i].value != "" && hpromo != "") {
			hpromo += " <span style='color:red;'>+</span> " + hpromos[i].value;
		}
	}
	if (hpromo != "") {
		asset = new Asset(hpromo, 1, catid);
		assets.push(asset);
	}
	
	var ticker = form1.ticker.value;
	if (ticker != "") {
		asset = new Asset(ticker, 2, catid);
		assets.push(asset);
	}
	
	var mains = document.getElementsByName("main");
	var micids = document.getElementsByName("micid");
	for (i = 0; i < mains.length; i++) {
		if (mains[i].value != "") {
			icid = (micids[i].value != "") ? micids[i].value : "";
			asset = new Asset(("Main " + mains[i].getAttribute("data") + ": " + mains[i].value), 3, catid, icid);
			assets.push(asset);
		}
	}
	
	var promos = document.getElementsByName("promo");
	var picids = document.getElementsByName("picid");
	for (i = 0; i < promos.length; i++) {
		if (promos[i].value != "") {
			icid = (picids[i].value != "") ? picids[i].value : "";
			asset = new Asset(("Promo " + promos[i].getAttribute("data") + ": " + promos[i].value), 4, catid, icid);
			assets.push(asset);
		}
	}
	
	if (assets.length > 0) {
		addAssets(assets);
	}
	else {
		alert("No assets added for homepage.");
	}
}

function addDesignerIndex() {
	if (currentID <= 0) {
		needPatch();
		return;
	}
	
	var selections = document.getElementsByName("di");
	var asset;
	var assets = [];
	var catid;
	for (var j = 0; j < selections.length; j++) {
		if (selections[j].checked) {
			catid = selections[j].value;
			asset = new Asset(selections[j].getAttribute("data"), 5, catid);
			assets.push(asset);
		}
	}
	
	addAssets(assets);
}

function addSiloMain4() {
	if (currentID <= 0) {
		needPatch();
		return;
	}
	
	var selections = document.getElementsByName("sm4");
	var selections2 = document.getElementsByName("sm4state1");
	var selections3 = document.getElementsByName("sm4state2");
	var asset;
	var assets = [];
	var catid;
	var state;
	for (var j = 0; j < selections.length; j++) {
		if (selections[j].checked) {
			catid = selections[j].value;
			state = (selections2[j].checked) ? parseInt(selections2[j].value) : (selections3[j].checked) ? parseInt(selections3[j].value) : "";
			asset = new Asset(selections[j].getAttribute("data"), 6, catid, "", state);
			assets.push(asset);
		}
	}
	
	addAssets(assets);
}

function addSiloPromo1() {
	if (currentID <= 0) {
		needPatch();
		return;
	}
	
	var selections = document.getElementsByName("sp1");
	var selections2 = document.getElementsByName("sp1state");
	var asset;
	var assets = [];
	var catid;
	var state;
	for (var j = 0; j < selections.length; j++) {
		if (selections[j].checked) {
			catid = selections[j].value;
			state = (selections2[j].checked) ? parseInt(selections2[j].value) : "";
			asset = new Asset(selections[j].getAttribute("data"), 7, catid, "", state);
			assets.push(asset);
		}
	}
	
	addAssets(assets);
}

function addDrawerTicker() {
	if (currentID <= 0) {
		needPatch();
		return;
	}
	
	var selections = document.getElementsByName("dt");
	var asset;
	var assets = [];
	var catid;
	for (var j = 0; j < selections.length; j++) {
		if (selections[j].checked) {
			catid = selections[j].value;
			asset = new Asset(selections[j].getAttribute("data"), 8, catid);
			assets.push(asset);
		}
	}
	
	addAssets(assets);
}

function addOther() {
	if (currentID <= 0) {
		needPatch();
		return;
	}
	
	var name = form1.othername.value;
	var catid = form1.othercat.value;
	var type;
	var state;
	
	var selections = document.getElementsByName("other");
	for (var j = 0; j < selections.length; j++) {
		if (selections[j].checked) {
			type = parseInt(selections[j].value);
			break;
		}
	}
	
	selections = document.getElementsByName("otherstate")
	for (j = 0; j < selections.length; j++) {
		if (selections[j].checked) {
			state = parseInt(selections[j].value);
		}
	}
	
	if (name == '') {
		alert("Missing graphic header/silo banner/nav aux name.");
		form1.othername.focus();
		return;
	}
	if (catid == '' || catid == "cat") {
		alert("Missing or invalid graphic header/silo banner/nav aux cat ID.");
		form1.othercat.focus();
		return;
	}
	
	var asset = new Asset(name, type, catid, "", state);
	addAssets(asset);
}

function addPopTile(type) {
	if (currentID <= 0) {
		needPatch();
		return;
	}
	
	var name = form1.poptilename.value;
	var folder = form1.poptilefname.value;
	
	if (name == '') {
		alert("Missing popup/promo tile name.");
		form1.popname.focus();
		return;
	}
	if (folder == '' || /\s/.test(folder)) {
		alert("Missing or invalid popup/promo tile folder name.");
		form1.popfname.focus();
		return;
	}
	
	var asset = new Asset(name, type, folder);
	addAssets(asset);
}

function addDash(dashType) {
	var patch;
	var asset;
	var assets = [];
	var after1 = form1.afterdash1.value;
	var after2 = form1.afterdash2.value;
	var date = form1.dashdate.value;
	var datesplit = date.split("/");
	var dash = ["Midday","Twilight"];
	var dashfile = ["MDash", "EveningDash"];
	
	if (after1 == '') {
			alert("Missing after dash promo 4.");
			form1.afterdash1.focus();
			return;
	}
	if (after2 == '') {
			alert("Missing after dash promo 4p1.");
			form1.afterdash2.focus();
			return;
	}
	if (date == '') {
			alert("Missing dash date.");
			form1.dashdate.focus();
			return;
	}
	
	var time = "9am";
	
	preDel++;
	patch = new Patch(dash[dashType] + " Dash (Before)", date, time, (datesplit[0] + "_" + datesplit[1] + "_15_9am_" + dashfile[dashType] + "_Before"), "Natasha");
	patches.push(patch);
	currentID = preDel;
	asset = new Asset(dash[dashType] + " Dash (Before)", 12, "cat21000740");
	addAssets(asset);
	
	if (dashType == 1 && form1.dashextended.checked)
		time = "3:59pm"
	else if (dashType == 1 && !form1.dashextended.checked)
		time = "5:59pm";
	else
		time = "11:29am";
	
	preDel++;
	patch = new Patch(dash[dashType] + " Dash (Start)", date, time, (datesplit[0] + "_" + datesplit[1] + "_15_1129am_" + dashfile[dashType] + "_Start"), "Natasha");
	patches.push(patch);
	currentID = preDel;
	asset = new Asset("Promo 4: "+ dash[dashType] + " Dash", 4, "cat000000/r_promo4", "", 3);
	assets.push(asset);
	asset = new Asset("Promo 4p1: Dash Sign-Up", 4, "cat000000/r_promo4p1", "", 3);
	assets.push(asset);
	asset = new Asset(dash[dashType] + " Dash (Start)", 12, "cat21000740");
	assets.push(asset);
	asset = new Asset(dash[dashType] + " Dash", 9, "MiddayDash/MiddayDash_popup", "", 3);
	assets.push(asset);
	addAssets(assets);
	assets = [];
	
	if (dashType == 1)
		time = "3:59pm"
	else
		time = "8:59pm";
	
	preDel++;
	patch = new Patch(dash[dashType] + " Dash (Over)", date, "1:29pm", (datesplit[0] + "_" + datesplit[1] + "_15_129pm_" + dashfile[dashType] + "_Over"), "Natasha");
	patches.push(patch);
	currentID = preDel;
	asset = new Asset(("Promo 4: " + after1), 4, "cat000000/r_promo4", "", 4);
	assets.push(asset);
	asset = new Asset(("Promo 4p1: " + after2), 4, "cat000000/r_promo4p1", "", 4);
	assets.push(asset);
	asset = new Asset(dash[dashType] + " Dash (Over)", 12, "cat21000740", "", 3);
	assets.push(asset);
	addAssets(assets);
	
	console.log("Current ID: " + currentID);
	console.log(patches);
}

function selectText(containerid) {
	var container = document.getElementById(containerid);
	var range;
	
	if (container.innerHTML == "")
		return;
	
	if (document.body.createTextRange) {
		range = document.body.createTextRange();
		range.moveToElementText(container);
		range.select();
	} else if (window.getSelection) {	
		range = document.createRange();
		range.selectNodeContents(container);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
	}
}

function buildOutput(build) {
	// build = 0 -> build approval
	// build = 1 -> build schedule
	
	if (patches.length < 1) {
		document.getElementById("emailbod").innerHTML = '';
		return;
	}
	
	localStorage.setItem("previous-json", JSON.stringify(patches));
	
	var prehtml ="";
	var html = '<div id="patchlist">';
	var assets = [];
	var href = ['wn.ref1.nmg','www.neimanmarcus.com','wn.test1.nmg'];
	var spacer = '<span style="color: red;">_____________________________________________________________________</span>';
	var temp; // For holding temporary information (usually constructed hrefs)
	
	
	if (build == 0) {
		temp = (form1.approvaltime.value == "") ? "ASAP" : (form1.approvaltime.value + form1.approvalperiod.value);
		temp = "<p>The " + patches[0].date + " (" + patches[0].time + ") Patches are Ready for Approvals by " + temp + " Today</p>";
	}
	else if (build == 1 && today.getDay() == 5)
		temp = "<p>(NMO) This Weekend's Patches Are Ready to Schedule</p>";
	else if (build == 1)
		temp = "<p>(NMO) Tonight's &amp; Tomorrow's Patches Are Ready to Schedule</p>";
	else
		temp = "";
	document.getElementById('emailsub').innerHTML = temp;
	
	
	if (build == 0) {
		prehtml += '<p><strong>The <span style="color: red;">' + patches[0].date + ' (' + patches[0].time + ')</span> Patches are posted online at: <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
			'Please proof it and <span style="color: red;">respond</span> with <span style="color: red;">changes</span> or <span style="color: red;">your approval by ';
		prehtml += (form1.approvaltime.value == "") ? "ASAP</strong></span></p>" : (form1.approvaltime.value + form1.approvalperiod.value + ' Today, ' + months[today.getMonth()] + ' ' + today.getDate() + '</strong></span></p>');
		prehtml += '<p>If you are getting the "category not found page" please do one of the following to check your link:</p>' +
			'<ol><li>Replace the "wnref1" in the url with www.neimanmarcus.com" or</li>' +
			'<li>Do step 1 again and then add "&cacheCheckSeconds=1" at the end of the url</li>' +
			'<li>Or move item from Temp Folder.</li></ol>';
	}
	else {
		prehtml += "Producers,<br />" +
			"(NMO) Tomorrow's Patches Are Ready to Schedule!<br />";
	}
	
	prehtml += spacer + '<p style="color:green;"><strong>On-Call Merchant/Marketing Content Owner:</strong></p>' + '<p style="color: green;">';
	
	for (var i = 0; i < patches.length; i++) {
		assets = patches[i].assets;
		prehtml += patches[i].name + ': ' + patches[i].merchant + '<br />';
		html += '<div patchid="' + patches[i].id + '"' + ((patches[i].id == currentID) ? ' class="selected"' : '') + '>';
		html += spacer + '<p style="color: red;"><strong>' + patches[i].date + ' (' + patches[i].time + ') ' + patches[i].name + '</strong></p>';
		
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
					html += 'Header Promo: ' + assets[j].name + '<br />' +
							'<a href="' + temp + '">' + temp + '</a><br />';
					temp = 'http://' + href[build] + '/category/cat000000/r_mobile_header_promo.html';
					html += 'Mobile Headerpromo: ' + assets[j].name + '<br />' +
							'<a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				case 2:  // Ticker
					if (j == 0) {
						html += '<p><strong>Homepage</strong> <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
							'<span style="color: blue;">Click above to view entire homepage &amp; headerpromo</span><br />';
					}
					
					html += 'Ticker: ' + assets[j].name + '<br />';
					
					break;
					
				case 3:  // Main
					if (j == 0) {
						html += '<p><strong>Homepage</strong> <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
							'<span style="color: blue;">Click above to view entire homepage &amp; headerpromo</span><br />';
					}
					
					if (assets[j].icid != "")
						html += assets[j].name + ' <span style="color: lightseagreen;">icid=' + assets[j].icid + '</span><br />';
					else
						html += assets[j].name + '<br />';
					
					break;
					
				case 4:  // Promo
					if (j == 0) {
						html += '<p><strong>Homepage</strong> <a href="http://' + href[build] + '/index.jsp">http://' + href[build] + '/index.jsp</a><br />' +
							'<span style="color: blue;">Click above to view entire homepage &amp; headerpromo</span><br />';
					}
					
					
					
					if (assets[j].state == 4 && build == 0) {
						temp = 'http://' + href[build + 2] + '/category/' + assets[j].path + '.html';
						html += assets[j].name + ' <a href="' + temp + '">' + temp + '</a><br />';
					}
					else if (assets[j].state == 3 || assets[j].state == 4) {
						temp = 'http://' + href[build] + '/category/' + assets[j].path + '.html';
						html += assets[j].name + ' <a href="' + temp + '">' + temp + '</a><br />';
					}
					
					else if (assets[j].icid != "")
						html += assets[j].name + ' <span style="color: lightseagreen;">icid=' + assets[j].icid + '</span><br />';
					else
						html += assets[j].name + '<br />';
					
					break;
					
				case 5:  // Designer Index
					if (j == 0) {
						html += '<p><strong>Designer Index:</strong><br />';
					}
					else {
						if (assets[j-1].type != 5) {
							html += '</p><p><strong>Designer Index:</strong><br />';
						}
					}
					
					if (assets[j].path == "cat45050736")
						temp = 'http://' + href[build] + '/category/' + assets[j].path + '/r_main_drawer_promo.html';
					else
						temp = 'http://' + href[build] + '/category/' + assets[j].path + '/r_designer_promo.html';
					html += assets[j].name + ': <a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				case 6:  // Silo Main 4
					if (j == 0) {
						html += '<p><strong>Silo Main 4:</strong><br />';
					}
					else {
						if (assets[j-1].type != 6) {
							html += '</p><p><strong>Silo Main 4:</strong><br />';
						}
					}
					
					temp = 'http://' + href[build] + '/category/' + assets[j].path + '/r_main.html';
					if (assets[j].state == 1) // Turn On
						html += assets[j].name + ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a><br />';
					else if (assets[j].state == 2) // Turn Off
						html += assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '<br />';
					else
						html += assets[j].name + ': <a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				case 7:  // Silo Promo 1
					if (j == 0) {
						html += '<p><strong>Silo Promo 1:</strong><br />';
					}
					else {
						if (assets[j-1].type != 7) {
							html += '</p><p><strong>Silo Promo 1:</strong><br />';
						}
					}
					
					temp = 'http://' + href[build] + '/category.jsp?itemId=' + assets[j].path + '&parentId=&siloId=' + assets[j].path;
					if (assets[j].state == 3) // Removed
						html += assets[j].name + ': <span style="color: green;">(Removed)</span> <a href="' + temp + '">' + temp + '</a><br />';
					else
						html += assets[j].name + ': <a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				case 8:  // Drawer Tickers
					if (j == 0) {
						html += '<p><strong>Drawer Tickers:</strong><br />';
					}
					else {
						if (assets[j-1].type != 8) {
							html += '</p><p><strong>Drawer Tickers:</strong><br />';
						}
					}
					
					temp = 'http://' + href[build] + '/category/' + assets[j].path + '/r_main_drawer_promo.html';
					html += assets[j].name + ': <a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				case 9:  // Popups
					if (j == 0) {
						html += '<p><strong>Popups:</strong><br />';
					}
					else {
						if (assets[j-1].type != 9) {
							html += '</p><p><strong>Popups:</strong><br />';
						}
					}
					
					if (assets[j].state == 3)
						temp = 'http://' + href[build] + '/category/popup/' + assets[j].path + '.html';
					else
						temp = 'http://' + href[build] + '/category/popup/' + assets[j].path + '/' + assets[j].path + '.html';
					
					html += assets[j].name + ': <a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				case 10:  // Promo Tiles
					if (j == 0) {
						html += '<p><strong>Promo Tiles:</strong><br />';
					}
					else {
						if (assets[j-1].type != 10) {
							html += '</p><p><strong>Promo Tiles:</strong><br />';
						}
					}
					
					temp = 'http://' + href[build] + '/category/promotiles/' + assets[j].path + '.html';
					html += assets[j].name + ': <a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				case 11:  // Jump Pages (F0)
					if (j == 0) {
						html += '<p><strong>Jump Pages (F0):</strong><br />';
					}
					else {
						if (assets[j-1].type != 11) {
							html += '</p><p><strong>Jump Pages (F0):</strong><br />';
						}
					}
					
					temp = 'http://' + href[build] + '/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += assets[j].name + ': <a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				case 12:  // Graphic Headers
					if (j == 0) {
						html += '<p><strong>Graphic Headers:</strong><br />';
					}
					else {
						if (assets[j-1].type != 12) {
							html += '</p><p><strong>Graphic Headers:</strong><br />';
						}
					}
					
					if (assets[j].state == 3 && build == 0)
						temp = 'http://' + href[build + 2] + '/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					else
						temp = 'http://' + href[build] + '/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					
					if (assets[j].state == 1) // Turn On
						html += assets[j].name + ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a><br />';
					else if (assets[j].state == 2 && build == 0) // Turn Off
						html += assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '<br />';
					else if (assets[j].state == 2 && build == 1) // Turn Off
						html += assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a><br />';
					else
						html += assets[j].name + ': <a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				case 13:  // Silo Banners
					if (j == 0) {
						html += '<p><strong>Silo Banners:</strong><br />';
					}
					else {
						if (assets[j-1].type != 13) {
							html += '</p><p><strong>Silo Banners:</strong><br />';
						}
					}
					
					temp = 'http://' + href[build] + '/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					if (assets[j].state == 1) // Turn On
						html += assets[j].name + ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a><br />';
					else if (assets[j].state == 2 && build == 0) // Turn Off
						html += assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '<br />';
					else if (assets[j].state == 2 && build == 1) // Turn Off
						html += assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a><br />';
					else
						html += assets[j].name + ': <a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				case 14:  // Nav Aux
					if (j == 0) {
						html += '<p><strong>Nav Aux:</strong><br />';
					}
					else {
						if (assets[j-1].type != 14) {
							html += '</p><p><strong>Nav Aux:</strong><br />';
						}
					}
					
					temp = 'http://' + href[build] + '/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					if (assets[j].state == 1) // Turn On
						html += assets[j].name + ': <span style="color: green;">(Turn On)</span> <a href="' + temp + '">' + temp + '</a><br />';
					else if (assets[j].state == 2 && build == 0) // Turn Off
						html += assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + '<br />';
					else if (assets[j].state == 2 && build == 1) // Turn Off
						html += assets[j].name + ': <span style="color: green;">(Turn Off)</span> ' + assets[j].path + ' <a href="' + temp + '">' + temp + '</a><br />';
					else
						html += assets[j].name + ': <a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				case 15:  // Videos
					if (j == 0) {
						html += '<p><strong>Videos:</strong><br />';
					}
					else {
						if (assets[j-1].type != 15) {
							html += '</p><p><strong>Videos:</strong><br />';
						}
					}
					
					temp = 'http://' + href[build] + '/' + assets[j].path + '/c.cat?cacheCheckSeconds=1';
					html += assets[j].name + ': <a href="' + temp + '">' + temp + '</a><br />';
					
					break;
					
				default:
					break;
			}
			
		}
		
		html += '</p></div>';
	}
	
	if (build == 1)
		prehtml += '<span style="color: purple;">Creative: ' + form1.oncall.value + '</span>';
	prehtml += '</p>';
	html += '</div>' + spacer + '<p><strong>What do the colors mean?</strong><br />' +
		'<span style="color: green;">GREEN: Merchant Action</span> | <span style="color: purple;">PURPLE: Creative Contact</span> | <span style="color: orange;">ORANGE: Production Action</span> |<br />' +
		'<span style="color: red;">RED: Patch Description</span> | <span style="color: gray;">GRAY: Mentos Folder Name</span> | <span style="color: magenta;">PINK: Homepage Scrolling icid tag</span> | <span style="color: blue;">BLUE: Category Link</span></p>' + spacer;
	
	document.getElementById("emailbod").innerHTML = prehtml + html;
	
	$("#patchlist").on('mousedown', 'div', function() {
		$(this).addClass("selected").siblings().removeClass('selected');
		currentID = parseInt($(this).attr("patchid"));
		console.log("Current ID: " + currentID);
	}).sortable({
		placeholder: "sortable-placeholder",
		forcePlaceholderSize: true,
		update: patchMove,
		create: function(){
			$(this).height($(this).height());
		}
	}).disableSelection();
}
