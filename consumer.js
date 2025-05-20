const amqplib = require('amqplib');

const rabbitmq_url = 'amqp://'+process.env.USER+':'+process.env.PASSWORD+'@'+process.env.URL;
const queue = 'AVG_project_calc_req';
const message = 'Bonjour !' + Date.now();

function createCalc(){
    const nb1 = rand();
    const nb2 = rand();
    const req = {
        "n1": nb1,
        "n2": nb2
    };

    return req;
}

async function send() {
    // Connexion
    const connection = await amqplib.connect(rabbitmq_url);
    
    // Création du channel
    const channel = await connection.createChannel();

    // Assertion sur l'existence de la queue
    await channel.assertQueue(queue, { durable: false });

    // Envoi du message
    channel.sendToQueue(queue, Buffer.from(message));

    console.log("Message envoyé !");

    // Fermeture de la connexion
    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 200);

}

send();