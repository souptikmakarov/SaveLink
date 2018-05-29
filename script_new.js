$(function(){
    // var baseUrl = "http://localhost:3000";
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
        self.isNewNote = ko.observable(false);

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
                        }
                    }
                }else{
                    $(".saved").text("No saved links");
                }
            });
        }

        self.OnlineNotesLoad = function(){
            self.OnlineNotes([]);
            getRequest(baseUrl + "/notes",
            function (data){
                $.each(data, function(i, val){
                    var note = new Note();
                    note.Id(val._id);
                    note.Title(val.Title);
                    note.Link(val.Content.Message);
                    self.OnlineNotes.push(note);
                });
            },
            function(error){
                console.error(error);
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
            var editableNote = new Note()
                                .Id(note.Id())
                                .Title(note.Title())
                                .Link(note.Link());
            self.editNote(editableNote);
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
            if(self.isNewNote()){
                var toInsert = {
                    Title : self.editNote().Title(),
                    Content : {
                        Message : self.editNote().Link()
                    }
                }
                postRequest(baseUrl + "/notes/add", toInsert, 
                    function (data){
                        if(data.hasOwnProperty("success")){
                            self.OnlineNotesLoad();
                            self.isNoteViewEnabled(false);
                            self.editNote(null);
                            self.isNewNote(false);
                        }else{
                            console.log(data.error);
                        }
                    },
                    function(error){
                        console.error(error);
                    },
                    function(){}
                );
            }else{
                var toUpdate = {
                    id : self.editNote().Id(),
                    record : {
                        Title : self.editNote().Title(),
                        Content : {
                            Message : self.editNote().Link()
                        }
                    }
                };
                postRequest(baseUrl + "/notes/edit", toUpdate, 
                    function (data){
                        if(data.hasOwnProperty("success")){
                            self.OnlineNotesLoad();
                            self.isNoteViewEnabled(false);
                            self.editNote(null);
                        }else{
                            console.log(data.error);
                        }
                    },
                    function(error){
                        console.error(error);
                    },
                    function(){}
                );
            }
        }

        self.ShowAllNotes = function(){
            self.isNoteViewEnabled(false);
            self.editNote(null);
        }

        self.deleteOnlineNote = function(){
            console.log(self.rightClickedElem());
            postRequest(baseUrl + "/notes/remove", 
                {
                    id: self.rightClickedElem().Id()
                }, 
                function (data){
                    if(data.hasOwnProperty("success")){
                        self.OnlineNotesLoad();
                        self.rightClickedElem(null);
                    }else{
                        console.log(data.error);
                    }
                },
                function(error){
                    console.error(error);
                },
                function(){}
            );
            $(".right-click-menu").css({
                display: 'none'
            });
        }

        self.NewNote = function(){
            self.editNote(new Note().Id("new").Title("").Link(""));
            self.isNoteViewEnabled(true);
            self.isNewNote(true);
        }
    }

    window.addEventListener('contextmenu', function (e) { // Not compatible with IE < 9
        e.preventDefault();
    }, false);

    myVm = new ScribblePadViewModel();
    ko.applyBindings(myVm);

    myVm.OfflineNotesLoad();
    myVm.OnlineNotesLoad();
    myVm.PopulateCurrentLinkData();
});