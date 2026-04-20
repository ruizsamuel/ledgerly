const target = process.env.SERVER_PROXY_TARGET || 'http://localhost:5000';

module.exports = [
  {
    context: ['/api'],
    target,
    changeOrigin: true,
    secure: false,
    logLevel: 'warn'
  }
];