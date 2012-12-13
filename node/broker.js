var MongoClient = require("mongodb").MongoClient,
    mqtt = require("mqttjs"),
    port = 1883,
    host = "127.0.0.1",
    topic = "presence",
    mqttServer,
    mqttClient,
    io = require("socket.io").listen(8080);

var userCollection,
    users,
    reset = false,
    _users = [{
        name: "Saul",
        presence: false,
        id: "0800E3CE07"
    }, {
        name: "Florian",
        presence: false,
        id: "0800DE1994"
    }, {
        name: "Ben",
        presence: false,
        id: "0800DE1B47"
    }, {
        name: "James",
        presence: false,
        id: "0800E3CA33"
    }];

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/inhabit", function(error, db) {

    if(!error) {

        console.log("Connected.");

    } else {

        console.log("Not connected.");

        return false;

    }

    // create the collection users if it doesn't already exist
    userCollection = db.collection('users');

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
                userCollection.insert(users, {safe: true}, function(error, result) {

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

        console.log("Client joined: ", packet);

        if (client.id !== "nodeClient") {

            mqttClient.publish({

                topic: topic,

                payload: "Hi, Arduino!"

            });

        }

    });

    client.on("publish", function (packet) {

        // publish message to all clients
        for (var k in self.clients) {

            // prevent messages from being sent to the originator
            // if (k !== client.id) {

                self.clients[k].publish({

                    topic: packet.topic,

                    payload: packet.payload

                });

            // }

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

    client.on("close", function (err) {

        delete self.clients[client.id];

    });

    client.on("error", function (err) {

        client.stream.end();

        util.log("error!");

    });

}).listen(port);

mqttClient = mqtt.createClient(port, host, function (err, client) {

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

                    console.log("Find items with id of payload: ", items);

                    if (items.length > 0) {

                        var user = items[0];

                        user.presence = !user.presence;

                        userCollection.update({name: user.name}, {$set: {presence: user.presence}}, {safe: true}, function(error, result) {

                            if (error === null) {

                                // tell connected clients that a users presence has changed
                                io.sockets.emit("presence", {

                                    user: user,

                                    time: new Date()

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

setInterval(function () {

    mqttClient.publish({

        topic: topic,

        payload: "0800E3CA33"

    });

}, 3000);

io.sockets.on("connection", function (socket) {

    // on joining, send a welcome message
    socket.emit("message", {

        message: "Congrats, your penis fits in the socket!"

    });

    socket.emit("users", {

        users: users

    });

});