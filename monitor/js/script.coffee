
class Inhabitant
	constructor: (@id, @name) ->

	draw: (context) ->
		context.circle(135 + (@id * 250), 95, 75).attr
			fill: "url(images/"+@name+".jpg)"

$ ->

	# prevent elastic scrolling
	$(document).bind 'touchmove', (event) ->
		event.preventDefault()

	paper = Raphael("mainCanvas", 1024, 768)

	housemates = [
		new Inhabitant(0,"Saul"),
		new Inhabitant(1,"Ben"), 
		new Inhabitant(2,"James"),
		new Inhabitant(3,"Flo")
	]

	mate.draw(paper) for mate in housemates 