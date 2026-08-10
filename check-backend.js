// 백엔드 서버 상태 체크 스크립트
const https = require('https');
const http = require('http');

const checkEndpoint = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const req = protocol.get(url, (res) => {
      console.log(`${url}: ${res.statusCode}`);
      resolve(res.statusCode);
    });
    
    req.on('error', (err) => {
      console.error(`${url}: ERROR - ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

async function checkBackend() {
  const endpoints = [
    'http://localhost:8080',
    'http://localhost:8080/oauth2/authorization/google',
    // 'https://api.woori-zip.lastdance.store',
    'http://52.78.132.28:8080/',
    // 'https://api.woori-zip.lastdance.store/oauth2/authorization/google'
    'http://52.78.132.28:8080/oauth2/authorization/google'
  ];

  for (const endpoint of endpoints) {
    try {
      await checkEndpoint(endpoint);
    } catch (error) {
      console.error(`Failed to check ${endpoint}`);
    }
  }
}

checkBackend();
