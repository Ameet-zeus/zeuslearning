import { renderFooter } from "../component/footer";

// RENDER FOOTER
const container2 = document.getElementById("footer-container");
if (container2) {
  container2.appendChild(renderFooter());
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form") as HTMLFormElement | null;
  const eyeIcon = document.getElementById("eye-icon") as HTMLElement | null;
  const passwordInput = document.getElementById("pass") as HTMLInputElement | null;

  if (eyeIcon && passwordInput) {
    eyeIcon.addEventListener("click", () => {
      const isVisible = passwordInput.type === "text";
      passwordInput.type = isVisible ? "password" : "text";

      const eyeImg = eyeIcon.querySelector("img") as HTMLImageElement | null;
      if (eyeImg) {
        eyeImg.src = "/assets/icons/preview.svg";
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (event: Event) => {
      const loginType = document.querySelector<HTMLInputElement>(
        'input[name="login-type"]:checked'
      );

      if (!loginType) {
        event.preventDefault();
        alert("Please select a login type.");
        const label = document.querySelector<HTMLLabelElement>('label[for="district-radio"]');
        label?.focus();
      } else {
        event.preventDefault();
        window.location.href = "home.html";
      }
    });
  }
});
