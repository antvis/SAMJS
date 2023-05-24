const http = require('http');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  res.setHeader('Content-Length', 5 * 1024 * 1024);
  // 转发请求的目标URL
  const targetUrl =
    'http://1664081855183111.cn-shanghai.pai-eas.aliyuncs.com/api/predict/sam_annotator';

  // 发送转发请求
  const options = {
    hostname: 'http://11.166.207.230:8000/calc_embedding',
    method: 'POST',
    // headers: {
    //     "Authorization": "ZDlkYjQ1YjFiNjc4NWFkMzRmNWI4NzYwZjRlMTI4MTk2ZjBkMGYzNg=="
    //     },
  };

  const forwardReq = http.request(options, (forwardRes) => {
    // 接收转发响应
    res.writeHead(forwardRes.statusCode, forwardRes.headers);

    forwardRes.on('data', (chunk) => {
      res.write(chunk);
    });

    forwardRes.on('end', () => {
      res.end();
    });
  });

  forwardReq.on('error', (error) => {
    console.error('转发请求出错:', error);
    res.statusCode = 500;
    res.end('转发请求出错');
  });

  // 如果有请求体，则将其写入转发请求
  req.on('data', (chunk) => {
    forwardReq.write(chunk);
  });

  req.on('end', () => {
    forwardReq.end();
  });
});

// 监听端口
const port = 3000;
server.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
