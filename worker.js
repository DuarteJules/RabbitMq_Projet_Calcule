const amqplib = require("amqplib");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });

const rabbitmq_url = `amqp://${process.env.LOGIN}:${process.env.PASSWORD}@${process.env.URL}`;
const queue = `${process.argv[2]}_worker`;
const exchange = "operations";
const routing_key = process.argv[2];
const results_queue = "results";
let operation = {
    sum: "+",
    div: "/",
    mul: "*",
    sub: "-"
}


async function receive() {

    // Connexion au server RabbitMQ
    const connection = await amqplib.connect(rabbitmq_url);

    // Création d'un channel
    const channel = await connection.createChannel();

    // Création de l'exchange pour les opérations
    await channel.assertExchange(exchange, "direct", {
        durable: true,
        autoDelete: false,
    });

    // Assertions sur la queue du worker
    await channel.assertQueue(queue, { durable: true, autoDelete: false });

    // Assertions sur la queue de résultats
    await channel.assertQueue(results_queue, {
        durable: true,
        autoDelete: false,
    });

    // Ajout de la règle de routing pour le worker
    await channel.bindQueue(queue, exchange, routing_key);

    channel.consume(queue, (msg) => {
        if (msg !== null) {
            console.log("Message reçu : ", msg.content.toString());

            // Récupération du message et parsing en json
            const content = JSON.parse(
                msg.content.toString().replace(/'/g, '"')
            );
            console.log(
                `Requête ${routing_key} reçue : ${content.n1} ${operation[routing_key]} ${content.n2}`
            );

            // Vérification pour la division par 0
            if (routing_key === "div" && content.n2 === 0) {
                console.log("Division par zéro impossible");
                channel.ack(msg);
                return;
            }

            let res;

            // Réalisation de l'opération en fonction du rôle du worker
            switch (routing_key) {
                case 'sum': res = content.n1 + content.n2; break;
                case 'sub': res = content.n1 - content.n2; break;
                case 'mul': res = content.n1 * content.n2; break;
                case 'div': res = content.n1 / content.n2; break;
                default:
                    console.error('Opération inconnue', routing_key);
                    channel.ack(msg);
                    return;
            }

            // Création d'un process time aléatoire pour simuler un calcul complexe
            const processTime = Math.floor(Math.random() * 10000) + 5000;

            setTimeout(() => {

                // Création de l'objet de la réponse
                const result = {
                    n1: content.n1,
                    n2: content.n2,
                    op: routing_key,
                    result: res,
                };

                console.log(result);
                channel.sendToQueue(
                    results_queue,
                    Buffer.from(JSON.stringify(result))
                );
                channel.ack(msg);
            }, processTime);
        }
    }, {noAck: false});
}

receive();
