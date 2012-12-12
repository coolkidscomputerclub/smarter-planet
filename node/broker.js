var mqtt = require('mqttjs'),
    port = 8080,
    host = "127.0.0.1",
    topic = "test",
    mqttServer,
    mqttClient;

mqttServer = mqtt.createServer(function (client) {

    var self = this;

    if (!self.clients) {

        self.clients = {};

    }

    client.on('connect', function (packet) {

        client.connack({

            returnCode: 0

        });

        client.id = packet.client;

        self.clients[client.id] = client;

        console.log("Client joined: ", packet);

        if (client.id !== "nodeClient") {

            mqttClient.publish({

                topic: topic,

                payload: "HELLO"

            });

        }

    });

    client.on('publish', function (packet) {

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

        console.log("Publish received: ", packet);

    });

    client.on('subscribe', function (packet) {

        var granted = [];

        for (var i = 0; i < packet.subscriptions.length; i++) {

            granted.push(packet.subscriptions[i].qos);

        }

        client.suback({granted: granted});

        console.log("Subscribe received: ", packet);

    });

    client.on('pingreq', function (packet) {

        client.pingresp();

    });

    client.on('disconnect', function (packet) {

        client.stream.end();

    });

    client.on('close', function (err) {

        delete self.clients[client.id];

    });

    client.on('error', function (err) {

        client.stream.end();

        util.log('error!');

    });

}).listen(port);

mqttClient = mqtt.createClient(port, host, function (err, client) {

    // connect to the MQTT server running at host on port, tell it we're "nodeClient"
    client.connect({

        client: "nodeClient"

    });

    client.on('connack', function (packet) {

        if (packet.returnCode === 0) {

            // connected

        } else {

            console.log('connack error %d', packet.returnCode);

            process.exit(-1);

        }

    });

    client.on('publish', function (packet) {

        console.log("Payload received: ", packet.topic, packet.payload);

    });

    client.on('close', function () {

        process.exit(0);

    });

    client.on('error', function (e) {

        console.log('error %s', e);

        process.exit(-1);

    });

});