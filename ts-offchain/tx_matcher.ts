import { Keypair } from "@solana/web3.js"
import { writeFileSync } from 'fs';
import Table from 'cli-table3';
import { join } from "path";

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

function mergeTransactions(transactions: MoveStakeInstruction[]): MoveStakeInstruction[]
{
    const transferMap = new Map<string, number>();
    const pubkeyMap = new Map<string, string>();

    for (const tx of transactions) {
        const forwardKey = `${tx.source_stake_pubkey}->${tx.destination_stake_pubkey}`;
        const reverseKey = `${tx.destination_stake_pubkey}->${tx.source_stake_pubkey}`;

        if (transferMap.has(reverseKey)) {
            const reverseValue = transferMap.get(reverseKey)!;
            if (reverseValue > tx.lamports_to_move) {
                transferMap.set(reverseKey, reverseValue - tx.lamports_to_move);
            } else {
                transferMap.delete(reverseKey);
                const remaining = tx.lamports_to_move - reverseValue;
                transferMap.set(forwardKey, remaining);
                pubkeyMap.set(forwardKey, tx.authorized_pubkey);
            }
        } else {
            const currentBalance = transferMap.get(forwardKey) || 0;
            transferMap.set(forwardKey, currentBalance + tx.lamports_to_move);
            pubkeyMap.set(forwardKey, tx.authorized_pubkey);
        }
    }

    return reconstructMap(transferMap, pubkeyMap);
}
function reconstructMap(transferMap: Map<string, number>, pubkeyMap: Map<string, string>) {
    const netTransactions: MoveStakeInstruction[] = [];
    for (const [key, lamports] of transferMap) {
        const [source, destination] = key.split('->');
        if (lamports !== 0) {
            netTransactions.push({
                source_stake_pubkey: source,
                destination_stake_pubkey: destination,
                lamports_to_move: lamports,
                authorized_pubkey: pubkeyMap.get(key)!
            });
        }
    }
    return netTransactions;
}

function visualizeTransfers({ transactions, writeToFile }: { transactions: MoveStakeInstruction[]; writeToFile: boolean }) //transactions: MoveStakeInstruction[], writeToFile: boolean) {
{
    //const maxRowsNumber = 5;
    const table = new Table({
        head: [ 
            '(index)',
            'source_stake_pubkey',
            'lamports_to_move',
            'destination_stake_pubkey',
            'authorized_pubkey',
        ],
        colWidths: [10, 50, 15, 50, 20],
    })

    transactions.forEach((tx, index) => { //.slice(0, maxRowsNumber)
        table.push([
            index,
            tx.source_stake_pubkey,
            `--(${tx.lamports_to_move})-->`,
            tx.destination_stake_pubkey,
            tx.authorized_pubkey,
        ]);
    });

    console.log(table.toString());
    if(writeToFile)
        writeFileSync(join(__dirname, 'transaction_data.json'), table.toString())
}

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

function performTransactionMatching() {
    
    const transactions = deserializeTransactions(testData);
    const mergedTx = mergeTransactions(transactions);

    // console.log("Our initial data with transactions:")
    // console.table(transactions)
    console.log("Representation transactions as transfers:")
    visualizeTransfers({transactions, writeToFile: true})
    console.log("What transactions' data looks like after matching:")
    console.table(mergedTx)
}

performTransactionMatching();
console.log("Finished transaction matching.");