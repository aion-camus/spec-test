// import {local_test} from './scripts/local';
// import {composite_test} from './scripts/composite';
// import {work as graph_tetst} from './scripts/graph';
import {unity_rpc_test} from './scripts/rpc';

let java_sender = '0xa026cad9186794aff1670af76dde8a0e187926daa9800e95e1e1e194724fc619';
let rust_sender = '0xa013b0f1b404b9d0636bb05db99e7e1aa00e202ad5fa6ed91fa149b523c57ded'; // default

async function main() {
    // console.log('........... Stage One: Bytecodes ..............');
    // //local_test();

    // setTimeout(function() {
    //     console.log('............ Stage Two: Composite ..............');
    //     //composite_test('0xa026cad9186794aff1670af76dde8a0e187926daa9800e95e1e1e194724fc619');
    // }, 1000);

    // setTimeout(function() {
    //     console.log('............. Stage Three: Gas .............');
    // }, 1000);

    // setTimeout(function() {
    //     console.log(".............. graph cost test ...................");
    //     graph_tetst();
    // }, 1000);
    console.log('................ Unity RPC .................');
    unity_rpc_test();
}

main()