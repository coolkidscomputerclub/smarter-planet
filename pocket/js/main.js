$(function(){

	var index = 0;

	// Make first slice active
	$(".user-select li:first").addClass('active');

	// User select slide event
	$(".user-select").bind('slide', function() {

		// Remove active class
		$(".user-select li.active").removeClass('active');

		if (index < 3) {
			index++;
		} else {
			index--;
		}

		$(".user-select li:eq(" +  index + ")").addClass('active');

		console.log("User changed", index);

	});

});
