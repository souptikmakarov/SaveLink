$(function(){
    var baseUrl = "https://noteappdbserver.herokuapp.com";
    function Note(){
        var self = this;
        self.Id = ko.observable();
        self.Title = ko.observable();
        self.Link = ko.observable();
    }
    var ScribblePadViewModel = function(){
        var self = this;
        self.OfflineNotes = ko.observableArray([]);
        self.OnlineNotes = ko.observableArray([]);
        self.currTabTitle = ko.observable();
        self.currTabUrl = ko.observable();
        self.rightClickedElem = ko.observable();
        self.isNoteViewEnabled = ko.observable(false);
        self.editNote = ko.observable(new Note().Id("xxx").Link("link").Title("title"));

        self.OfflineNotesLoad =  function(){
            self.OfflineNotes([]);
            chrome.storage.local.get(null,function(obj){
                var len = Object.keys(obj).length;
                if (len != 0) {
                    for(var k in obj){
                        if (obj.hasOwnProperty(k)) {
                            var note = new Note();
                            note.Id(k);
                            note.Title(obj[k]["title"]);
                            note.Link(obj[k]["url"]);
                            self.OfflineNotes.push(note);
                            // $(".saved").append("<div class='link' id="+ k +"><p class='title'>"+ obj[k]["title"] +"</p><p class='url'>"+ obj[k]["url"] +"</p></div>");
                        }
                    }
                    // console.log(self.OfflineNotes());
                }else{
                    $(".saved").text("No saved links");
                }
            });
        }

        self.OnlineNotesLoad = function(){
            self.OnlineNotes([]);
            serverCall(baseUrl + "/notes", "GET", null, 
            function (data){
                // console.log(data);
                $.each(data, function(i, val){
                    var note = new Note();
                    note.Id(val._id);
                    note.Title(val.Title);
                    note.Link(val.Content.Message);
                    self.OnlineNotes.push(note);
                });
            },
            function(error){
                console.error(data);
            },
            function(){});
        }

        self.storeLink = function(){
            console.log(self.currTabTitle());            
            chrome.storage.local.get(null,function(obj){
                var timeStamp = Math.floor(Date.now() / 1000);
                var storeObj={};
                storeObj[timeStamp]={"title":self.currTabTitle(),"url":self.currTabUrl()};
                chrome.storage.local.set(storeObj,function(){
                    self.OfflineNotesLoad();
                    $(".confirm").css({
                        display: 'none'
                    });
                    $(".done").css({
                        display: 'block'
                    });
                    $(".currentLink").css({
                        background: '#4caf50'
                    });
                });
            });
        }
        self.clickOnlineNote = function(note){
            self.editNote(note);
            self.isNoteViewEnabled(true);
        }
        self.clickOfflineNote = function(note){
            chrome.tabs.create({'url': note.Link()});
        }

        self.PopulateCurrentLinkData = function(){
            chrome.tabs.query({"active":true,"currentWindow": true},function (array_of_Tabs) {
                self.currTabTitle(array_of_Tabs[0].title);
                self.currTabUrl(array_of_Tabs[0].url);
                if (self.currTabTitle() != "New Tab") {
                    $.each(self.OfflineNotes(),function(i, val){
                        if (val.Title() == self.currTabTitle()) {
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
                    });
                }else{
                    $(".currentLink").css({
                        display: 'none'
                    });
                }
            });
        }

        self.showOptions = function(note){
            // console.log(note);
            var x = event.pageY;
            var y = event.pageX;
            self.rightClickedElem(note);
            $(".right-click-menu").css({
                display: 'block',
                top: x,
                left: y
            });
        }
        
        self.deleteNote = function(){
            chrome.storage.local.remove(self.rightClickedElem().Id());
            self.OfflineNotes.remove(self.rightClickedElem());
            $(".right-click-menu").css({
                display: 'none'
            });
        }

        self.SaveNote = function(){
            serverCall(baseUrl + "/notes/edit", "POST", 
                {
                    "id": self.editNote().Id(), 
                    "record": {
                        Title:self.editNote().Title(),
                        Content:{
                            Message:self.editNote().Link()
                        }
                    }
                }, 
                function (data){
                    console.log(data);
                },
                function(error){
                    console.error(data);
                },
                function(){
                    self.OnlineNotesLoad();
                    self.isNoteViewEnabled(false);
                    self.editNote(null);
                }
            );
            console.log(self.editNote());
        }

        self.ShowAllNotes = function(){
            self.isNoteViewEnabled(false);
            self.editNote(null);
        }

        self.deleteOnlineNote = function(note){
            console.log(note());
        }
    }

    window.addEventListener('contextmenu', function (e) { // Not compatible with IE < 9
        e.preventDefault();
    }, false);

    myVm = new ScribblePadViewModel();
    // ko.bindingProvider.instance = new ko.secureBindingsProvider();
    ko.applyBindings(myVm);

    myVm.OfflineNotesLoad();
    myVm.OnlineNotesLoad();
    myVm.PopulateCurrentLinkData();
});