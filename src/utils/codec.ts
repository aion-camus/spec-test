/// an avm interface definition is relatively simple
// {
//     'name': "",
//     'params': [param_type]
// }

// in which param_type = int/long/uchar/address .etc


function toArray(value: number, width: number): Uint8Array {
    let ret = new Uint8Array(width);

    for (let i = 0; i< width; i++) {
        ret.fill((value>>i*8) & 0xff,width-1-i, width-i);
    }

    return ret;
}

function parseHexString(value: string): Uint8Array {
    function check(condition: boolean) {
        if (!condition) {
            throw new Error("parsing invalid input");
        }
    }
    function getByte(high: string, low: string): number {
        check(high.length===1);
        check(low.length===1);
        let ret = 0;
        if (high>='0'&&high<='9') {
            ret += (high.charCodeAt(0)-'0'.charCodeAt(0)) << 4;
        } else if (high>='a'&&high<='f') {
            ret += (high.charCodeAt(0)-'a'.charCodeAt(0)+10) << 4;
        } else if (high>='A'&&high<='F') {
            ret += (high.charCodeAt(0)-'A'.charCodeAt(0)+10) << 4;
        } else {
            check(false);
        }

        if (low>='0'&&low<='9') {
            ret += (low.charCodeAt(0)-'0'.charCodeAt(0));
        } else if (low>='a'&&low<='f') {
            ret += (low.charCodeAt(0)-'a'.charCodeAt(0)+10);
        } else if (low>='A'&&low<='F') {
            ret += (low.charCodeAt(0)-'A'.charCodeAt(0)+10);
        } else {
            check(false);
        }

        return ret;
    }

    let ret = new Uint8Array((value.length+1)/2);
    for (let i = 0; i < value.length; i+=2) {
        ret.fill(getByte(value.charAt(i), value.charAt(i+1)), i/2, i/2+1);
    }
    return ret;
}

function pad(input: string, expected_len: number): string {
    if (input.length > expected_len) {
        throw new Error("invalid length");
    }
    return input.padStart(expected_len, '0');
}

let methods = {
    uchar: function(value: number): Uint8Array {
        return new Uint8Array([]);
    },
    bool: function(value: boolean): Uint8Array {
        if (value) {
            return new Uint8Array([0x02, 0x01]);
        } else {
            return new Uint8Array([0x02, 0x00]);
        }
    },
    
    int8: function(value: number): Uint8Array {
        return new Uint8Array([0x03, value & 0xff]);
    },
    
    int16: function(value: number): Uint8Array {
        return new Uint8Array([0x04, (value >> 8) & 0xff, value & 0xff]);
    },
    
    int32: function(value: number): Uint8Array {
        return new Uint8Array(
            [0x05, (value>>24)&0xff, (value>>16)&0xff, (value>>8)&0xff, value&0xff]
        );
    },
    
    int64: function(value: number): Uint8Array {
        return new Uint8Array(
            [0x06, (value>>56)&0xff, (value>>48)&0xff, (value>>40)&0xff, (value>>32)&0xff,(value>>24)&0xff, (value>>16)&0xff, (value>>8)&0xff, value&0xff]
        );
    },
    
    // function encode_float(value: number): Uint8Array {
    //     return new Uint8Array(
    //         [0x07, (value>>24)&0xff, (value>>16)&0xff, (value>>8)&0xff, value&0xff]
    //     );
    // }
    
    // function encode_double(value: numbr): Uint8Array {
    //     return new Uint8Array(
    //         [0x08, (value>>56)&0xff, (value>>48)&0xff, (value>>40)&0xff, (value>>32)&0xff,(value>>24)&0xff, (value>>16)&0xff, (value>>8)&0xff, value&0xff]
    //     );
    // }
    
    auchar: function(value: number[]): Uint8Array {
        let ret = new Uint8Array(1+value.length);
        ret.set([0x11], 0);
        ret.set(value, 1);
    
        return ret;
    },
    
    abool: function (value: boolean[]): Uint8Array {
        let ret = new Uint8Array(1+value.length);
        ret.fill(0x12, 0, 1);
        let pos = 1;
        value.forEach(item => {
            if (item) {
                ret.set([1], pos++);
            } else {
                ret.set([0], pos++);
            }
        });
    
        return ret;
    },
    
    aint8: function(value: number[]): Uint8Array {
        let ret = new Uint8Array(1+value.length);
        ret.fill(0x13, 0, 1);
        ret.set(value, 1);
    
        return ret;
    },
    
    aint16: function(value: number[]): Uint8Array {
        let ret = new Uint8Array(1+value.length*2);
        ret.fill(0x14, 0, 1);
        let pos = 1;
        value.forEach(item => {
            ret.set(toArray(item, 2), pos);
            pos+=2;
        });
    
        return ret;
    },
    
    aint32: function(value: number[]): Uint8Array {
        let ret = new Uint8Array(1+value.length*4);
        ret.fill(0x15, 0, 1);
        let pos = 1;
        value.forEach(item => {
            ret.set(toArray(item, 4), pos);
            pos+=4;
        });
    
        return ret;
    },
    
    aint64: function(value: number[]): Uint8Array {
        let ret = new Uint8Array(1+value.length*8);
        ret.fill(0x15, 0, 1);
        let pos = 1;
        value.forEach(item => {
            ret.set(toArray(item, 8), pos);
            pos+=8;
        });
    
        return ret;
    },
    
    // function encode_afloat(value: number[]): Uint8Array {}
    // function encode_adouble(value: number[]): Uint8Array {}
    
    string: function(value: string): Buffer {
        let inner = new Uint8Array(value.length);
        for (let i = 0; i < value.length; i++) {
            inner.set([value.charCodeAt(i)], i);
        }

        return Buffer.from('21' + pad(value.length.toString(16),4) + Buffer.from(inner).toString('hex'), 'hex');
    },
    
    address: function(value: string): Uint8Array {
        let begin_pos = 0;
        if (value.charAt(0)==='0' && value.charAt(1)==='x') {
            begin_pos = 2;
        }
        let ret = new Uint8Array(1+(value.length-begin_pos+1)/2);
        ret.fill(0x22, 0, 1);
        ret.set(parseHexString(value.substr(begin_pos)), 1);
    
        return ret;
    }
};

export {methods};