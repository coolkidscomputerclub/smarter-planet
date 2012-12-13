var main = {

    init: function () {

        console.log("Main initialised.");

        this.connectSocket();

    },

    connectSocket: function () {

        console.log("Socket connected.");

        this.socket = io.connect("//" + config.socketServer + ":8080");
        this.bindSocketEvents();

    },

    bindSocketEvents: function () {

    	var $timeline = $("#events");

        console.log("Socket events bound.");

        // SYSTEM MESSAGES
        this.socket.on("message", function (data) {

            console.log("Message: ", data);

        });

        // USERS
        this.socket.on("users", function (data) {

        	console.log("Users", data);

        	// Compile Handlebars user selector template
			var familySource = $("#family-template").html();
			var familyTemplate = Handlebars.compile(familySource);

			$("#user-select").html(familyTemplate(data));

			window.userSelector = new Swipe(document.getElementById("user-select"));

        });

        // HISTORIC EVENTS
        this.socket.on("events", function (data) {

        	console.log("Events", data);

			var historySource = $("#timeline-history-template").html();
			var historyTemplate = Handlebars.compile(historySource);

			$("#timeline ul").append(historyTemplate(data));

        });

        // NEW EVENTS
        this.socket.on("event", function (data) {

        	console.log("Single event", data);

        	// Presence Events
        	var presenceEventSource = $("#presence-event-template").html();
        	var presenceEventTemplate = Handlebars.compile(presenceEventSource);

        	// Environment Events
        	// Social Events

        	// Push data to relevant template
        	switch(data.type) {

        		case "presence":
        			$("#timeline ul").prepend(presenceEventTemplate(data));
        			break;
        	}

        });

    }

};

$(function(){

	// Initialise and run sockets
	main.init();

});
