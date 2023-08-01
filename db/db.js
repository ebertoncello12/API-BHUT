const mongoose = require('mongoose'); // CRM para interagir com DB de forma simples e rapida 

const DB_URL = 'mongodb+srv://enzzo:enzzo@log.iusbitn.mongodb.net'; // Mude para a URL do seu banco de dados MongoDB
const DB_NAME = 'log'; // Nome do banco de dados que conterá os logs

async function connectToDatabase() { // FUnçao assincrona para conexao com o banco de dados , 
                                     //pois pode demorar um tempo para a conexao com o DB retornando uma promise 
                                     // Usando o await o codigo sera pausado ate que a conexao seja estabelicida 
  try {
    await mongoose.connect(`${DB_URL}/${DB_NAME}`, {
      // Nenhum dos mecanismo sao OBRIGATORIOS so q para  garantir a melhor performance, compatibilidade e evitar problemas de atualizações futuras
      useNewUrlParser: false, // Mecanisno para Analisar a URL , antigo esta desatualizado
      useUnifiedTopology: true, // Mecanisno de Monitoramento
    });
    console.log('Conectado ao MongoDB com sucesso');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error; // Aqui estamos relançando o CODIGO para qualquer codido que estiver usando POIS estamos usando na index.js 
  }
}

module.exports = connectToDatabase; // Exportaçao para usar em qualquer arquivo do codigo mantendo o codigo CLEAN
