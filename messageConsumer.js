const amqp = require('amqplib'); // Biblioteca para interagir com o RabbitMQ
const socketio = require('socket.io'); // Biblioteca para lidar com WebSockets
const axios = require('axios'); // Biblioteca para fazer requisições HTTP
const { connectToRabbitMQ } = require('./rabbitmq');

// Função assíncrona para iniciar o consumidor de mensagens
async function startMessageConsumer(server) { // FUnçao Async  responsavel por enviar webhook , websocket e iniciar o consumidor de mensageria
  const io = socketio(server); // Inicializa o servidor de WebSockets

  try {
    const { connection, channel, queue } = await connectToRabbitMQ();

    // sintaxe da biblioteca rabbit usa o parametro queue obrigatorio , e o usamos o durable para persisir 
    await channel.assertQueue(queue, { durable: true }); // Usando o metodo assertQeue do rabbit verificamos se ja a uma fila 
    // assim persistindo as mensagens

    // Função para consumir mensagens da fila
    channel.consume( // Sintaxe do Rabbit  queue , callback , options 
      queue,
      async (message) => { // Func Async Callback pela arrow Func 
        if (message !== null) { // Diferente de nullo
          const content = JSON.parse(message.content.toString()); //cria content armazena o conteudo e Converte em mensagem para um objeto
                                                                /// JavaScript
          io.emit('car_created', content); // usando a biblioteca do socket.io para enviar um evento para todos cliente conectados

          channel.ack(message); // Importante Envia um joia para o Rabbit , onde a mensagem foi entregue e pode ser removida da 
                                // fila asism entrando outra mensagem

          // Enviar o webhook para o Discord
          try {
            const webhookURL = 'https://discord.com/api/webhooks/1133807070718730260/Ttk41hzKhJ6LAwtl2K2R_ZONAtuhn3DOsDSo1Hwhh5r9mMK3YcmgswInk4ydGBeL3Gtg';
            const webhookData = {
              content: `Novo carro cadastrado!\nID do Carro: ${content.car_id} mensagem enviada via WebHook`, // Interpolarizaçao do id do carro
            };
            await axios.post(webhookURL, webhookData); // Envia a mensagem para o webhook do Discord
          } catch (error) {
            console.error('Erro ao enviar o webhook para o Discord:', error);
          }
        }
      },
      { noAck: false } // Define que as mensagens não serão automaticamente confirmadas(channel.ack quuando for chamado)
      // Deixando a entrega das mensagem seguras 
    );

    console.log('Consumidor de mensagens iniciado.');
  } catch (error) {
    throw new Error('Erro ao iniciar o consumidor de mensagens: ' + error.message);
  }
}

// Exporta a função para que ela possa ser utilizada em outros arquivos
module.exports = { startMessageConsumer };
