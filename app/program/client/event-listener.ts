import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import type { ShiftStakeBookkeeper } from "../target/types/shift_stake_bookkeeper";
import BN from "bn.js";
import { Command } from "commander";

// Store received transactions
interface StakeTransfer {
    from: string;
    to: string;
    amount: string;
    timestamp: number;
}

let receivedTransfers: StakeTransfer[] = [];
let processedTransfers = new Set<string>();

// Configure the connection
const connection = new web3.Connection("https://api.devnet.solana.com", "confirmed");
const wallet = new anchor.Wallet(
    Keypair.fromSecretKey(
        Buffer.from(
            JSON.parse(
                require('fs').readFileSync(
                    '/root/.config/solana/id.json',
                    'utf-8'
                )
            )
        )
    )
);
const provider = new anchor.AnchorProvider(connection, wallet, {});
anchor.setProvider(provider);

const idl = require("../target/idl/shift_stake_bookkeeper.json");
const programId = new PublicKey("YrN37FF9AdJZrqxSeWsrLWJ6UEp2ZEZPwqkPcUu3YQY");
const program = new anchor.Program(idl, provider) as anchor.Program<ShiftStakeBookkeeper>;

// Now add CLI commands after all initialization
const program_cli = new Command();

program_cli
    .name('event-listener')
    .description('Event listener for the shift stake bookkeeper program')
    .version('1.0.0');

program_cli
    .command('listen')
    .description('Listen for events from the shift stake bookkeeper program')
    .action(async () => {
        console.log('Starting event-listener...');
        startEventListener().catch(console.error);
    })

program_cli
    .command('optmize')
    .description('Optimize stake transfers')
    .action(async () =>
    {
        console.log('Optimizing stake transfers...');
        // const cycles = findDirectCycles(receivedTransfers);
        // const triangleCycles = findTriangleCycles(receivedTransfers);
        const directCycles = findDirectCycles(receivedTransfers);
        await processOptimizedTransfers(directCycles);
    })

    
program_cli
.command('count')
.description('Get the current request count')
.action(async () => {
    const [bookkeeperPublicKey] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("solana_beach"), Buffer.from("user_3234989")],
        program.programId
    );
    
    try {
        const bookkeeper = await program.account.bookkeeper.fetch(bookkeeperPublicKey);
        console.log(`Current request count: ${bookkeeper.requestCount.toString()}`);
    } catch (error) {
        console.error("Error fetching request count:", error);
    }
});


if(require.main === module)    
    program_cli.parse(process.argv);

function findDirectCycles(transfers: StakeTransfer[]): { from: string, to: string }[] {
    const cycles: { from: string, to: string }[] = [];
    const transferMap = new Map<string, string[]>();
    const processedCycles = new Set<string>();

    // Build transfer map
    transfers.forEach(transfer => {
        if (!transferMap.has(transfer.from)) {
            transferMap.set(transfer.from, []);
        }
        transferMap.get(transfer.from)!.push(transfer.to);
    });

    // Find direct cycles (A -> B -> A)
    transfers.forEach(transfer => {
        const from = transfer.from;
        const to = transfer.to;
        
        if (transferMap.get(to)?.includes(from)) {
            // Sort points to create a unique identifier for the cycle
            const cyclePoints = [from, to].sort();
            const cycleKey = cyclePoints.join('-');

            // Only process this cycle if we haven't seen it before
            if (!processedCycles.has(cycleKey)) {
                processedCycles.add(cycleKey);
                cycles.push({ from, to });
                console.log("\n=== Direct Cycle Detected! ===");
                console.log(`${from} → ${to} → ${from}`);
                console.log("Amount flow:");
                console.log(`${findAmount(transfers, from, to)} SOL: ${from} → ${to}`);
                console.log(`${findAmount(transfers, to, from)} SOL: ${to} → ${from}`);
                console.log("==============================\n");
            }
        }
    });

    return cycles;
}

