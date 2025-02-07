const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Criar cliente WhatsApp com autenticação persistente
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session' }), // Mantém a sessão salva
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--remote-debugging-port=9222'
        ]
    }
});

let qrCodeData = '';

// Captura e armazena o QR Code
client.on('qr', async qr => {
    console.log('QR RECEBIDO');
    qrCodeData = qr;
    try {
        await qrcode.toFile('./qrcode.png', qr); // Salva o QR Code em um arquivo
    } catch (err) {
        console.error('Erro ao gerar QR Code:', err);
    }
});

// Evento de conexão bem-sucedida
client.on('ready', () => {
    console.log('✅ WhatsApp conectado com sucesso!');
});

// Evento de erro na autenticação
client.on('auth_failure', (message) => {
    console.error('❌ Falha na autenticação:', message);
});

// Evento de desconexão
client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp desconectado:', reason);
    qrCodeData = ''; // Limpa o QR Code para forçar um novo
});

// Evento de recebimento de mensagens
client.on('message', async msg => {
    console.log('Mensagem recebida:', msg.body);
    
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname;

    if (msg.body.match(/(Teste|teste)/i)) {
        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, `Olá, ${name.split(" ")[0]}! 😃 Seja bem-vindo(a) à *Tem pudim, sim!* 🍮\n\nDigite apenas o número da opção desejada:\n\n1 - Quero fazer um pedido\n2 - Quero ver o cardápio\n3 - Qual o endereço para retirada?\n4 - Consultar se entrega no meu bairro\n5 - Outras perguntas`);
    }

    const responses = {
        '1': 'Temos diversas delícias para você! 😍\n\n🍮 Pudins\n🍫 Brownies\n🍪 Cookies\n❄️ Geladinho Gourmet\n🥭 E nossa novidade: Açaí!\n\nFaça já seu pedido!',
        '2': 'Olá! Que bom que deseja conhecer nosso cardápio! 😋\n\nConfira todas as opções disponíveis aqui: https://delivery.yooga.app/tem-pudim-sim$/tabs/home',
        '3': 'O endereço para retirada é: \n📍 Rua Dois, Número 5, São Luis, Volta Redonda',
        '4': 'Aqui estão as taxas de entrega por bairro: \n\n📍 *São Luis* - Grátis\n📍 *Dom Bosco, Brasilândia, Caieiras, São Sebastião e São Luis da Barra* - R$5,00\n📍 *Pinto da Serra, Califórnia, Bairro de Fátima, Morada do Vale, Cerâmica e São Francisco* - R$6,00',
        '5': 'Me envie detalhadamente qual é sua dúvida que iremos te responder. 😊'
    };

    if (responses[msg.body]) {
        await delay(3000);
        await client.sendMessage(msg.from, responses[msg.body]);
    }
});

// Função para delay
const delay = ms => new Promise(res => setTimeout(res, ms));

// Rota para exibir o QR Code
app.get('/', async (req, res) => {
    if (fs.existsSync('./qrcode.png')) {
        res.send(`
            <h1>Escaneie o QR Code abaixo para conectar ao WhatsApp:</h1>
            <img src="/qrcode" />
        `);
    } else {
        res.send('<h1>Aguardando QR Code...</h1>');
    }
});

// Rota para exibir o QR Code como imagem
app.get('/qrcode', (req, res) => {
    if (fs.existsSync('./qrcode.png')) {
        res.sendFile(__dirname + '/qrcode.png');
    } else {
        res.status(404).send('QR Code ainda não gerado.');
    }
});

// Inicializar o cliente do WhatsApp
client.initialize().then(() => {
    console.log('📡 Inicialização do cliente WhatsApp concluída!');
}).catch((error) => {
    console.error('❌ Erro ao inicializar cliente WhatsApp:', error);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando no Render na porta ${PORT}`);
});
