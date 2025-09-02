import express from 'express';
import cors from 'cors';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RPC_URL = process.env.RPC_URL || clusterApiUrl('mainnet-beta');
const connection = new Connection(RPC_URL, 'confirmed');

function generatePhrase(data){
  let parts = [];
  if (data.nfts > 5) parts.push("This wallet is a gallery of rainbow treasures.");
  if (data.dexInteractions > 5) parts.push("Serving DeFi realness on-chain.");
  if (data.txCount > 50) parts.push("Chaotic but fabulous activity detected.");
  if (data.uniquePrograms > 10) parts.push("Exploring every corner of Solana nightlife.");
  if (parts.length===0) parts.push("Quiet wallet, but still a little fruity.");
  return parts.join(" ");
}

app.get('/api/analyze', async (req, res) => {
  try {
    const address = req.query.address;
    if (!address) return res.status(400).json({error: 'address required'});
    const pub = new PublicKey(address);
    const sigs = await connection.getSignaturesForAddress(pub, {limit: 50});
    const txCount = sigs.length;
    const txs = [];
    const sigStrings = sigs.map(s=>s.signature);
    if(sigStrings.length){
      const parsed = await connection.getParsedTransactions(sigStrings.slice(0,20));
      parsed.forEach(p => { if (p) txs.push(p); });
    }
    const uniquePrograms = new Set();
    let dexInteractions = 0;
    for (const t of txs){
      const msg = t.transaction.message;
      for (const instr of (msg.instructions||[])){
        let pid = instr.programId?.toString?.() || instr.programId;
        if(pid) uniquePrograms.add(pid);
        if(pid && pid !== '11111111111111111111111111111111' && pid !== 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'){
          dexInteractions++;
        }
      }
    }
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pub, {programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')});
    let splTokens = tokenAccounts.value.length;
    let nfts = 0;
    for (const ta of tokenAccounts.value){
      try {
        const amt = ta.account.data.parsed.info.tokenAmount;
        if (amt && typeof amt.uiAmount === 'number' && amt.uiAmount === 1 && amt.decimals === 0) nfts++;
      } catch(e){}
    }
    const score = Math.min(100, txCount + uniquePrograms.size*5 + splTokens + nfts*10 + dexInteractions*3);
    const phrase = generatePhrase({txCount, uniquePrograms:uniquePrograms.size, splTokens, nfts, dexInteractions});
    return res.json({address, txCount, uniquePrograms:uniquePrograms.size, splTokens, nfts, dexInteractions, score, phrase});
  } catch(e){
    console.error(e);
    return res.status(500).json({error: e.message});
  }
});

app.listen(PORT, ()=>{
  console.log("Server listening on", PORT);
});