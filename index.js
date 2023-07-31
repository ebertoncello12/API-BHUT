// Importando as bibliotecas necessárias
const express = require('express'); // Biblioteca para criar o servidor web
const axios = require('axios'); // Biblioteca para fazer requisições HTTP
const bodyParser = require('body-parser'); // Biblioteca para processar o corpo das requisições
const connectToDatabase = require('./db/db'); // Função para conectar ao banco de dados
const mongoose = require('mongoose'); // Biblioteca para interagir com o MongoDB
const path = require('path'); // Biblioteca para lidar com caminhos de arquivos
const cors = require('cors'); // Middleware para permitir requisições de origens diferentes
const { connectToRabbitMQ } = require('./rabbitmq'); // Função para conectar ao RabbitMQ
const { startMessageConsumer } = require('./messageConsumer'); // Função para iniciar o consumidor de mensagens do RabbitMQ
const Log = require('./models/logModel'); // Modelo do Mongoose para os registros de log

// Criando a aplicação Express
const app = express();

// Definindo a porta em que o servidor irá escutar
const PORT = 5500;

// URL da API externa
const EXTERNAL_API_URL = 'http://api-test.bhut.com.br:3000';

// Configurando middlewares
app.use(bodyParser.json()); // Parseia o corpo das requisições para formato JSON
app.use(cors()); // Permite requisições de origens diferentes
app.use(express.static('public')); // Serve arquivos estáticos na pasta 'public'

// Conectando ao banco de dados MongoDB
connectToDatabase() // Aparentemnte deste jeito o codigo so ira funcionar caso o banco de dados esteja estabelecido
  .then(() => {

    // Rota para listar todos os carro
    app.get('/api/listCars', async (req, res) => { // Funçao assincrona onde retorna um promise
      try {
        const response = await axios.get(`${EXTERNAL_API_URL}/api/cars`); // so apos o recebindo dos carro iremos prosseguir
        const cars = response.data; // Criando uma const car com o valor dos carros.data
        res.json(cars); // Carros em formato JSON
      } catch (error) {
        res.status(500).json({ error: 'Erro ao obter os carros da API externa.' });
      }
    });

    // Rota para obter todos os registros de log
    app.get('/api/logs', async (req, res) => { // Func ASsincrona 
      try {
        const logs = await Log.find(); // travamos o codigo nesta alinha apos a execuçao do Log.find
                                      // Usando o objeto do moongose mais o modelo Log exportado para pegar todos os logs
        res.json(logs);
      } catch (error) {
        console.error('Erro ao obter os logs:', error);
        res.status(500).json({ error: 'Erro ao obter os registros de log.' });
      }
    });

    // Rota para criar um novo carro
    app.post('/api/createCar', async (req, res) => {
      try {
        const { title, brand, price, age } = req.body; // Realizaçao do destructuring assim podendo as variveis no escopo da func
        // Apos o destructuring criamos um Objeto com as propiedades extraidas do body / enviado pelo cliente 
        // Dados do carro a serem enviados para a API externa
        const externalCarData = {
          title,
          brand,
          price,
          age,
        };

        let createdCar; // Criamos uma Var "createdCar" para armazenar a resposta da API externa

        try {
          // Envia os dados do carro para a API externa e recebe a resposta com o carro criado
          const response = await axios.post(`${EXTERNAL_API_URL}/api/cars`, externalCarData); // Trava o codigo ate for resolvido e assim
          createdCar = response.data; // Armezena na variavel createdCar
        } catch (error) {
          console.error('Erro ao criar registro na API externa:', error);
          return res.status(500).json({ error: 'Erro ao criar registro na API externa.' });
        }

        // Cria um novo registro de log relacionado ao carro criado
        const log = new Log({ // Instanciamos o objeto Log , nosso modelo 
          car_id: createdCar._id, // inicializa com a propriedade 'car_id', que é definida como o '_id' do objeto
                                    //'createdCar' obtido a partir da resposta da API externa
        });

        // Salva o registro de log no banco de dados
        await log.save(); // Trava o codigo ate o promise ser resolvido usando a operaçao do mongoose .save // Persistir no DB
        
        // Conecta ao RabbitMQ para enviar uma mensagem para a fila
        const rabbitMqConnection = await connectToRabbitMQ(); // Conecta a o Rabbit 
        const { channel, queue } = rabbitMqConnection; // Retorna um Objeto c as propiedades channel , queue desestruturadas

        // Monta a mensagem a ser enviada para a fila
        const messageToQueue = { car_id: log.car_id, message: 'Novo carro criado, mensagem através de webSocket' };

        // Importante Onde enviamos a Mensagem para a fila 
        // Envia a mensagem para a fila e converte para Json e passa poor um buffer e depois para fila
        // usa o persistent da biblioteca do rabbit para persistir no rabbit . da mesma maneira deu um DB
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageToQueue)), { persistent: true });

        // se tudo der certo enviamos a reposta em json para o cliente 
        res.json(messageToQueue);
      } catch (error) {
        console.error('Erro ao criar carro:', error);
        res.status(500).json({ error: 'Erro ao criar um registro de carro.' });
      }
    });

    // Inicia o servidor na porta definida
    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      startMessageConsumer(server); // Inicia o consumidor de mensagens do RabbitMQ
    });
  })
  .catch((error) => { // Catch do ConnectToDataBase 
    console.error('Erro ao conectar ao MongoDB:', error);
  });
