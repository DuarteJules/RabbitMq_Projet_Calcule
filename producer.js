import random from "random";
import amqplib from "amqplib";
import dotenv from "dotenv";
import prompts from "prompts";

dotenv.config({ path: "../.env" });

const rabbitmq_url = `amqp://${process.env.LOGIN}:${process.env.PASSWORD}@${process.env.URL}`;
console.log(rabbitmq_url);

const exchange = "AVG_operations";

let auto = true;

// Demande à l'utilisateur de choisir entre mode automatique et manuel 
async function promptForMode() {
  const response = await prompts({
    type: 'select',
    name: 'mode',
    message: 'Choisissez le mode de fonctionnement',
    choices: [
      { title: 'Automatique', value: true },
      { title: 'Manuel', value: false }
    ]
  });
  return response.mode;
}

auto = await promptForMode();

// Liste des opérations possibles
const operations = ["add", "sub", "mul", "div"];

// Crée un calcul aléatoire pour l'envoi automatique

function createCalc(operations) {
    const first = random.int(0, 100);    
    const second = random.int(0, 1000); 
    const query = { n1: first, n2: second };
    const operation = operations[random.int(0, operations.length - 1)]; // Opération au hasard
    return [query, operation];
}

/**
 * Envoie une requête de calcul vers RabbitMQ selon le mode (auto ou manuel)
 */
async function send(exchange, operations) {
    const connection = await amqplib.connect(rabbitmq_url);
    const channel = await connection.createChannel();

    let operation, query;

    if (auto) {
        // Mode automatique : on génère des valeurs et une opération au hasard
        [query, operation] = createCalc(operations);
    } else {
        // Mode manuel : l'utilisateur choisit l'opération et les valeurs
        try {
            const operationResponse = await prompts({
                type: 'select',
                name: 'operation',
                message: 'Choisissez l\'opération à effectuer',
                choices: operations.map(op => ({ title: op, value: op }))
            });
            operation = operationResponse.operation;

            const numbersResponse = await prompts([
                {
                    type: 'number',
                    name: 'n1',
                    message: 'Entrez la première valeur (n1)',
                    validate: value => value !== undefined ? true : 'Veuillez entrer un nombre valide'
                },
                {
                    type: 'number',
                    name: 'n2',
                    message: 'Entrez la deuxième valeur (n2)',
                    validate: value => value !== undefined ? true : 'Veuillez entrer un nombre valide'
                }
            ]);
            query = { n1: numbersResponse.n1, n2: numbersResponse.n2 };
        } catch (error) {
            console.error('Une erreur est survenue lors de la saisie:', error);
            return;
        }
    }

    await channel.assertExchange(exchange, "direct", {
        durable: true,
        autoDelete: false,
    });

    // Publication du message (sérialisé en JSON) dans l'exchange
    channel.publish(
        exchange,
        operation,
        Buffer.from(JSON.stringify(query))
    );

    console.log("Message envoyé avec l'opération : ", operation);

    await channel.close();
    await connection.close();
}

/**
 * Fonction pour envoyer des messages automatiquement toutes les 3 secondes
 */
function sendMessagesIndefinitely(exchange, operations) {
    send(exchange, operations).catch((err) =>
        console.error("Error sending message:", err)
    );
    setTimeout(sendMessagesIndefinitely, 3000, exchange, operations);
}

if (auto) {
    sendMessagesIndefinitely(exchange, operations);
} else {
    // Mode manuel : boucle tant que l'utilisateur veut envoyer des messages
    async function manualMode() {
        await send(exchange, operations);

        const continueResponse = await prompts({
            type: 'confirm',
            name: 'continue',
            message: 'Voulez-vous envoyer un autre message?',
            initial: true
        });

        if (continueResponse.continue) {
            await manualMode(); // Appel récursif si l'utilisateur veut continuer
        } else {
            console.log('Au revoir!');
            process.exit(0); // Fin du programme
        }
    }
    manualMode();
}
