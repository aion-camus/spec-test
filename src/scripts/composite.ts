import {request} from '../utils/http';
import {AVM} from '../utils/avm';
import {delay} from '../utils/delay';
import {Result} from '../utils/result';
import {main as prepare} from './prepare';
import {Transaction} from '../utils/transaction';

export async function composite_test(txs: Transaction[], caller?: string, pass?: string) {
    let avm = new AVM();

    let host = 'http://localhost:8545';

    // Step 2: complex api test
    console.log("Starting Composite Test");
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

    await delay(100);
    for (let tx of txs) {
        request('POST', host, {
            jsonrpc: '2.0',
            method: 'eth_sendTransaction',
            params: [
                {
                    from: sender,
                    to: tx.to,
                    data: tx.data,
                    gas: tx.gas || 2000000,
                    type: tx.type || 1
                }
            ],
            "id": 1
        })
    }
}

export function work(caller?: string, password?: string) {
    prepare('config/stage2.json', (data: any) => {
        // console.log(txs);
        composite_test(data, caller, password);
    });
}