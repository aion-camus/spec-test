import fs = require('fs');

var exec = require('child_process').exec;

let exec_path = '/home/camus/Workspace/Aion/rust_avm/aion_vm/dist/avm.jar';

export class AVM {
    code: string;
    path: null | string;
    constructor() {
        this.path = exec_path;
        this.code = "";
    }

    getCode(
        appPath: string,
        callback?: (result: any) => void
        ) {
        let command = 'java -jar ' + exec_path + ' bytes ' + appPath;
        exec(command, (err: any, stdout: any, stderr: any) => {
            this.code = '0x'+stdout.replace('\n', '');
            if (callback) {
                callback(this.code);
            }
        });
    }
}

let avm = new AVM();
avm.getCode('dist/APITest-1.0.jar');
console.log(avm.code);