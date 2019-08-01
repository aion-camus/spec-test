
import {Transaction} from '../utils/transaction';
import {AVM} from '../utils/avm';
import { delay } from '../utils/delay';
import fs = require('fs');

let avm = new AVM();

export function prepare(input: any): Transaction[] {
    let txs: Transaction[] = [];
    for (let test_case of input.cases) {
        if (test_case.package) {
            let target = test_case.package+'-'+test_case.version+'.jar';
            avm.getCode('dist/'+target, (code: string) => {
                txs.push({
                    "data": code,
                    "type": 2
                });
                for (let tx of test_case.transactions) {
                    txs.push(tx);
                }
            });
        } else {
            for (var tx of test_case.transactions) {
                txs.push(tx);
            }
        }
    }
    return txs;
}

let config = {
    "name": "stage2",
    "description": "Account/Storage/Gas",
    "cases": [
        {
            "name": "account",
            "transactions": [
                {
                    "data": "0x6050",
                    "type": 2
                },
                {
                    "data": "0x6050",
                    "type": 1
                },
                {
                    "data": "",
                    "type": 2
                },
                {
                    "data": "",
                    "type": 1
                }
            ]
        },
        {
            "name": "gas",
            "transactions": [
                {
                    "data": "",
                    "gas": 200000,
                    "expected": {
                        "status": 0
                    }
                },
                {
                    "data": "",
                    "gas": 221000,
                    "expected": {
                        "status": 1
                    }
                },
                {
                    "to": "",
                    "data": "",
                    "gas": 2000000,
                    "expected": {
                        "status": 1
                    }
                },
                {
                    "data": "",
                    "gas": 1999999,
                    "expected": {
                        "status": 1
                    }
                },
                {
                    "to": "",
                    "data": "",
                    "gas": 2000001,
                    "expected": {
                        "status": 0
                    }
                },
                {
                    "data": "",
                    "gas": 5000000,
                    "expected": {
                        "status": 1
                    }
                },
                {
                    "data": "",
                    "gas": 5000001,
                    "expected": {
                        "status":0
                    }
                }
            ]
        },
        {
            "package": "storage",
            "version": "1.0",
            "Description": "Storage Test",
            "source": "",
            "transactions":[
                {
                    "to": "",
                    "data": "check_storage"
                },
                {
                    "to": "",
                    "data": "kill"
                }
            ]
        }
    ]
};

export async function main(config_path: string, callback?: (data: any) => void) {
    let config = JSON.parse(fs.readFileSync(config_path).toString());
    let txs = prepare(config);
    await delay(1000);
    if (callback) {
        callback(txs);
    }
}

// main('config/stage2.json', (data): void => {
//     console.log(data);
// });