import amqplib from "amqplib";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

console.log("🔄 Worker initialized");

const operationType = process.env.OPERATION;
if (!operationType) {
  console.error("❌ OPERATION env var not set");
} else {
  console.log("🌍 OPERATION =", process.env.OPERATION);
}

const rabbitmq_url = `amqp://${process.env.LOGIN}:${process.env.PASSWORD}@${process.env.URL}`;
const queue = `${operationType}_worker`;
const exchange = "operations";
const exchangeAll = "all_operations";
const routing_key = operationType;
const results_queue = "results";

const operation = {
  add: "+",
  div: "/",
  mul: "*",
  sub: "-",
};

async function receive() {
  const connection = await amqplib.connect(rabbitmq_url);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, "direct", {
    durable: true,
    autoDelete: false,
  });

  await channel.assertExchange(exchangeAll, "fanout", {
    durable: true,
    autoDelete: false,
  });

  await channel.assertQueue(queue, { durable: true, autoDelete: false });
  await channel.assertQueue(results_queue, {
    durable: true,
    autoDelete: false,
  });

  await channel.bindQueue(queue, exchange, routing_key);
  await channel.bindQueue(queue, exchangeAll, "");

  channel.consume(
    queue,
    (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString().replace(/'/g, '"'));
        console.log(
          `Requête ${routing_key} reçue : ${content.n1} ${operation[routing_key]} ${content.n2}`,
        );

        if (routing_key === "div" && content.n2 === 0) {
          console.log("Division par zéro impossible");
          channel.ack(msg);
          return;
        }

        let res;
        switch (routing_key) {
          case "add":
            res = content.n1 + content.n2;
            break;
          case "sub":
            res = content.n1 - content.n2;
            break;
          case "mul":
            res = content.n1 * content.n2;
            break;
          case "div":
            res = content.n1 / content.n2;
            break;
          default:
            console.error("Opération inconnue", routing_key);
            channel.ack(msg);
            return;
        }

        const processTime = Math.floor(Math.random() * 10000) + 5000;
        setTimeout(() => {
          const result = {
            n1: content.n1,
            n2: content.n2,
            op: routing_key,
            result: res,
          };

          console.log(result);
          channel.sendToQueue(
            results_queue,
            Buffer.from(JSON.stringify(result)),
          );
          channel.ack(msg);
        }, processTime);
      }
    },
    { noAck: false },
  );
}

console.log("🔄 Worker started");

receive();
