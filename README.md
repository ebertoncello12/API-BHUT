## 📁 Prova BHUT API-Rest

Este é um projeto de exemplo que demonstra como criar um aplicativo Node.js com integração de banco de dados MongoDB e comunicação assíncrona usando RabbitMQ. O projeto simula uma aplicação para criar Logs de carros e enviar mensagens de criação para clientes conectados via WebSocket.

## Como Funciona

O projeto consiste em três principais componentes: um servidor Express, um serviço de mensageria com RabbitMQ e um banco de dados MongoDB.

## Dependências

- Node.js (versão utilizada: 18.17.0)
- MongoDB (versão utilizada: 5.7.0)
- RabbitMQ (versão utilizada: 3.12.2)

## Servidor Express (index.js)

O servidor Express é a peça central do projeto e gerencia as rotas e as operações relacionadas aos carros. Ele utiliza as seguintes bibliotecas e dependências:

- Express: Framework para construção de aplicativos web com Node.js.
- Axios: Cliente HTTP utilizado para fazer requisições à API externa de carros.
- Body-parser: Middleware para analisar o corpo das requisições JSON.
- Mongoose: Biblioteca para modelar e interagir com o MongoDB.
- Cors: Middleware que habilita o controle de acesso HTTP.
- WebSocket (Socket.io): Biblioteca para comunicação bidirecional em tempo real com os clientes.

O servidor fornece as seguintes rotas:

- GET /api/listCars: Obtém a lista de carros a partir de uma API externa de carros.
- GET /api/logs: Obtém os registros de log dos carros criados.
- POST /api/createCar: Cria um novo registro de carro, armazena-o na API externa e registra o evento no banco de dados.


## 📝 Enviando um Webhook para o Discord
Após a criação bem-sucedida de um novo registro de carro usando a rota POST /api/createCar, o servidor envia um webhook para o Discord onde tive a liberdade de escolher o webhook, para notificar sobre o novo carro cadastrado. O webhook contém informações relevantes sobre o novo carro, como o ID do carro e um aviso

É importante mencionar que o URL do webhook está definido no próprio código do servidor no arquivo messageConsumer.js. Caso queira enviar o webhook para um canal diferente ou em um servidor Discord diferente, você deve substituir o URL atual pelo novo.



## ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) Banco de Dados MongoDB (db.js)

O MongoDB é utilizado para armazenar os registros de log dos carros criados. A conexão com o MongoDB é estabelecida utilizando a biblioteca Mongoose. A URL de conexão com o banco de dados pode ser configurada no arquivo db.js.

## ![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white) Serviço de Mensageria r Fila com RabbitMQ (rabbitmq.js e messageConsumer.js)

O RabbitMQ é um servidor de mensageria que permite a comunicação assíncrona entre diferentes partes do sistema. Neste projeto, ele é utilizado para enviar mensagens de criação de carros para clientes conectados via WebSocket.

O arquivo rabbitmq.js define a função connectToRabbitMQ, que estabelece a conexão com o servidor RabbitMQ e cria uma fila chamada 'car_created' para enviar as mensagens.

O arquivo messageConsumer.js é responsável por iniciar o consumidor de mensagens. Ele cria um socket WebSocket utilizando o pacote socket.io e aguarda mensagens na fila 'car_created' do RabbitMQ. Quando uma mensagem é recebida, o consumidor a emite para todos os clientes conectados.

## 🛠️ Abrir e Rodar o Projeto 

###  Instalação das Dependências

Antes de iniciar o projeto, certifique-se de ter o Node.js, o MongoDB configurado e o RabbitMQ instalado em sua máquina.

Primeiramente clone o repositorio 

```bash
# Instale as dependências do projeto
git clone https://github.com/ebertoncello12/API-BHUT.git
```
```bash
# Instale as dependências do projeto
npm install
```
### Configuração do Banco de Dados MongoDB
- 🔧  Abra o Arquivo db.js 
- 🔧  Substitua DB_URL pela URL do seu banco de dados MongoDB e DB_NAME pelo nome do banco de dados que conterá os logs.

## Configuraçao do RabbitMQ 
-  🔧 Abra os arquivos rabbitmq.js e messageConsumer.js.
-  🔧 Substitua a URL de conexão com o RabbitMQ (caso necessário).
  
## Iniciando Servidor 
- Apos a Configuraçao do RabbitMQ e MongoDB e instalado todas as dependencias 
```bash
# Execute o seguinte codigo no Terminal
npm start
```
- O servidor deve iniciar e exibir a mensagem "Servidor rodando na porta 5500" e um aviso que o messageConsumer foi conectado.

## Testando a Aplicaçao 
- Após seguir as etapas de instalação e configuração do projeto, você pode testar a aplicação utilizando uma Ferramente Postman ou qualquer outra ferramenta similar para fazer requisições HTTP.
## Testando a Rota 1 - Listar carros registrados
- Abra o Postman ou qualquer outra ferramenta de Requisiçoes HTTP.
- Crie uma nova requisição de tipo GET.
- Insira a URL da rota /api/listCars no campo de URL da requisição.
- Clique em "Send" (Enviar) para fazer a requisição.
- O servidor irá buscar os carros na API externa e retornar uma lista de carros em formato JSON. Você deverá ver a resposta na janela de resposta do Postman.
## Testando a Rota 2 - Visualizar logs de carros
-Abra o Postman ou qualquer outra ferramenta de Requisiçoes HTTP
-Crie uma nova requisição de tipo GET.
-Insira a URL da rota /api/logs no campo de URL da requisição.
-Clique em "Send" (Enviar) para fazer a requisição.
-O servidor irá retornar uma lista de logs em formato JSON. Você deverá ver a resposta na janela de resposta do Postman.
## Testando a Rota 3 - Criar um novo registro de carro
- AAbra o Postman ou qualquer outra ferramenta de Requisiçoes HTTP
- Crie uma nova requisição de tipo POST.
- Insira a URL da rota /api/createCar no campo de URL da requisição.
- Selecione o CORPO/BODY da requisição como sendo do tipo "raw" e escolha o formato JSON.
- No corpo da requisição, insira os dados do carro no seguinte formato:
```json
{
  "title": "Novo Carro",
  "brand": "Marca do Novo Carro",
  "price": "100000",
  "age": 2
}
```
- ## Se tudo der certo conforme o esperado 
- O servidor irá enviar os dados para a API externa, criar um novo registro de carro, registrar um log no banco de dados MongoDB e enviar uma mensagem via RabbitMQ informando que um novo carro foi criado. Você deverá ver a resposta na janela de resposta do Postman ou sua Ferramente HTTP.


