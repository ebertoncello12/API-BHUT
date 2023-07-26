const amqp = require('amqplib');

async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://localhost'); // ou substitua por sua URL do RabbitMQ
    const channel = await connection.createChannel();
    const queue = 'car_created'; // Nome da fila para a mensagem do carro criado

    await channel.assertQueue(queue, { durable: true });
    return { connection, channel, queue };
    
  } catch (error) {
    throw new Error('Erro ao conectar ao RabbitMQ: ' + error.message);
  }
}

module.exports = { connectToRabbitMQ };
