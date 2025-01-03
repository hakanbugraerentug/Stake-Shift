import {AnchorProvider, Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {IDL, Counter, CounterProgram} from './counter'
import {clusterApiUrl, Connection, PublicKey} from '@solana/web3.js'
import { Buffer } from 'buffer'

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
// Create a dummy wallet for local testing
const wallet = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: () => Promise.reject(),
  signAllTransactions: () => Promise.reject(),
}

let provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())

export type CounterData = {
  count: number;
  bump: number;
}

export const program = new Program<Counter>(IDL, provider) as CounterProgram

export const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('counter')],
    program.programId
)