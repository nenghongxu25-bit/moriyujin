const main = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let endpoint;
    let id = 0;
    const pending = new Map();
    const call = async (method, params) => {
        const requestId = ++id;
        const result = new Promise(resolve => pending.set(requestId, resolve));
        await fetch(endpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params })
        });
        return result;
    };
    try {
        const response = await fetch('http://127.0.0.1:18188/ai/mcp', { signal: controller.signal });
        let buffer = '';
        for await (const chunk of response.body) {
            buffer += new TextDecoder().decode(chunk);
            let end;
            while ((end = buffer.indexOf('\n\n')) >= 0) {
                const event = buffer.slice(0, end);
                buffer = buffer.slice(end + 2);
                const data = event.split('\n').filter(line => line.startsWith('data:'))
                    .map(line => line.slice(5).trim()).join('\n');
                if (event.includes('event: endpoint')) {
                    endpoint = 'http://127.0.0.1:18188' + data;
                    void (async () => {
                        await call('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'vision-check', version: '1' } });
                        const params = JSON.parse((process.argv[2] === '-' ? require('fs').readFileSync(0, 'utf8') : process.argv[2] || '{}').replace(/^\uFEFF/, ''));
                        const result = await call(params.name ? 'tools/call' : 'tools/list', params);
                        if (!params.name) result.result.tools = result.result.tools.filter(t => /Runtime|Script|Node/.test(t.name));
                        console.log(JSON.stringify(result));
                        controller.abort();
                    })().catch(error => { console.error(error); controller.abort(); });
                } else if (data) {
                    const message = JSON.parse(data);
                    pending.get(message.id)?.(message);
                }
            }
        }
    } catch (error) {
        if (error.name !== 'AbortError') console.error(error);
    } finally {
        clearTimeout(timeout);
    }
};
main();
