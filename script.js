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
  "Serving DeFi realness on-chain. Your portfolio is giving main character energy! 💅",
  "Too fruity to fail. The blockchain can't handle all this rainbow energy! 🌈",
  "Certified rainbow wallet. Every transaction screams fabulous ✨",
  "Closet's open, the blockchain knows. Your on-chain activity is telling stories! 👀",
  "Chaotic but fabulous activity detected. Messy wallet, flawless vibes! 💖",
];

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

analyzeBtn.addEventListener("click", () => {
  const wallet = walletInput.value.trim();
  const result = analyzeWallet(wallet);
  scoreEl.textContent = result.percent + "%";
  phraseEl.textContent = result.phrase;

  progressFill.style.width = result.percent + "%";

  frontDiv.classList.add("hidden");
  backDiv.classList.remove("hidden");
});

againBtn.addEventListener("click", () => {
  backDiv.classList.add("hidden");
  frontDiv.classList.remove("hidden");

  walletInput.value = "";
  progressFill.style.width = "0%";
});
