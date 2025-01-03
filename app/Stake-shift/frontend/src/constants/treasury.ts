import { Keypair, PublicKey } from '@solana/web3.js';

// Use personal wallet as treasury
export const TREASURY_PUBKEY = new PublicKey("G7H8GnCF2Z7RtRgjjucwAXTtv9WA2yZvrRd81NcpP3HX");

// You should save this somewhere secure and not commit to git
console.log('Treasury Account:', TREASURY_PUBKEY.toString()); 