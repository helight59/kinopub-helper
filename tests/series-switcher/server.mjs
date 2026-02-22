import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 5177);

const publicDir = path.join(__dirname, 'public');
app.use('/assets', express.static(path.join(publicDir, 'assets')));
app.use('/static', express.static(path.join(publicDir, 'static')));

// One HTML for any "item/view" route, so URL stays Kinopub-like.
app.get(['/', '/item/view/:id/:se'], (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Also fallback: any deeper path under /item/view/* should return the same page.
app.get('/item/view/*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Series-switcher test server: http://localhost:${PORT}`);
  console.log(`Example series: http://localhost:${PORT}/item/view/18009/s1e1`);
  console.log(`Example film:   http://localhost:${PORT}/item/view/978/s0e1`);
});