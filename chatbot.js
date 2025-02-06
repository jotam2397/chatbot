const { Client } = require('whatsapp-web.js'); 
const qrcode = require('qrcode');
const express = require('express');
const app = express();

// Definir a porta correta para rodar no Render
const PORT = process.env.PORT || 10000;

// Criar o cliente WhatsApp com as configurações para servidores
const client = new Client({
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

// Variável global para armazenar o QR Code
let qrCodeData = '';

// Evento para capturar e armazenar o QR Code
client.on('qr', qr => {
    console.log('QR RECEBIDO:', qr); // Log para verificar o QR Code recebido
    qrCodeData = qr; // Atualiza o QR Code para exibição na web
});

// Evento de conexão bem-sucedida
client.on('ready', () => {
    console.log('✅ WhatsApp conectado com sucesso!');
});

// Evento de erro
client.on('auth_failure', (message) => {
    console.error('❌ Falha na autenticação:', message);
});

client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp desconectado:', reason);
});

// Evento de recebimento de mensagens e automação
client.on('message', async msg => {
    console.log('Mensagem recebida:', msg.body); // Log da mensagem recebida

    if (msg.body.match(/(Teste|teste)/i) && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const name = contact.pushname;

        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        await client.sendMessage(msg.from, `Olá, ${name.split(" ")[0]}! 😃 Seja bem-vindo(a) à *Tem pudim, sim!* 🍮\n\nDigite apenas o número da opção desejada:\n\n1 - Quero fazer um pedido\n2 - Quero ver o cardápio\n3 - Qual o endereço para retirada?\n4 - Consultar se entrega no meu bairro\n5 - Outras perguntas`);
        await delay(3000);
        await chat.sendStateTyping();
    }

    if (msg.body === '1' && msg.from.endsWith('@c.us')) {
        await delay(3000);
        await client.sendMessage(msg.from, 'Temos diversas delícias para você! 😍\n\n🍮 Pudins\n🍫 Brownies\n🍪 Cookies\n❄️ Geladinho Gourmet\n🥭 E nossa novidade: Açaí!\n\nFaça já seu pedido!');
    }

    if (msg.body === '2' && msg.from.endsWith('@c.us')) {
        await delay(3000);
        await client.sendMessage(msg.from, 'Olá! Que bom que deseja conhecer nosso cardápio! 😋\n\nConfira todas as opções disponíveis aqui: https://delivery.yooga.app/tem-pudim-sim$/tabs/home');
    }

    if (msg.body === '3' && msg.from.endsWith('@c.us')) {
        await delay(3000);
        await client.sendMessage(msg.from, 'O endereço para retirada é: \n📍 Rua Dois, Número 5, São Luis, Volta Redonda');
    }

    if (msg.body === '4' && msg.from.endsWith('@c.us')) {
        await delay(3000);
        await client.sendMessage(msg.from, 'Aqui estão as taxas de entrega por bairro: \n\n📍 *São Luis* - Grátis\n📍 *Dom Bosco, Brasilândia, Caieiras, São Sebastião e São Luis da Barra* - R$5,00\n📍 *Pinto da Serra, Califórnia, Bairro de Fátima, Morada do Vale, Cerâmica e São Francisco* - R$6,00');
    }

    if (msg.body === '5' && msg.from.endsWith('@c.us')) {
        await delay(3000);
        await client.sendMessage(msg.from, 'Me envie detalhadamente qual é sua dúvida que iremos te responder. 😊');
    }
});

// Função de delay para simular pausa entre respostas
const delay = ms => new Promise(res => setTimeout(res, ms));

// Rota para exibir o QR Code na web
app.get('/', async (req, res) => {
    if (qrCodeData) {
        try {
            const qrImage = await qrcode.toDataURL(qrCodeData);
            res.send(`<h1>Escaneie o QR Code abaixo para conectar ao WhatsApp:</h1><img src="${qrImage}" />`);
        } catch (err) {
            res.send('<h1>Erro ao gerar o QR Code.</h1>');
        }
    } else {
        res.send('<h1>Aguardando QR Code...</h1>');
    }
});

// Inicializar o cliente do WhatsApp
client.initialize().then(() => {
    console.log('📡 Inicialização do cliente WhatsApp concluída!');
}).catch((error) => {
    console.error('❌ Erro ao inicializar cliente WhatsApp:', error);
});

// Iniciar o servidor Express
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando no Render na porta ${PORT}`);
});
