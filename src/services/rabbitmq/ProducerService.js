const amqp = require('amqplib');

const ProducerService = {
  // (message<string>, queue<string>)
  sendMessageToQueue: async (message, queue) => {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();

    // cek queue, jika tidak ada maka akan dibuat
    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ProducerService;
