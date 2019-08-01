import {AVM} from '../utils/avm';
import {delay} from '../utils/delay';
import {Result} from '../utils/result';
import {request} from '../utils/http';
import fs = require('fs');

export async function work(caller?: string, pass?: string) {
    let avm = new AVM();

    let host = 'http://localhost:8545';

    // Step 2: complex api test
    console.log("Starting Graph Test");
    let sender = caller || '0xa013b0f1b404b9d0636bb05db99e7e1aa00e202ad5fa6ed91fa149b523c57ded';
    // java Kernel
    // let sender = '0xa026cad9186794aff1670af76dde8a0e187926daa9800e95e1e1e194724fc619';
    let passwd = pass || '1234'

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
            console.log(response);
        }
    );

    let contract = null;
    if (fs.existsSync('config/contract.dat')) {
        contract = fs.readFileSync('config/contract.dat').toString();
    }

    await delay(100);
    if (!contract) {
        let tx_hash = '';
        avm.getCode('/home/camus/Workspace/Aion/JavaContracts/storage/target/storage-1.0-SNAPSHOT.jar', (data) => {
            //deploy a test contract
            request('POST', host, {
                jsonrpc: '2.0',
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: sender,
                        data: data,
                        gas: 5000000,
                        type: 2
                    }
                ],
                "id": 1
            }, (response): void => {
                tx_hash = response.result;
            })
        });

        await delay(15000);
        request('POST', host, {
            jsonrpc: '2.0',
            method: 'eth_getTransactionReceipt',
            params: [tx_hash],
            "id": 1
        }, (response): void => {
            contract = response.result.contractAddress;
            fs.writeFileSync('config/contract.dat', contract);
        });
    }
    
    let count = 0;
    while (count < 10000) {
        request('POST', host, {
            jsonrpc: '2.0',
            method: 'eth_sendTransaction',
            params: [
                {
                    from: sender,
                    to: contract,
                    data: '0x2100027373',
                    gas: 2000000
                }
            ],
            "id": 1
        }, (response): void => {
            count += 1;
            console.log(response.result, ' ## ', count);
        });

        await delay(50);
    }
}