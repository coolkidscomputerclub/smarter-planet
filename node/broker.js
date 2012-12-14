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
        id: "saul",
        name: "Saul",
        preferences: {
            temperature: 22
        },
        asleep: true,
        avatar: "img/avatar/saul.jpg",
        presence: false,
        tagId: "0800E3CE07"
    }, {
        id: "florian",
        name: "Florian",
        preferences: {
            temperature: 26
        },
        asleep: false,
        avatar: "img/avatar/flo.jpg",
        presence: false,
        tagId: "0800DE1994"
    }, {
        id: "ben",
        name: "Ben",
        preferences: {
            temperature: 20
        },
        asleep: false,
        avatar: "img/avatar/ben.jpg",
        presence: false,
        tagId: "0800DE1B47"
    }, {
        id: "james",
        name: "James",
        preferences: {
            temperature: 18
        },
        asleep: false,
        avatar: "img/avatar/james.jpg",
        presence: false,
        tagId: "0800E3CA33"
    }];

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/inhabit", function(error, db) {

    if(!error) {

        console.log("Connected to mangodb.");

        database = db;

    } else {

        console.log("Not connected mangodob.");

        return false;

    }

    // create the collection events if it doesn't already exist
    eventCollection = database.collection("events");

    // check if there's any users in the users collection
    eventCollection.find().toArray(function (error, items) {

        if (error === null) {

            events = items;

            // console.log("Events in events collection: ", events);

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

            // console.log("Users in users collection: ", users);

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

    updateState();

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

            userCollection.findOne({tagId: packet.payload}, function (error, item) {

                if (error === null) {

                    var user = item;

                    console.log("Setting " + user.name + "'s presence to: ", !user.presence);

                    userCollection.update({name: user.name}, {$set: {presence: !user.presence}}, {safe: true}, function(error, result) {

                        if (error === null) {

                            userCollection.findOne({name: user.name}, function (error, item) {

                                if (error === null) {

                                    var timestamp = (new Date()).getTime();

                                    user = item;

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

                                    updateState(function () {

                                        if (user.presence === true) {

                                            var asleep = [];

                                            for (var i in usersObj) {

                                                if (usersObj.hasOwnProperty(i)) {

                                                    if (usersObj[i].asleep === true) {

                                                        asleep.push(usersObj[i]);

                                                    }

                                                }

                                            }

                                            if (asleep.length > 0) {

                                                io.sockets.emit("ben", {

                                                    type: "warning",

                                                    users: asleep

                                                });

                                            }

                                        }

                                    });

                                } else {

                                    console.log(error);

                                }

                            });

                        } else {

                            console.log(error);

                        }

                    });

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

var usersObj = {};

function updateState (callback) {

    var userCollection = database.collection('users');

    userCollection.find().toArray(function (error, items) {

        if (error === null) {

            usersObj = {};

            for (var i = 0, j = items.length; i < j; i++) {

                usersObj[items[i].id] = items[i];

            }

            if (typeof callback === 'function') {

                callback();

            }

        } else {

            console.log(error);

        }

    });

}