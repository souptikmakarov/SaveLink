var title="",url="";
chrome.tabs.query({"active":true,"currentWindow": true},function (array_of_Tabs) {
	title = array_of_Tabs[0].title;
	url = array_of_Tabs[0].url;
	if (title != "New Tab") {
		chrome.storage.local.get(null,function(obj){
			var len = Object.keys(obj).length;
			if (len != 0) {
				for(var k in obj){
					if (obj.hasOwnProperty(k)) {
					    if (obj[k]["title"] == title) {
							$(".confirm").css({
								display: 'none'
							});
							$(".done").css({
								display: 'block'
							});
							$(".currentLink").css({
								background: '#4caf50'
							});
						}
						$(".saved").append("<div class='link' id="+ k +"><p class='title'>"+ obj[k]["title"] +"</p><p class='url'>"+ obj[k]["url"] +"</p></div>");
					}
				}
			}else{
				// $(".saved").append("<div class='link'><p class='title'>No Links Saved</p></div>");
				$(".saved").text("No saved links");
			}
		});
	}else{
		$(".currentLink").css({
			display: 'none'
		});
		chrome.storage.local.get(null,function(obj){
			var len = Object.keys(obj).length;
			if (len != 0) {
				for(var k in obj){
					if (obj.hasOwnProperty(k)) {
					    $(".saved").append("<div class='link' id="+ k +"><p class='title'>"+ obj[k]["title"] +"</p><p class='url'>"+ obj[k]["url"] +"</p></div>");
					}
				}
			}else{
				$(".saved").text("No saved links");
			}
		});
	}
	$("#title").text(title);
});

$('#yes-btn').on('click', function(event) {
	chrome.storage.local.get(null,function(obj){
		var timeStamp = Math.floor(Date.now() / 1000);
		var storeObj={};
		storeObj[timeStamp]={"title":title,"url":url};
		chrome.storage.local.set(storeObj,function(){
			chrome.storage.local.get(null,function(obj){
				$(".confirm").css({
					display: 'none'
				});
				$(".done").css({
					display: 'block'
				});
				$(".currentLink").css({
					background: '#4caf50'
				});
				location.reload();
			});
		});
	});
});


$(".saved").on('click', '.link', function(event) {
	var link = $(this)[0].children[1].innerHTML;
	chrome.tabs.create({'url': link});
});

var rightClickedElem;

$(".saved").on('mousedown', '.link', function(event) {
	if(event.which == 3){
		var x = event.pageY;
		var y = event.pageX;
		rightClickedElem = $(this)[0]["id"];
        $(".right-click-menu").css({
        	display: 'block',
        	top: x,
        	left: y
        });
    }
});

window.addEventListener('contextmenu', function (e) { // Not compatible with IE < 9
    e.preventDefault();
}, false);

$(".right-click-menu").on('click', function(event) {
	chrome.storage.local.remove(rightClickedElem);
	$('#'+rightClickedElem).css({
		display: 'none'
	});
	$(".right-click-menu").css({
    	display: 'none'
    });
    location.reload();
});
