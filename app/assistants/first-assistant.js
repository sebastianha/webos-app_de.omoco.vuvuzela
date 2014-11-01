function FirstAssistant() {
}

FirstAssistant.prototype.setup = function() {
	var showProLink = true;
	
	var cookie = new Mojo.Model.Cookie("prefs");
	var prefs = cookie.get();
	if(prefs != null)
	{
		showProLink = prefs.prolink;
	}
	
	if(showProLink) {
	    this.appMenuModel = {
	        visible: true,
	        items: [
	            { label: $L("About"), command: 'About'},
	            { label: $L("Help"), command: 'Help'},
				{ label: $L("Credits"), command: 'Credits'},
				{ label: $L("Donate"), command: 'Donate'},
				{ label: $L("Hide Pro Link"), command: 'HideProLink'},
				{ label: $L("Follow me on Twitter"), command: 'Twitter'},
				{ label: $L("More Apps by omoco"), command: 'MoreApps'}
	        ]
	    };
	} else {
		$('proversion').style.display = "none";
		this.appMenuModel = {
	        visible: true,
	        items: [
	            { label: $L("About"), command: 'About'},
	            { label: $L("Help"), command: 'Help'},
				{ label: $L("Credits"), command: 'Credits'},
				{ label: $L("Donate"), command: 'Donate'},
				{ label: $L("Get Vuvuzela Pro!"), command: 'GetPro'},
				{ label: $L("Follow me on Twitter"), command: 'Twitter'},
				{ label: $L("More Apps by omoco"), command: 'MoreApps'}
	        ]
	    };
	}

	
    this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, this.appMenuModel);

	this.mediaSetup();
	this.isplaying = 0;

    Mojo.Event.listen(this.controller.get('musicbutton'), Mojo.Event.tap, this.playMusic.bind(this));
	
	$('musicbutton').addEventListener('mousedown', this.hold.bind(this));
	$('musicbutton').addEventListener('mouseup', this.holdEnd.bind(this));
	
	this.tap = true;
	this.shake = false;
	
	toggleAttr = {trueLabel: 'Tap', falseLabel: 'Hold'};
	toggleModel = {value: this.tap, disabled: false};
	this.controller.setupWidget('holdtoggle', toggleAttr, toggleModel);
	Mojo.Event.listen(this.controller.get('holdtoggle'),Mojo.Event.propertyChange,this.togglePressed.bind(this));
	
	toggle2Attr = {trueLabel: 'Circle', falseLabel: 'Circle'};
	toggle2Model = {value: this.shake, disabled: false};
	this.controller.setupWidget('shaketoggle', toggle2Attr, toggle2Model);
	Mojo.Event.listen(this.controller.get('shaketoggle'),Mojo.Event.propertyChange,this.toggle2Pressed.bind(this));
	
	Mojo.Event.listen(document, 'acceleration', this.handleAccel.bind(this));
	
	this.controller.listen("proversion", Mojo.Event.tap, this.proClicked.bind(this));
};

FirstAssistant.prototype.proClicked = function(event){
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: "com.palm.app.findapps",
			params: {
				target: "http://developer.palm.com/webChannel/index.php?packageid=de.omoco.vuvuzela.pro"
			}
		}
	});
}

FirstAssistant.prototype.handleAccel = function(event){
	//$('musicbutton').innerText = event.accelY;
	if (this.shake) {
		if (event.accelX > 1.0 || event.accelY > 1.0 || event.accelZ > 1.0 || event.accelX < -1.0 || event.accelY < -1.0 || event.accelZ < -1.0) {
			this.myAudioMedia.play();
			$('musicbutton').style.backgroundImage = "url('images/vuvuzela2.gif')";
		}
		else {
			this.myAudioMedia.load();
			$('musicbutton').style.backgroundImage = "url('images/vuvuzela.png')";
		}
	}
}

FirstAssistant.prototype.togglePressed = function(event){
	this.shake = false;
	toggle2Model.value = this.shake;
	this.controller.modelChanged(toggle2Model);
	
	this.tap = toggleModel.value;
	if(this.tap)
		$('hint').innerHTML = "<b>Tap</b> the Vuvuzela to play";
	else
		$('hint').innerHTML = "<b>Hold</b> the Vuvuzela to play";
}

FirstAssistant.prototype.toggle2Pressed = function(event){
	this.shake = toggle2Model.value;
	if (this.shake) 
		$('hint').innerHTML = "<b>Circle</b> your phone over your head to play";
	else {
		if (this.tap) 
			$('hint').innerHTML = "<b>Tap</b> the Vuvuzela to play";
		else 
			$('hint').innerHTML = "<b>Hold</b> the Vuvuzela to play";
		
		this.myAudioMedia.load();
		$('musicbutton').style.backgroundImage = "url('images/vuvuzela.png')";
	}
}

FirstAssistant.prototype.mediaSetup = function() {
	this.libs = MojoLoader.require({ name: "mediaextension", version: "1.0"});

	this.myAudioMedia = this.controller.get('audio-media');

	this.audioExtMedia = this.libs.mediaextension.MediaExtension.getInstance(this.myAudioMedia);
	this.myAudioMedia.src = Mojo.appPath + "audio/vuvuz.mp3";
	this.myAudioMedia.load();
}

