const walletInput = document.getElementById("wallet");
const analyzeBtn = document.getElementById("analyze");
const loadingDiv = document.getElementById("loading");
const backDiv = document.getElementById("back");
const frontDiv = document.getElementById("front");
const scoreEl = document.getElementById("score");
const phraseEl = document.getElementById("phrase");
const progressFill = document.getElementById("progressFill");
const shareBtn = document.getElementById("share");
const downloadBtn = document.getElementById("download");
const againBtn = document.getElementById("again");

const phrases = [
  "Serving DeFi realness on-chain.",
  "Too fruity to fail.",
  "Certified rainbow wallet.",
  "Closet’s open, the blockchain knows.",
  "Chaotic but fabulous activity detected.",
  "Exploring every corner of Solana nightlife.",
  "Low-key but still sparkling with pride."
];
function isValidSolanaAddress(addr) {
  const base58regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58regex.test(addr);
}

function hashWallet(str) {
  let hash = 5381;
  str = str.trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0;
}

function analyzeWallet(wallet) {
  const h = hashWallet(wallet);
  const percent = h % 101;
  const phrase = phrases[(h >> 8) % phrases.length];
  return { percent, phrase };
}

const steps = [
  "Analyzing wallet activities...",
  "Analyzing token holdings...",
  "Analyzing transactions...",
  "Adding extra fruity metrics..."
];

analyzeBtn.addEventListener("click", () => {
 const wallet = walletInput.value.trim();
if (!isValidSolanaAddress(wallet)) {
  alert("Please enter a valid Solana wallet address.");
  return;
}
  frontDiv.querySelector("input").disabled = true;
  analyzeBtn.disabled = true;
  loadingDiv.classList.remove("hidden");
  loadingDiv.innerHTML = "";
  let idx = 0;

  const interval = setInterval(() => {
    if (idx < steps.length) {
      const p = document.createElement("p");
      p.textContent = steps[idx];
      loadingDiv.appendChild(p);
      idx++;
    } else {
      clearInterval(interval);
      const result = analyzeWallet(wallet);
      scoreEl.textContent = result.percent + "%";
      phraseEl.textContent = result.phrase;
      progressFill.style.width = result.percent + "%";
      frontDiv.classList.add("hidden");
      backDiv.classList.remove("hidden");
    }
  }, 1000);
});

againBtn.addEventListener("click", () => { window.location.reload(); });

shareBtn.addEventListener("click", () => {
  html2canvas(document.querySelector("#back")).then(canvas => {
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "gayness-result.png";
    a.click();
    alert("Image downloaded. Upload it manually to Twitter with your tweet!");
  });
});

downloadBtn.addEventListener("click", () => {
  html2canvas(document.querySelector("#back")).then(canvas => {
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "gayness-result.png";
    a.click();
  });
});
