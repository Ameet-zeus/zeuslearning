export function renderFooter() {
  const footer = document.createElement('footer');
  footer.innerHTML = `
    <div id="foot1">
      <a href="#" class="hyperlink">About</a> |
      <a href="#" class="hyperlink">Contact Us</a>
    </div>
    <div id="foot2">
      <p>
        <img src="/assets/icons/logo used in footer.svg" alt="Quantum Logo" id="logo-foot" />
        | Copyright © 2020-2021 <b>Zeus Systems Pvt. Ltd.</b> All rights reserved
      </p>
    </div>
  `;
  return footer;
}
