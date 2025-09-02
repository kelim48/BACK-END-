import express from 'express';
import cors from 'cors';
import { Connection, PublicKey } from '@solana/web3.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Prefer your own env var, else default to Shyft free RPC
const RPC_URL = "https://mainnet.helius-rpc.com/?api-key=be7ebf23-34de-415c-9919-8a1a0389f396";
const connection = new Connection(RPC_URL, 'confirmed');

function generatePhrase(data) {
  let parts = [];
  if (data.nfts > 5) parts.push("This wallet is a gallery of rainbow treasures.");
  if (data.dexInteractions > 5) parts.push("Serving DeFi realness on-chain.");
  if (data.txCount > 50) parts.push("Chaotic but fabulous activity detected.");
  if (data.uniquePrograms > 10) parts.push("Exploring every corner of Solana nightlife.");
  if (parts.length === 0) parts.push("Quiet wallet, but still a little fruity.");
  return parts.join(" ");
}

app.get('/api/analyze', async (req, res) => {
  try {
    const address = req.query.address;
    if (!address) return res.status(400).json({ error: 'address required' });

    const pub = new PublicKey(address);

    // recent signatures
    const sigs = await connection.getSignaturesForAddress(pub, { limit: 50 });
    const txCount = sigs.length;

    // parse a few transactions
    const sigStrings = sigs.map(s => s.signature);
    const parsed = sigStrings.length
      ? await connection.getParsedTransactions(sigStrings.slice(0, 20))
      : [];

    const uniquePrograms = new Set();
    let dexInteractions = 0;
    for (const t of parsed) {
      if (!t) continue;
      const msg = t.transaction.message;
      for (const instr of msg.instructions || []) {
        const pid = instr.programId?.toString?.() || instr.programId;
        if (pid) uniquePrograms.add(pid);
        if (pid &&
          pid !== '11111111111111111111111111111111' &&
          pid !== 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
          dexInteractions++;
        }
      }
    }

    // token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pub, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    });

    let splTokens = tokenAccounts.value.length;
    let nfts = 0;
    for (const ta of tokenAccounts.value) {
      try {
        const amt = ta.account.data.parsed.info.tokenAmount;
        if (amt && typeof amt.uiAmount === 'number' && amt.uiAmount === 1 && amt.decimals === 0) {
          nfts++;
        }
      } catch (e) { }
    }

    const score = Math.min(100,
      txCount + uniquePrograms.size * 5 + splTokens + nfts * 10 + dexInteractions * 3
    );

    const phrase = generatePhrase({
      txCount,
      uniquePrograms: uniquePrograms.size,
      splTokens,
      nfts,
      dexInteractions
    });

    return res.json({ address, txCount, uniquePrograms: uniquePrograms.size, splTokens, nfts, dexInteractions, score, phrase });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log("Server listening on", PORT, "using RPC:", RPC_URL);
});
