var MongoClient = require("mongodb").MongoClient,
    mqtt = require("mqttjs"),
    port = 1883,
    host = "127.0.0.1",
    topic = "presence",
    mqttServer,
    mqttClient,
    io = require("socket.io").listen(8080, {log: false});

var database,
    eventCollection,
    events,
    userCollection,
    users,
    reset = false,
    _users = [{
        name: "Saul",
        preferences: {
            temperature: 22
        },
        avatar: "img/avatar/saul.jpg",
        presence: false,
        id: "0800E3CE07"
    }, {
        name: "Florian",
        preferences: {
            temperature: 26
        },
        avatar: "img/avatar/flo.jpg",
        presence: false,
        id: "0800DE1994"
    }, {
        name: "Ben",
        preferences: {
            temperature: 20
        },
        avatar: "img/avatar/ben.jpg",
        presence: false,
        id: "0800DE1B47"
    }, {
        name: "James",
        preferences: {
            temperature: 18
        },
        avatar: "img/avatar/james.jpg",
        presence: false,
        id: "0800E3CA33"
    }],
    _events = [{
        type: 'presence',
        user: {
            name: "Saul",
            preferences: {
                temperature: 22
            },
            avatar: "img/avatar/saul.jpg",
            presence: true,
            id: "0800E3CE07"
        },
        timestamp: new Date()
    }, {
        type: 'presence',
        user: {
            name: "Saul",
            preferences: {
                temperature: 22
            },
            avatar: "img/avatar/saul.jpg",
            presence: false,
            id: "0800E3CE07"
        },
        timestamp: new Date()
    }, {
        type: 'presence',
        user: {
            name: "Ben",
            preferences: {
                temperature: 20
            },
            avatar: "img/avatar/ben.jpg",
            presence: false,
            id: "0800DE1B47"
        },
        timestamp: new Date()
    }, {
        type: 'presence',
        user: {
            name: "Ben",
            preferences: {
                temperature: 20
            },
            avatar: "img/avatar/ben.jpg",
            presence: true,
            id: "0800DE1B47"
        },
        timestamp: new Date()
    }];

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/inhabit", function(error, db) {

    if(!error) {

        console.log("Connected.");

        database = db;

    } else {

        console.log("Not connected.");

        return false;

    }

    // create the collection events if it doesn't already exist
    eventCollection = database.collection("events");

    // check if there's any users in the users collection
    eventCollection.find().toArray(function (error, items) {

        if (error === null) {

            events = items;

            console.log("Events in events collection: ", events);

            // if users collection is empty, populate it
            if (reset === true) {

                // remove all users from users collection
                eventCollection.remove(function (error, result) {

                    if (error === null) {

                        console.log("Events collection emptied: ", result);

                    } else {

                        console.log(error);

                    }

                });

            } else if (events.length < 1) {

                // insert users into the users collection
                eventCollection.insert(_events, {safe: true}, function(error, result) {

                    if (error === null) {

                        console.log("Events added to collection: ", result);

                    } else {

                        console.log("Events not added to collection: ", error);

                    }

                });

            }

        } else {

            console.log(error);

        }

    });

    // create the collection users if it doesn't already exist
    userCollection = database.collection("users");

    // check if there's any users in the users collection
    userCollection.find().toArray(function (error, items) {

        if (error === null) {

            users = items;

            console.log("Users in users collection: ", users);

            // if users collection is empty, populate it
            if (users.length === 0 || reset === true) {

                // remove all users from users collection
                userCollection.remove(function (error, result) {

                    if (error === null) {

                        console.log("Users collection emptied: ", result);

                    } else {

                        console.log(error);

                    }

                });

                // insert users into the users collection
                userCollection.insert(_users, {safe: true}, function(error, result) {

                    if (error === null) {

                        console.log("Users added to collection: ", result);

                    } else {

                        console.log("Users not added to collection: ", error);

                    }

                });

                // query users collection for all entries
                userCollection.find().toArray(function (error, items) {

                    if (error === null) {

                        users = items;

                        console.log("Getting users in users collection, post addition: ", items);

                    } else {

                        console.log(error);

                    }

                });

            }

        } else {

            console.log(error);

        }

    });

});

