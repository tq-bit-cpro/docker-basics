const os = require('os');
const app = require('express')();

app.get('/', (req, res) => res.send('<h1>Hello Docker</h1>'));

app.listen(8080, () => {
	console.log(`Internal Host: ${os.hostname}`);
	console.log('External Host: http://localhost:8080');
	console.log(`OS Platform: ${os.platform} ${os.arch}`);
});
