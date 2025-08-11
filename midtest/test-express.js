import express from "express";

console.log('Testing Express import...');

const app = express();

app.get('/test', (req, res) => {
    res.json({ message: 'Test successful' });
});

console.log('Express routes defined successfully');

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
