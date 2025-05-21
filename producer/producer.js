import random from "random";
import amqplib from "amqplib";
import dotenv from "dotenv";
import prompts from "prompts";

dotenv.config({ path: "../.env" });

const rabbitmq_url = `amqp://${process.env.LOGIN}:${process.env.PASSWORD}@${process.env.URL}`;
console.log("RabbitMQ URL:", rabbitmq_url);

const exchange = "operations";
const exchangeAll = "all_operations";
const operations = ["add", "sub", "mul", "div", "all"];

// 🟡 Vérifie la var d'env AUTO_MODE, sinon prompt l'utilisateur
let auto = process.env.AUTO_MODE === "true";

if (typeof process.env.AUTO_MODE === "undefined") {
  const response = await prompts({
    type: "select",
    name: "mode",
    message: "Choisissez le mode de fonctionnement",
    choices: [
      { title: "Automatique", value: true },
      { title: "Manuel", value: false },
    ],
  });
  auto = response.mode;
}

/**
 * Crée un calcul aléatoire
 */
function createCalc(operations) {
  const first = random.int(0, 100);
  const second = random.int(0, 1000);
  const operation = operations[random.int(0, operations.length - 1)];
  return [{ n1: first, n2: second }, operation];
}

/**
 * Envoie un message de calcul
 */
async function send(exchange, exchangeAll, operations) {
  const connection = await amqplib.connect(rabbitmq_url);
  const channel = await connection.createChannel();

  let operation, query;
  if (auto) {
    [query, operation] = createCalc(operations);
  } else {
    const operationResponse = await prompts({
      type: "select",
      name: "operation",
      message: "Choisissez l'opération à effectuer",
      choices: operations.map((op) => ({ title: op, value: op })),
    });
    operation = operationResponse.operation;

    const numbersResponse = await prompts([
      {
        type: "number",
        name: "n1",
        message: "Entrez n1",
        validate: (v) => v !== undefined || "Entrez un nombre",
      },
      {
        type: "number",
        name: "n2",
        message: "Entrez n2",
        validate: (v) => v !== undefined || "Entrez un nombre",
      },
    ]);
    query = { n1: numbersResponse.n1, n2: numbersResponse.n2 };
  }

  // Envoi à l'exchange
  if (operation !== "all") {
    await channel.assertExchange(exchange, "direct", { durable: true });
    channel.publish(exchange, operation, Buffer.from(JSON.stringify(query)));
    console.log("Message envoyé :", operation, query);
  } else {
    await channel.assertExchange(exchangeAll, "fanout", { durable: true });
    channel.publish(exchangeAll, "", Buffer.from(JSON.stringify(query)));
    console.log("Message envoyé : all", query);
  }

  await channel.close();
  await connection.close();
}

/**
 * Envoi automatique
 */
function sendMessagesIndefinitely() {
  send(exchange, exchangeAll, operations).catch(console.error);
  setTimeout(sendMessagesIndefinitely, 3000);
}

/**
 * Mode manuel
 */
async function manualMode() {
  await send(exchange, exchangeAll, operations);
  const again = await prompts({
    type: "confirm",
    name: "continue",
    message: "Envoyer un autre message ?",
    initial: true,
  });
  if (again.continue) await manualMode();
  else process.exit(0);
}

// ➤ Démarrage
if (auto) sendMessagesIndefinitely();
else manualMode();
