import fs = require('fs');
import {methods} from '../utils/codec';
import {request} from '../utils/http';
import {AVM} from '../utils/avm';
import {delay} from '../utils/delay';
import {Result} from '../utils/result';


function filter(tx: any, enable?: boolean): boolean {
    if (enable && (
        tx.method == 'getBlockDifficulty'
    )) {
        return false;
    }
    return false;
}

export async function local_test(caller?: string, pass?: string) {
    let avm = new AVM();

    let host = 'http://localhost:8545';
    let local_config = fs.readFileSync('config/stage1.json').toString();

    // Step 1: local call test
    console.log(JSON.parse(local_config).Description);
    let config = JSON.parse(local_config);
    let target = config.name+'-'+config.version+'.jar';

    let sender = caller || '0xa013b0f1b404b9d0636bb05db99e7e1aa00e202ad5fa6ed91fa149b523c57ded';
    // java Kernel
    // let sender = '0xa026cad9186794aff1670af76dde8a0e187926daa9800e95e1e1e194724fc619';
    let passwd = pass || '1234';

    let unlocked = false;
    request('POST', host, {
        jsonrpc: '2.0',
        method: 'personal_unlockAccount',
        params: [
            sender,
            passwd,
            null
        ],
        id: 1
    }, 
        (response: Result): void => {
        
        }
    );

    await delay(100);

    let tx_hash = '';
    avm.getCode('dist/'+target, (code) => {
        request('POST', host, {
            jsonrpc: '2.0',
            method: 'eth_sendTransaction',
            params: [
                {
                    from: sender,
                    data: code,
                    type: 2,
                    gas: 2000000
                }
            ],
            'id': 1
        }, (response): void => {
            tx_hash = response.result;
        });
    });

    await delay(25000);

    let contract_address = '';
    let deployed = false;
    request('POST', host, {
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [tx_hash],
        'id': 1
    },
        (response): void => {
            contract_address = response.result.contractAddress;
            deployed = (response.result.status == '0x1');
        }
    );

    await delay(27000);
    if (deployed) {
        for (var tx of config.transactions) {
            if (filter(tx, false)) {
                continue;
            }
            // let tx = config.transactions[4];
            console.log('test case: ' + tx.method);
            let data = methods.string(tx.method);
            let aion_tx = {
                jsonrpc: "2.0",
                method: "eth_call",
                params: [
                    {
                        "from": sender,
                        "to": contract_address,
                        "data": '0x'+data.toString('hex'),
                        "gas": '0x12345',
                        "gas_price": 12
                    },
                    "latest"
                ],
                "id": 1
            };
            
            request('POST', host, aion_tx, (response: Result): void => {
                if (tx.expected && tx.expected.length > 0) {
                    if (tx.expected != response.result) {
                        throw new Error('TEST of ' + tx.method + 'failed: expected ' + tx.expected + " got " + response.result);
                    }
                }
            });
            await delay(100);
        }
    } else {
        console.log("contract deploy failed");
    }
}