mqttServer = mqtt.createServer(function (client) {

    var self = this;

    if (!self.clients) {

        self.clients = {};

    }

    client.on("connect", function (packet) {

        client.connack({

            returnCode: 0

        });

        client.id = packet.client;

        self.clients[client.id] = client;

        console.log("Client joined: ", client.id);

    });

    client.on("publish", function (packet) {

        // publish message to all clients
        for (var k in self.clients) {

            // prevent messages from being sent to the originator
            if (k !== client.id) {

                self.clients[k].publish({

                    topic: packet.topic,

                    payload: packet.payload

                });

            }

        }

    });

    client.on("subscribe", function (packet) {

        var granted = [];

        for (var i = 0; i < packet.subscriptions.length; i++) {

            granted.push(packet.subscriptions[i].qos);

        }

        client.suback({granted: granted});

        console.log("Subscribe received: ", packet);

    });

    client.on("pingreq", function (packet) {

        client.pingresp();

    });

    client.on("disconnect", function (packet) {

        client.stream.end();

    });

    client.on("close", function (or) {

        delete self.clients[client.id];

    });

    client.on("error", function (error) {

        client.stream.end();

        util.log("error!");

    });

}).listen(port);

mqttClient = mqtt.createClient(port, host, function (error, client) {

    // connect to the MQTT server running at host on port, tell it we"re "nodeClient"
    client.connect({

        client: "nodeClient"

    });

    client.on("connack", function (packet) {

        if (packet.returnCode === 0) {

            // connected

        } else {

            console.log("connack error %d", packet.returnCode);

            process.exit(-1);

        }

    });

    client.on("publish", function (packet) {

        console.log("Payload received: ", packet.topic, packet.payload);

        if (packet.topic === topic) {

            userCollection.find({id: packet.payload}).toArray(function (error, items) {

                if (error === null) {

                    if (items.length > 0) {

                        var user = items[0];

                        console.log("Setting " + user.name + "'s presence to: ", !user.presence);

                        userCollection.update({name: user.name}, {$set: {presence: !user.presence}}, {safe: true}, function(error, result) {

                            if (error === null) {

                                userCollection.find({name: user.name}).toArray(function (error, items) {

                                    if (error === null) {

                                        if (items.length > 0) {

                                            var timestamp = new Date();

                                            user = items[0];

                                            // register the presence event
                                            eventCollection.insert({

                                                type: "presence",

                                                user: user,

                                                timestamp: timestamp

                                            }, {safe: true}, function (error, result) {

                                                if (error === null) {

                                                    console.log("Event logged: ", result);

                                                } else {

                                                    console.log(error);

                                                }

                                            });

                                            // tell connected clients that an event has occurred
                                            io.sockets.emit("event", {

                                                type: "presence",

                                                user: user,

                                                timestamp: timestamp

                                            });

                                            // tell connected clients that a users presence has changed
                                            io.sockets.emit("presence", {

                                                user: user,

                                                timestamp: timestamp

                                            });

                                        }

                                    } else {

                                        console.log(error);

                                    }

                                });

                            } else {

                                console.log(error);

                            }

                        });

                    }

                } else {

                    console.log(error);

                }

            });

        }

    });

    client.on("close", function () {

        process.exit(0);

    });

    client.on("error", function (e) {

        console.log("error %s", e);

        process.exit(-1);

    });

});

io.sockets.on("connection", function (socket) {

    var eventCollection = database.collection("events"),
        events,
        userCollection = database.collection('users'),
        users;

    // check if there's any users in the users collection
    eventCollection.find().toArray(function (error, items) {

        if (error === null) {

            events = items;

            socket.emit("events", {

                events: events

            });

        } else {

            console.log(error);

        }

    });

    // query users collection for all entries
    userCollection.find().toArray(function (error, items) {

        if (error === null) {

            users = items;

            socket.emit("users", {

                users: users

            });

        } else {

            console.log(error);

        }

    });

    // on joining, send a welcome message
    socket.emit("message", {

        message: "Congrats, your penis fits in the socket!"

    });

});