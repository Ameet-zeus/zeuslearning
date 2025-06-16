export function renderFooter(): HTMLElement {
  const footer = document.createElement('footer');

  const currentYear: number = new Date().getFullYear();

  footer.innerHTML = `
    <div id="foot1">
      <a href="#" class="hyperlink">About</a> |
      <a href="#" class="hyperlink">Contact Us</a>
    </div>
    <div id="foot2">
      <p>
        <img src="/assets/icons/logo used in footer.svg" alt="Quantum Logo used in footer" id="logo-foot" />
        | Copyright © ${currentYear} <b>Zeus Systems Pvt. Ltd.</b> All rights reserved
      </p>
    </div>
  `;

  return footer;
}