FirstAssistant.prototype.playMusic = function() {
	if (this.tap && !this.shake) {
		if (this.isplaying == 1) {
			this.isplaying = 0;
			this.myAudioMedia.load();
			$('musicbutton').style.backgroundImage = "url('images/vuvuzela.png')";
		}
		else {
			this.isplaying = 1;
			this.myAudioMedia.play();
			$('musicbutton').style.backgroundImage = "url('images/vuvuzela2.gif')";
		}
	}
	/*this.isplaying = 1;
	this.myAudioMedia.play();*/
};

FirstAssistant.prototype.hold = function() {
	if (!this.tap && !this.shake) {
		this.myAudioMedia.play();
		$('musicbutton').style.backgroundImage = "url('images/vuvuzela2.gif')";
	}
};

FirstAssistant.prototype.holdEnd = function() {
	if (!this.tap && !this.shake) {
		this.myAudioMedia.load();
		$('musicbutton').style.backgroundImage = "url('images/vuvuzela.png')";
	}
};

FirstAssistant.prototype.activate = function(event) {
	//Mojo.Controller.stageController.setWindowProperties({ fastAccelerometer: true });
	Mojo.Controller.stageController.setWindowProperties({ blockScreenTimeout: true });
};

FirstAssistant.prototype.deactivate = function(event) {
};

FirstAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening(this.controller.get('musicbutton'), Mojo.Event.hold, this.playMusic);
};

FirstAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'About':
                    this.controller.showAlertDialog({
                        onChoose: function(value) {},
                        title:"About",
                        message:'<div style="text-align:center;"><h1>Vuvuzela 2.2.0</h1>\
                        A program brought to you by\
                        <br>Sebastian Hammerl\
                        <br>Ulf Groẞekathöfer\
                        <br><br><a href="mailto:vuvuzela@omoco.de">vuvuzela@omoco.de</a><br>\
                        <a href="http://vuvuzela.omoco.de">http://vuvuzela.omoco.de</a></div>',
                    allowHTMLMessage: true,
                    choices:[ {label:'OK', value:'OK', type:'color'} ]
                });
                break;
            case 'Help':
                this.controller.showAlertDialog({
                    onChoose: function(value) {},
                    title:"Help",
                    message:'At first make sure that you have turned up the volume to maximum.<br><br>There are three ways to blow the vuvuzela:<br>1) Tap it to start / stop.<br>2) Hold it to play.<br>3) Circle it over your head to play.<br><br>Now have fun and make noise!',
                    allowHTMLMessage: true,
                    choices:[ {label:'OK', value:'OK', type:'color'} ]
                });
                break;
            case 'Credits':
                this.controller.showAlertDialog({
                    onChoose: function(value) {},
                    title:"Credits",
                    message:'Image by:<br><a href="http://de.wikipedia.org/w/index.php?title=Datei:Vuvuzela_red.jpg&filetimestamp=20090621184943">Berndt Meyer</a><br><br>Sound by:<br><a href="http://www.jahrgangsgeraeusche.de/2010-06-12/vuvuzela/">http://www.jahrgangsgeraeusche.de</a>',
                    allowHTMLMessage: true,
                    choices:[ {label:'OK', value:'OK', type:'color'} ]
                });
                break;
            case 'Donate':
                this.controller.showAlertDialog({
                    onChoose: function(value) {},
                    title:"Donate",
                    message:'If you like this app click here to donate:<br><br><center><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TEUPLVZ5UBWNQ"><img width="138" height="39" src="images/btn_donate_LG.gif"></a></center>',
                    allowHTMLMessage: true,
                    choices:[ {label:'OK', value:'OK', type:'color'} ]
                });
                break;
            case 'Twitter':
                this.controller.serviceRequest("palm://com.palm.applicationManager", {
					   method: "open",
					   parameters:  {
					       id: 'com.palm.app.browser',
					       params: {
					           target: "http://twitter.com/omocopalm"
					       }
					   }
					 });
                break;
            case 'MoreApps':
                this.controller.serviceRequest("palm://com.palm.applicationManager", {
					   method: "open",
					   parameters:  {
					       id: 'com.palm.app.browser',
					       params: {
					           target: "http://omoco.de"
					       }
					   }
					 });
                break;
            case 'HideProLink':
				var cookie = new Mojo.Model.Cookie("prefs");
				cookie.put({
					prolink: false
				});   
				$('proversion').style.display = "none"; 
				this.controller.showAlertDialog({
                    onChoose: function(value) {},
                    title:"Pro Link Hidden",
                    message:'The Pro version link will no longer be visible. If you want to get the pro version later you will find the link at the menu. If you like this app please buy the Pro version to support me.',
                    allowHTMLMessage: true,
                    choices:[ {label:'OK', value:'OK', type:'color'} ]
                });            
				break;
			case 'GetPro':
				this.proClicked();
				break;
        }
    }
}; 
