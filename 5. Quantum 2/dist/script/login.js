import { renderFooter } from "../component/footer";
// RENDER FOOTER
const container2 = document.getElementById("footer-container");
if (container2) {
    container2.appendChild(renderFooter());
}
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const eyeIcon = document.getElementById("eye-icon");
    const passwordInput = document.getElementById("pass");
    if (eyeIcon && passwordInput) {
        eyeIcon.addEventListener("click", () => {
            const isVisible = passwordInput.type === "text";
            passwordInput.type = isVisible ? "password" : "text";
            const eyeImg = eyeIcon.querySelector("img");
            if (eyeImg) {
                eyeImg.src = "/assets/icons/preview.svg";
            }
        });
    }
    if (form) {
        form.addEventListener("submit", (event) => {
            const loginType = document.querySelector('input[name="login-type"]:checked');
            if (!loginType) {
                event.preventDefault();
                alert("Please select a login type.");
                const label = document.querySelector('label[for="district-radio"]');
                label === null || label === void 0 ? void 0 : label.focus();
            }
            else {
                event.preventDefault();
                window.location.href = "home.html";
            }
        });
    }
});
