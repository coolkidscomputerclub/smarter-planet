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

        console.log("Socket events bound.");

        var $timeline = $("#events");

        function parseDates (timestamp) {

	    	// Parse event date
	    	var date = new Date(timestamp);

	    	var evtYear 	= date.getFullYear();
	    	var evtMonth 	= date.getMonth() + 1;
	    	var evtDate 	= date.getDate();
	    	var evtHours 	= date.getHours();
	    	var evtMins 	= date.getMinutes();
	    	var evtSecs 	= date.getSeconds();

	    	function addZero(date) {
	    		(String(date).length < 2) ? date = String("0" + date) :  date = String(date);
	    		return date
	    	}

	    	var formattedTimestamp = "";
	    		formattedTimestamp += evtYear;
	    		formattedTimestamp += addZero(evtMonth);
	    		formattedTimestamp += addZero(evtDate);
	    		formattedTimestamp += addZero(evtHours);
	    		formattedTimestamp += addZero(evtMins);
	    		formattedTimestamp += addZero(evtSecs);

	    	var relativeTime = moment(formattedTimestamp, "YYYYMMDDhhmmss").fromNow();

	    	return relativeTime;

    	}

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

			window.userSelector = new Swipe(document.getElementById("user-select"), {

				startSlide: 2,

				callback: function() {

					console.log(this.getPos());

				}

			});

        });

        // HISTORIC EVENTS
        this.socket.on("events", function (data) {

        	console.log("Events", data);

			var historySource = $("#timeline-history-template").html();
			var historyTemplate = Handlebars.compile(historySource);

			// Flip event history
			function flipHistory(a,b) {
				return (b.timestamp - a.timestamp);
			}

			console.log(data.events.sort(flipHistory));

			// Get timestamps for each event
			for (var i = 0; i < data.events.length; i++) {

				data.events[i].timeago = parseDates(data.events[i].timestamp);

			}

			// Add historic events to timeline
			$("#timeline ul").append(historyTemplate(data));

        });

        // NEW EVENTS
        this.socket.on("event", function (data) {

        	console.log("Single event", data);

        	// Presence Events
        	var presenceEventSource = $("#presence-event-template").html();
        	var presenceEventTemplate = Handlebars.compile(presenceEventSource);

        	// Environment Events
        	var environmentEventSource= $("#environment-event-template").html();
        	var environmentEventTemplate = Handlebars.compile(environmentEventSource);

        	// Social Events
        	var socialEventSource = $("#social-event-template").html();
        	var socialEventTemplate = Handlebars.compile(socialEventSource);

        	var $timeline = $("#timeline ul");

        	data.timeago = parseDates(data.timestamp);

        	// Push data to relevant template
        	switch(data.type) {

        		case "presence":
        			$timeline.prepend(presenceEventTemplate(data));
        			break;

        		case "environment":
        			$timeline.prepend(environmentEventTemplate(data));
        			break;

        		case "social":
        			$timeline.prepend(socialEventTemplate(data));
        			break;
        	}

        	// Update avatar presence indicator
        	var $assocUser = $("." + data.user.id);

   			if ($assocUser.hasClass("absent")) {

   				$assocUser.removeClass("absent").addClass("present");

   			} else if ($assocUser.hasClass("present")) {

   				$assocUser.removeClass("present").addClass("absent");

   			}

        });

    }

};

$(function(){

	// Initialise and run sockets
	main.init();

});
