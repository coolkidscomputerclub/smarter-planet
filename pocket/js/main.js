$(function(){

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
