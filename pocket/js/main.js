$(function(){

	// Set up user-select slider
	window.userSlider = new Swipe(document.getElementById('user-select'), {
		callback: function() {
			console.log("Current user ID: ", this.getPos());
		}
	});

	var userData = {
		users: [
			{ id: 0, name: "Ben", 	avatarURL: "img/avatar/ben.jpg" 	},
			{ id: 1, name: "James", avatarURL: "img/avatar/james.jpg" 	},
			{ id: 2, name: "Flo", 	avatarURL: "img/avatar/flo.jpg" 	},
			{ id: 3, name: "Saul", 	avatarURL: "img/avatar/saul.jpg" 	}
		]
	};

	// Family member templating
	var familySource = $("#family-template").html();
	var familyTemplate = Handlebars.compile(familySource);

	$("#family").append(familyTemplate(userData));

});
