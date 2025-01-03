import { Keypair, PublicKey } from "@solana/web3.js"

class MoveStakeInstruction {
    constructor(
        public source_stake_pubkey: string,
        public destination_stake_pubkey: string,
        public authorized_pubkey: string,
        public lamports_to_move: number
    ) {}
}

function deserializeTransactions(data: string): MoveStakeInstruction[] {
    return JSON.parse(data).map((tx: any) => new MoveStakeInstruction(
        tx.source_stake_pubkey,
        tx.destination_stake_pubkey,
        tx.authorized_pubkey,
        tx.lamports_to_move
    ));
}

function findCyclicStakeTransfers(transactions: MoveStakeInstruction[]): { source: string, destination: string }[] {
    const cyclicTransfers: { source: string, destination: string }[] = [];

    // Create a map of source to destination
    const transferMap = new Map<string, string>();
    transactions.forEach(tx => {
        transferMap.set(tx.source_stake_pubkey, tx.destination_stake_pubkey);
    });

    // Check for cycles
    transactions.forEach(tx => {
        const source = tx.source_stake_pubkey;
        const destination = tx.destination_stake_pubkey;

        if (transferMap.get(destination) === source) {
            cyclicTransfers.push({ source, destination });
        }
    });

    return cyclicTransfers;
}

function findMutualTransactions(transactions: MoveStakeInstruction[]){
    var mutualTransactions: HashTable<MoveStakeInstruction> = {}

    transactions.forEach(transaction => {
        mutualTransactions[transaction.authorized_pubkey]
    });
}

interface HashTable<T> {
    [key: string]: T;
}

function testCyclicStakeTransfers() {
    const stakePubkeyA = Keypair.generate().publicKey;
    const stakePubkeyB = Keypair.generate().publicKey;
    const stakePubkeyC = Keypair.generate().publicKey;
    const stakePubkeyD = Keypair.generate().publicKey;

    const authorityPubkeyA = Keypair.generate().publicKey;
    const authorityPubkeyB = Keypair.generate().publicKey;
    const authorityPubkeyC = Keypair.generate().publicKey;
    const authorityPubkeyD = Keypair.generate().publicKey;

    const testData = JSON.stringify([
        { source_stake_pubkey: stakePubkeyA, destination_stake_pubkey: stakePubkeyB, authorized_pubkey: authorityPubkeyA, lamports_to_move: 100 },
        { source_stake_pubkey: stakePubkeyB, destination_stake_pubkey: stakePubkeyA, authorized_pubkey: authorityPubkeyB, lamports_to_move: 150 },
        { source_stake_pubkey: stakePubkeyC, destination_stake_pubkey: stakePubkeyD, authorized_pubkey: authorityPubkeyC, lamports_to_move: 200 },
        { source_stake_pubkey: stakePubkeyD, destination_stake_pubkey: stakePubkeyC, authorized_pubkey: authorityPubkeyD, lamports_to_move: 300 }
    ]);

    const transactions = deserializeTransactions(testData);
    const cyclicTransfers = findCyclicStakeTransfers(transactions);

    console.log(JSON.stringify(transactions))
    console.assert(cyclicTransfers.length === 1, `Expected 1 cyclic transfer, found ${cyclicTransfers.length}`);
    console.assert(cyclicTransfers[0].source === "A" && cyclicTransfers[0].destination === "B",
        `Unexpected cyclic transfer: ${JSON.stringify(cyclicTransfers)}`);
}

testCyclicStakeTransfers();
console.log("Tests have passed!");