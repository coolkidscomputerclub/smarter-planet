
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
			
		@avatar.click (e) ->

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

	togglePresence: ->
		@home = if @home then false else true
		if @home
			@avatar.animate @activeState, 1000
			@setStatus "just got in"
		else
			@avatar.animate @inactiveState, 1000
			@setStatus "just left"


presenceChange = (id) ->
	housemates[id].togglePresence()


step = ->
	date = new Date();
	hour = date.getHours()
	minutes = date.getMinutes() * (2/3)
	window.nowBar.animate x: 32 + (hour * 40) + minutes, 300 

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
	housemates[1].togglePresence()

	window.nowBar = paper.rect(32, 300, 3, 300).attr
		fill: "#ebebeb"
		"stroke-width": 0
		"fill-opacity": 0.6

	for i in [0..24]
		paper.text(32 + (i * 40), 560, i).attr
			fill: "#648D8E"
			"font-size": 12

	step()

	paper.path("M32 500L352 500L392 420L472 420L672 500L792 500L832 400L952 400L992 500").attr
		"stroke": "#999"
		"stroke-dasharray": "--"

	setInterval step, 60000

