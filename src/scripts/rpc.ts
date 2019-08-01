import {request} from '../utils/http';
import {Result} from '../utils/result';
import {delay} from '../utils/delay';
import { assert } from '../utils/assert';

let exec = require('child_process').exec;

export async function unity_rpc_test() {
    let host = 'http://localhost:8545';
    let sender = '0xa080f0fd34067707f5a6f888a2fc219b5fe26395fc42c5e12041ee04cddc9bc0';
    let sk = '1bfd08a5840c6e8e4a381210f0d7c5cc6702037ff2309a84171981d1af2712abda13c5e00eefa13b58292b9083c04559b77c5859bc764b47e2aa5ecfe9ea3bab';
    let pk = '0xda13c5e00eefa13b58292b9083c04559b77c5859bc764b47e2aa5ecfe9ea3bab';
    let passwd = '1234';
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

    let count = 0;
    let block_interval = 5; // seconds
    while (true) {

        console.warn('Try Block', count);
        // Step 1: get seed
        let seed = '';
        request('POST', host, {
            jsonrpc: '2.0',
            method: 'getseed',
            params: [],
            id: 1
        }, (response: Result): void => {
            // console.log(response);
            seed = response.result.toString();
            if (seed.startsWith('0x')) {
                seed = seed.substr(2);
            }
        });

        await delay(2000);
        console.log("Got seed:", seed);

        // Step 2: sign seed and submit signed seed
        let block_hash = '';
        let new_seed = '';
        let command = 'bin/ext_staker ' + 'sign ' + sk + ' ' + seed;
        exec(command, (err: any, stdout: any, stderr: any) => {
            console.log("Signed seed:", stdout);
            new_seed = stdout.replace('\n', '');
            assert(new_seed.length == 128 && pk.length == 66);
            request('POST', host, {
                jsonrpc: '2.0',
                method: 'submitseed',
                params: ['0x'+new_seed, pk],
                id: 1
            }, (response: Result): void => {
                block_hash = response.result.toString();
            });
        });

        // Step 3: sign block hash and submit
        await delay(1000);
        console.log('Got BlockHash:', block_hash);
        let block_signature = '';
        command = 'bin/ext_staker ' + 'sign1 ' + sk + ' ' + block_hash.substr(2);
        exec(command, (err: any, stdout: any, stderr: any) => {
            console.log("Signature:", stdout, stderr);
            block_signature = stdout.replace('\n', '');
            assert(block_signature.length == 128 && block_hash.length == 66);
            request('POST', host, {
                jsonrpc: '2.0',
                method: 'submitsignature',
                params: ['0x'+block_signature, block_hash],
                id: 1
            }, (response: Result): void => {
                console.log('Submit Result:', response.result.toString());
            });
        });

        count += 1;

        await delay(block_interval*1000);
    }
    

    await delay(100);
}