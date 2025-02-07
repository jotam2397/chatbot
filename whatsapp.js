import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';

async function connectWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('Escaneie este QR Code para conectar ao WhatsApp:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            console.log('Conexão fechada. Tentando reconectar...');
            connectWhatsApp();
        } else if (connection === 'open') {
            console.log('Conectado ao WhatsApp!');
        }
    });
}

connectWhatsApp();
