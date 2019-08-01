As part of aion compliance kit, this document describes avm integration needs in detail.

## 0 Conventions:

- operation ID: [group-number]
- abbreviation of multiple operations: [group-[x, y]], represents [group-x], [group-(x+1)], ... , [group-(y-1)], [group-y]
- Rm: Result of AVM
    - Rm.S: status code
    - Rm.E: energy used
    - Rm.D: return data
    - Rm.L: logs
- Priority:
    - x: avm internal or for debug use
    - xx: getter or computation ops
    - xxx: operations or signals which implicitly affect global state
    - xxxx: operations which explicitly affect global state

## 1 Motivation

keep State Root and Receipt Root the same among multiple Aion Blockchain clients.

## 1 Global variables

The global variables are initialized in kernel. They **MUST** be correct to ensure avm execution.

- [1-1] get_address: xx
- [1-2] get_caller: xx
- [1-3] get_origin: xx
- [1-4] get_enrgylimit: xx
- [1-5] get_energyprice: xx
- [1-6] get_value: xx
- [1-7] get_data: xx
- [1-8] get_blocktimestamp: xx
- [1-9] get_blocknumber: xx
- [1-10] get_blockenergylimit: xx
- [1-11] get_blockcoinbase: xx
- [1-12] get_blockdifficulty: xx

## 2 Atomic Operations

- [2-1] put_storage: xxxx
- [2-2] get_storage: xxxxx
- [2-3] get_balance: xxxxx
- [2-4] get_balanceofthiscontract: xxxxx
- [2-5] get_codesize: x
- [2-6] get_remainingenergy: xx
- [2-7] log: xxxx
- [2-8] log1: xxxx
- [2-9] log2: xxxx
- [2-10] log3: xxxx
- [2-11] log4: xxxx
- [2-12] blake2b: xx
- [2-13] sha256: xx
- [2-14] keccak256: xx
- [2-15] edverify: xx
- [2-16] revert: xxx
- [2-17] invalid: xxx
- [2-18] print: x
- [2-19] println: x

## 3 Composite Operations

- [3-1] call: xxx
- [3-2] create: xxxx
- [3-3] selfdestruct: xxxx

## 4 Exceptions

all exceptions must be correctly handled, including gas cost and global state.

### 4.1 Inner Signals

- success
- rejected
- rejected_insufficient_balance
- rejected_invalid_nonce
- failed
- failed_invalid_data
- failed_out_of_energy
- failed_out_of_stack
- failed_call_depth_limit_exceeded
- failed_revert
- failed_invalid
- failed_exception
- failed_rejected
- failed_abort
- failed_unexpected
- **any hidden exceptions which are not dealed**

### 4.2 Interface Signals

- [4-1] success: xxx
- [4-2] failure (all inner signals except success): xxx

## 5 Test Flow

- 1. base environment: [1-[1,12]]
- 2. computation: [2-[12,15]]
- 3. status code: [2-16], [2-17], [4-1], [4-2]
- 4. contract: [2-[1,11]], [3-[1,3]]

step 3 and 4 should compare results with another kind of client
