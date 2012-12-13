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

        // PRESENCE
        this.socket.on("presence", function (data) {

            console.log("Presence: ", data.user.presence);

            // Compile Handebars timeline template
			var timelineSource = $("#presence-event-template").html();
			var timelineTemplate = Handlebars.compile(timelineSource);

			// Append timeline with new presence events
			$("#timeline ul").append(timelineTemplate(data));

        });

        this.socket.on("users", function (data) {

        	console.log("Users", data);

        	// Compile Handlebars user selector template
			var familySource = $("#family-template").html();
			var familyTemplate = Handlebars.compile(familySource);

			$("#user-select").html(familyTemplate(data));

			window.userSelector = new Swipe(document.getElementById("user-select"));

        });



    }

};

$(function(){

	// Initialise and run sockets
	main.init();

});
