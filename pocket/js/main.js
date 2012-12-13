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

        // general system messages
        this.socket.on("message", function (data) {

            console.log("Message: ", data);

        });

        // presence alerts
        this.socket.on("presence", function (data) {

            console.log("Presence: ", data.user.presence);

            console.log("Timestamp", data.time);

            if (data.user.presence) {
            	$timeline.append("<li class='event presence'><p class='message'>" + data.user.name + " just got home</p></li>");
            } else {
            	$timeline.append("<li class='event 	presence'><p class='message'>" + data.user.name + " just went out</p></li>");
            }

        });

    }

};

$(function(){

	main.init();

	var userData = {
		users: [
			{ id: 0, name: "Ben", 	avatarURL: "img/avatar/ben.jpg" 	},
			{ id: 1, name: "James", avatarURL: "img/avatar/james.jpg" 	},
			{ id: 2, name: "Flo", 	avatarURL: "img/avatar/flo.jpg" 	},
			{ id: 3, name: "Saul", 	avatarURL: "img/avatar/saul.jpg" 	}
		]
	};

	// HB: User Selection
	var familySource = $("#family-template").html();
	var familyTemplate = Handlebars.compile(familySource);

	$("#user-select").append(familyTemplate(userData));

	// Set up user selection
	var userSlider = new Swipe(document.getElementById('user-select'), {

		callback: function() {

			var activeUser = "Ben";

			switch(this.getPos()) {

				case 0: activeUser = "Ben"; 	break;
				case 1: activeUser = "James"; 	break;
				case 2: activeUser = "Flo"; 	break;
				case 3: activeUser = "Saul"; 	break;

			}

			console.log("Current User:", activeUser);
		}
	});

});