function findTriangleCycles(transfers: StakeTransfer[]): { points: string[] }[] {
    const cycles: { points: string[] }[] = [];
    const transferMap = new Map<string, string[]>();
    const processedCycles = new Set<string>();

    // Build transfer map
    transfers.forEach(transfer => {
        if (!transferMap.has(transfer.from)) {
            transferMap.set(transfer.from, []);
        }
        transferMap.get(transfer.from)!.push(transfer.to);
    });

    // Find triangle cycles (A -> B -> C -> A)
    transfers.forEach(t1 => {
        const a = t1.from;
        const b = t1.to;
        
        transferMap.get(b)?.forEach(c => {
            if (transferMap.get(c)?.includes(a)) {
                // Sort points to create a unique identifier for the cycle
                const cyclePoints = [a, b, c].sort();
                const cycleKey = cyclePoints.join('-');

                // Only process this cycle if we haven't seen it before
                if (!processedCycles.has(cycleKey)) {
                    processedCycles.add(cycleKey);
                    cycles.push({ points: [a, b, c] });
                    console.log("\n=== Triangle Cycle Detected! ===");
                    console.log(`${a} → ${b} → ${c} → ${a}`);
                    console.log("Amount flow:");
                    console.log(`${findAmount(transfers, a, b)} SOL: ${a} → ${b}`);
                    console.log(`${findAmount(transfers, b, c)} SOL: ${b} → ${c}`);
                    console.log(`${findAmount(transfers, c, a)} SOL: ${c} → ${a}`);
                    console.log("===============================\n");
                }
            }
        });
    });

    return cycles;
}

// Helper function to find transfer amount between two validators
function findAmount(transfers: StakeTransfer[], from: string, to: string): string {
    const transfer = transfers.find(t => t.from === from && t.to === to);
    return transfer ? (Number(transfer.amount) / 1000000000).toFixed(2) : "unknown";
}

// Add these new interfaces and functions

interface OptimizedTransfer {
    from: string;
    to: string;
    netAmount: BN;  // Net amount after cancelling out mutual transfers
}

async function processOptimizedTransfers(cycles: { from: string, to: string }[]) {
    for (const cycle of cycles) {
        // Create a unique key for this transfer pair
        const transferKey = [cycle.from, cycle.to].sort().join('-');
        
        // Skip if we've already processed this transfer pair
        if (processedTransfers.has(transferKey)) {
            console.log(`Skipping already processed transfer pair: ${transferKey}`);
            continue;
        }

        const transfer1 = receivedTransfers.find(t => 
            t.from === cycle.from && t.to === cycle.to
        );
        const transfer2 = receivedTransfers.find(t => 
            t.from === cycle.to && t.to === cycle.from
        );

        if (transfer1 && transfer2) {
            // Add to processed transfers before processing
            processedTransfers.add(transferKey);

            const amount1 = new BN(transfer1.amount);
            const amount2 = new BN(transfer2.amount);
            
            // Calculate net transfer
            if (amount1.gt(amount2)) {
                const netAmount = amount1.sub(amount2);
                console.log(`\nOptimizing transfers between ${cycle.from} and ${cycle.to}`);
                console.log(`Net transfer: ${netAmount.toString()} lamports from ${cycle.from} to ${cycle.to}`);
                
                try {
                    await sendOptimizedTransfer({
                        from: cycle.from,
                        to: cycle.to,
                        netAmount
                    });
                } catch (error) {
                    console.error("Failed to send optimized transfer:", error);
                }
            } else if (amount2.gt(amount1)) {
                const netAmount = amount2.sub(amount1);
                console.log(`\nOptimizing transfers between ${cycle.to} and ${cycle.from}`);
                console.log(`Net transfer: ${netAmount.toString()} lamports from ${cycle.to} to ${cycle.from}`);
                
                try {
                    await sendOptimizedTransfer({
                        from: cycle.to,
                        to: cycle.from,
                        netAmount
                    });
                } catch (error) {
                    console.error("Failed to send optimized transfer:", error);
                }
            } else {
                console.log(`\nTransfers cancel out completely between ${cycle.from} and ${cycle.to}`);
            }
        }
    }
}

