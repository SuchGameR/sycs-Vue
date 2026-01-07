import express from 'express';
import cors from 'cors'; // これを追加

const app = express();
const port = 3000;

app.use(cors()); // これを追加（すべての通信を許可）

app.get('/', (req, res) => {
    res.send('SYCS Backend is running with TypeScript and CORS enabled!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});