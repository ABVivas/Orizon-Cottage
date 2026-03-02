import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = 5000;

app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor mínimo funcionando' });
});

mongoose.connect('mongodb://localhost:27017/orizon_cottage')
    .then(() => {
        console.log('✅ MongoDB Conectado');
        app.listen(PORT, () => {
            console.log(`✅ Servidor en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Error MongoDB:', err);
    });