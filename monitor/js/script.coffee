
class Inhabitant
	constructor: (@index, @id, @name) ->
		@inactiveState = 
			"stroke-width": 4
			stroke: "#ebebeb"

		@activeState =
			"stroke-width": 8
			stroke: "#9ADEB3"


	draw: (context) ->
		@avatar = context.circle(135 + (@index * 250), 95, 75).attr
			fill: "url(images/"+@id+".jpg)"
			
		@avatar.click (e) ->

		if not @home
			@avatar.attr @inactiveState
		else
			@avatar.attr @activeState

		@label = context.text(135 + (@index * 250), 192, @name).attr
			"font-family": "Helvetica Neue"
			"font-size": 18
			fill: "#999"

		@status = context.text(135 + (@index * 250), 212, "is out and about").attr
			"font-family": "Helvetica Neue"
			"font-size": 12
			fill: "#648D8E"

	setStatus: (newStatus) ->
		@status.attr
			text: newStatus

	isHome: () ->
		@home

	setPresence: (status) ->
		@home = status
		if @home
			@avatar.animate @activeState, 1000
			@setStatus "just got in"
		else
			@avatar.animate @inactiveState, 1000
			@setStatus "just left"

	togglePresence: ->
		@home = if @home then false else true
		if @home
			@avatar.animate @activeState, 1000
			@setStatus "just got in"
		else
			@avatar.animate @inactiveState, 1000
			@setStatus "just left"

step = ->
	date = new Date();
	hour = date.getHours()
	minutes = date.getMinutes() * (2/3)
	window.nowBar.animate x: 32 + (hour * 40) + minutes, 300 

main =
	init: ->
		@connectSocket()

	connectSocket: ->
		@socket = io.connect("//" + config.socketServer + ":8080")
		@bindSocketEvents()

	bindSocketEvents: ->
		@socket.on "events", (data) ->
			# console.log data

		@socket.on "users", (data) ->
			for user in data.users
				housemates[user.id].setPresence(user.presence)

		@socket.on "event", (data) ->
			switch data.type
				when "presence" then \
					# console.log data.user.name + "'s presence changed: " + data.user.presence
					housemates[data.user.id].togglePresence()

config = 
	socketServer: '192.168.0.2'

housemates = 
	saul:    new Inhabitant(0, "saul", "Saul"),
	ben:     new Inhabitant(1, "ben", "Ben"), 
	james:   new Inhabitant(2, "james", "James"),
	florian: new Inhabitant(3, "florian", "Florian")

$ ->

	# prevent elastic scrolling
	$(document).bind 'touchmove', (event) ->
		event.preventDefault()

	paper = Raphael("mainCanvas", 1024, 768)

	for id, mate of housemates
		mate.draw(paper)
		
	window.nowBar = paper.rect(32, 300, 3, 300).attr
		fill: "#ebebeb"
		"stroke-width": 0
		"fill-opacity": 0.6

	for i in [0..24]
		paper.text(32 + (i * 40), 560, i).attr
			fill: "#648D8E"
			"font-size": 12

	step()

	paper.path("M32 500L352 500L352 420L472 420L472 500L792 500L792 400L952 400L952 500L992 500").attr
		"stroke": "#999"
		"stroke-dasharray": "--"

	setInterval step, 60000

	main.init()

