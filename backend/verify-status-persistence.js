const http = require('http');

const requestJson = (method, path, body) => new Promise((resolve, reject) => {
  const payload = body ? JSON.stringify(body) : null;
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path,
    method,
    headers: payload ? {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    } : {}
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = data ? JSON.parse(data) : {};
      resolve({ statusCode: res.statusCode, body: json });
    });
  });

  req.on('error', reject);
  if (payload) req.write(payload);
  req.end();
});

(async () => {
  try {
    const listRes = await requestJson('GET', '/api/calculations');
    if (listRes.statusCode !== 200 || !Array.isArray(listRes.body) || listRes.body.length === 0) {
      console.log('LIST_STATUS', listRes.statusCode, 'ROWS', listRes.body && listRes.body.length);
      return;
    }

    const calc = listRes.body[0];
    const member = calc.memberCalculations[0];
    const patchRes = await requestJson('PATCH', `/api/calculations/${calc._id}/members/${member.member}/status`, { status: 'paid' });
    console.log('PATCH_STATUS', patchRes.statusCode);
    console.log('PATCH_BODY', JSON.stringify(patchRes.body));

    const detailRes = await requestJson('GET', `/api/calculations/${calc._id}`);
    const updatedRecord = detailRes.body;
    const updated = updatedRecord.memberCalculations.find((item) => item.member === member.member);
    console.log('UPDATED_STATUS', updated && updated.status);
  } catch (error) {
    console.error('VERIFY_ERROR', error.message);
    process.exitCode = 1;
  }
})();
