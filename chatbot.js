const { Client } = require('whatsapp-web.js');  // Remover o LocalAuth para não reutilizar a sessão
const qrcode = require('qrcode');
const express = require('express');
const app = express();

// Defina a porta para o servidor (usando variável de ambiente PORT ou 10000 como fallback)
const PORT = process.env.PORT || 8080;  // Alterei a porta para 8080, caso necessário

// Defina a sessão para autenticação (não persistente)
const client = new Client({
    puppeteer: { 
        headless: false,  // Alterado para false para visualizar o navegador
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

// Variável para armazenar o QR Code
let qrCodeData = '';

// Serviço de leitura do QR Code
client.on('qr', qr => {
    console.log('QR RECEIVED', qr);
    qrCodeData = qr; // Armazenar o QR Code para exibição
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

// Rota para exibir o QR Code na web
app.get('/', (req, res) => {
    if (qrCodeData) {
        // Gerar o QR Code em base64 e exibir na página
        qrcode.toDataURL(qrCodeData, (err, url) => {
            if (err) {
                res.send('Erro ao gerar o QR Code.');
            } else {
                res.send(`<h1>Escaneie o QR Code abaixo para conectar ao WhatsApp:</h1><img src="${url}" />`);
            }
        });
    } else {
        res.send('<h1>Aguardando QR Code...</h1>');
    }
});

// Iniciar cliente do WhatsApp
client.initialize();

// Iniciar o servidor na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
