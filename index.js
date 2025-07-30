const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp bot is ready');
});

client.on('authenticated', () => {
  console.log('🔒 WhatsApp authenticated');
});

client.initialize();

// Send message endpoint
app.post('/send', async (req, res) => {
  const { number, message } = req.body;

  try {
    const chatId = number.includes('@c.us') ? number : number + '@c.us';
    await client.sendMessage(chatId, message);
    res.json({ status: 'success', number });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