async function sendOptimizedTransfer(transfer: OptimizedTransfer) {
    const [bookkeeperPublicKey] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("solana_beach"), Buffer.from("user_3234989")],
        program.programId
    );

    const moveStakeInstruction = {
        sourceStakePubkey: new PublicKey(transfer.from),
        destinationStakePubkey: new PublicKey(transfer.to),
        authorizedPubkey: program.provider.publicKey,
        lamportsToMove: transfer.netAmount,
    };

    const request_keypair = web3.Keypair.generate();
    
    try {
        const tx = await program.methods
            .createRequest(moveStakeInstruction)
            .accountsPartial({
                request: request_keypair.publicKey,
                user: program.provider.publicKey,
                systemProgram: web3.SystemProgram.programId,
                bookkeeper: bookkeeperPublicKey,
            })
            .signers([request_keypair])
            .rpc();

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log("Optimized transfer sent:", tx);
        return tx;
    } catch (error) {
        if (error.toString().includes('429')) {
            console.log("Rate limit hit, waiting 10 seconds...");
            await new Promise(resolve => setTimeout(resolve, 10000));
            return sendOptimizedTransfer(transfer);  // Retry
        }
        console.error("Error sending optimized transfer:", error);
        throw error;
    }
}

// Modify the event listener to check timestamps
async function startEventListener() {
    console.log("Starting to listen for events...");
    
    const eventListener = program.addEventListener("onRequestAdded", async (event, slot) => {
        // Only process events from the last hour
        const currentTime = Math.floor(Date.now() / 1000);
        const eventTime = event.timestamp.toNumber();
        
        if (currentTime - eventTime > 3600) {
            console.log("Skipping old event");
            return;
        }

        // Log the event
        console.log("\n=== New Request Added ===");
        console.log("Slot:", slot);
        console.log("Message:", event.message);
        console.log("Request Pubkey:", event.requestPubkey.toString());
        console.log("Request Count:", event.requestCount.toString());
        console.log("From:", event.sourceStakePubkey.toString());
        console.log("To:", event.destinationStakePubkey.toString());
        console.log("Amount:", event.lamportsToMove.toString());
        console.log("Timestamp:", new Date(event.timestamp.toNumber() * 1000).toISOString());
        console.log("========================\n");

        // Add to transfers list
        receivedTransfers.push({
            from: event.sourceStakePubkey.toString(),
            to: event.destinationStakePubkey.toString(),
            amount: event.lamportsToMove.toString(),
            timestamp: event.timestamp.toNumber()
        });

        // Check for cycles
        const directCycles = findDirectCycles(receivedTransfers);
        const triangleCycles = findTriangleCycles(receivedTransfers);

        if (directCycles.length > 0) {
            console.log("\nProcessing optimized transfers for direct cycles...");
            await processOptimizedTransfers(directCycles);
        }

        // You could add similar optimization for triangle cycles

        if (directCycles.length > 0 || triangleCycles.length > 0) {
            console.log("\n!!! Cycles Summary !!!");
            console.log(`Direct cycles found: ${directCycles.length}`);
            console.log(`Triangle cycles found: ${triangleCycles.length}`);
        }
    });

    // Handle shutdown
    process.on('SIGINT', async () => {
        console.log('\nCaught interrupt signal');
        await program.removeEventListener(eventListener);
        
        // Final cycle check
        console.log("\nFinal cycle analysis:");
        findDirectCycles(receivedTransfers);
        findTriangleCycles(receivedTransfers);
        
        process.exit();
    });

    // Stay alive
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// console.log("Starting event listener with cycle detection...");
// startEventListener().catch(console.error); 