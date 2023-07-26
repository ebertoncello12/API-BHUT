const amqp = require('amqplib');
const socketio = require('socket.io');
const axios = require('axios');

async function startMessageConsumer(server) {
  const io = socketio(server);

  try {
    const connection = await amqp.connect('amqp://localhost'); // ou substitua por sua URL do RabbitMQ
    const channel = await connection.createChannel();
    const queue = 'car_created'; // Nome da fila para a mensagem do carro criado

    await channel.assertQueue(queue, { durable: true });

    channel.consume(
      queue,
      async (message) => {
        if (message !== null) {
          const content = JSON.parse(message.content.toString());
          io.emit('car_created', content);
          channel.ack(message);

          // Enviar o webhook para o Discord
          try {
            const webhookURL = 'https://discord.com/api/webhooks/1133807070718730260/Ttk41hzKhJ6LAwtl2K2R_ZONAtuhn3DOsDSo1Hwhh5r9mMK3YcmgswInk4ydGBeL3Gtg';
            const webhookData = {
              content: `Novo carro cadastrado!\nID do Carro: ${content.car_id}`,
            };

            await axios.post(webhookURL, webhookData);
          } catch (error) {
            console.error('Erro ao enviar o webhook para o Discord:', error);
          }
        }
      },
      { noAck: false }
    );

    console.log('Consumidor de mensagens iniciado.');
  } catch (error) {
    throw new Error('Erro ao iniciar o consumidor de mensagens: ' + error.message);
  }
}

module.exports = { startMessageConsumer };
