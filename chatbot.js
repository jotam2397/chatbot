// Leitor de QR Code
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();

// Defina a porta para o servidor (usando variável de ambiente PORT ou 10000 como fallback)
const PORT = process.env.PORT || 10000;

// Defina a sessão para autenticação local
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,  // Pode alterar para false se necessário
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

// Serviço de leitura do QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Confirmação de conexão
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

// Funil de vendas para "Tem pudim, sim!"
client.on('message', async msg => {
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

// Iniciar cliente do WhatsApp
client.initialize();

// Rota para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    res.send('Chatbot está rodando!');
});

// Iniciar o servidor na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
