import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "./prisma";

const kafka = new Kafka({
    brokers: ["kafka-1f7f5551-sumanacharyya.a.aivencloud.com:12388"],
    ssl: {
        ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
    },
    sasl: {
        username: "avnadmin",
        password: "<ENTER_PASSWORD>",
        mechanism: "plain",
    },
});

let producer: null | Producer = null;

export async function createProducer() {
    if (producer) return producer;
    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceAMessage(message: string) {
    const producer = await createProducer();
    await producer.send({
        messages: [{ key: `message-${Date.now()}`, value: message }],
        topic: "MESSAGES",
    });
    return true;
}

export async function startMessageConsumer() {
    const consumer = kafka.consumer({
        groupId: "default",
    });
    await consumer.connect();
    await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });
    await consumer.run({
        autoCommit: true,
        // autoCommitInterval: 5,
        eachMessage: async ({ message, pause }) => {
            if (!message.value) return;
            console.log("new message received");
            try {
                await prismaClient.message.create({
                    data: {
                        text: message.value?.toString(),
                    },
                });
            } catch (error) {
                console.log("Something is wrong!");
                pause();
                setTimeout(() => {
                    consumer.resume([{ topic: "MESSAGES" }]);
                }, 60 * 1000);
            }
        },
    });
}

export default kafka;
