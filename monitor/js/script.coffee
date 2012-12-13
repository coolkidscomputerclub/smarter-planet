
class Inhabitant
	constructor: (@id, @name) ->
		@inactiveState = 
			"stroke-width": 4
			stroke: "#ebebeb"

		@activeState =
			"stroke-width": 8
			stroke: "#9ADEB3"


	draw: (context) ->

		@avatar = context.circle(135 + (@id * 250), 95, 75).attr
			fill: "url(images/"+@name+".jpg)"

		if not @home
			@avatar.attr @inactiveState
				
		else
			@avatar.attr @activeState

		@label = context.text(135 + (@id * 250), 192, @name).attr
			"font-family": "Helvetica Neue"
			"font-size": 18
			fill: "#999"

		@status = context.text(135 + (@id * 250), 212, "is out and about").attr
			"font-family": "Helvetica Neue"
			"font-size": 12
			fill: "#648D8E"

	setStatus: (newStatus) ->
		@status.attr
			text: newStatus

	isHome: () ->
		@home

	updatePresence: (isIn) ->
		@home = isIn
		if isIn
			@avatar.animate @activeState, 1000
			@setStatus "just got in"
		else
			@avatar.animate @inactiveState, 1000


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
	housemates[1].updatePresence(true)
