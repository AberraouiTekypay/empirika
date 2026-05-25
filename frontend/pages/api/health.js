export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'empirika-frontend',
    ts: new Date().toISOString(),
  });
}
