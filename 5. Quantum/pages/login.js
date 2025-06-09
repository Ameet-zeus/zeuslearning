import { renderFooter } from "../component/footer.js";

const container2 = document.getElementById("footer-container");
container2.appendChild(renderFooter());


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const eyeIcon = document.getElementById("eye-icon");
  const passwordInput = document.getElementById("pass");

  eyeIcon.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    const eyeImg = eyeIcon.querySelector("img");
    eyeImg.src = "/assets/icons/preview.svg";
  });

  form.addEventListener("submit", (event) => {
    const loginType = document.querySelector(
      'input[name="login-type"]:checked'
    );
    if (!loginType) {
      event.preventDefault();
      alert("Please select a login type.");
      document.querySelector('label[for="district-radio"]').focus();
    }
    else {
          window.location.href = 'home.html';
          event.preventDefault();
    }
  });
});
