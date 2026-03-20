const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.post('/webhook', (req, res) => {
  console.log('Received Webhook:', req.body);
  res.status(200).json({ message: 'Webhook received successfully' });
});

app.get('/health', (req, res) => res.send('Webhook Hub Active'));

app.listen(PORT, () => console.log(`Webhook server running on port ${PORT}`));
