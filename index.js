const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

// Variables de entorno
const AXIS_IP = process.env.AXIS_IP || '192.168.1.100';
const AXIS_USER = process.env.AXIS_USER || 'root';
const AXIS_PASS = process.env.AXIS_PASS || 'pass';

console.log('=== DEBUG VARIABLES ===');
   console.log('AXIS_IP:', process.env.AXIS_IP);
   console.log('AXIS_USER:', process.env.AXIS_USER);
   console.log('AXIS_PASS:', process.env.AXIS_PASS ? '***' : 'undefined');
   console.log('Valor final AXIS_IP:', AXIS_IP);
   console.log('======================');

// Proxy para el stream
app.use('/stream', createProxyMiddleware({
  target: `http://${AXIS_IP}`,
  changeOrigin: true,
  pathRewrite: {'^/stream': '/axis-cgi/mjpg/video.cgi'},
  onProxyReq: (proxyReq) => {
    const auth = Buffer.from(`${AXIS_USER}:${AXIS_PASS}`).toString('base64');
    proxyReq.setHeader('Authorization', `Basic ${auth}`);
  }
}));

// Proxy para PTZ
app.use('/ptz', createProxyMiddleware({
  target: `http://${AXIS_IP}`,
  changeOrigin: true,
  pathRewrite: {'^/ptz': '/axis-cgi/com/ptz.cgi'},
  onProxyReq: (proxyReq) => {
    const auth = Buffer.from(`${AXIS_USER}:${AXIS_PASS}`).toString('base64');
    proxyReq.setHeader('Authorization', `Basic ${auth}`);
  }
}));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'AXIS Proxy Backend',
    axis_ip: AXIS_IP 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Servidor corriendo en puerto ${PORT}`);
});
