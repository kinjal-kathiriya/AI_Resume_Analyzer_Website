const express = require('express');
const app = express();
app.use(express.static(__dirname));
app.get('/test', (req, res) => res.send('✅ Server is running'));
app.listen(3000, () => console.log('✅ Test server running on port 3000'));