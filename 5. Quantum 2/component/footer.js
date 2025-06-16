"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFooter = renderFooter;
function renderFooter() {
    var footer = document.createElement('footer');
    var currentYear = new Date().getFullYear();
    footer.innerHTML = "\n    <div id=\"foot1\">\n      <a href=\"#\" class=\"hyperlink\">About</a> |\n      <a href=\"#\" class=\"hyperlink\">Contact Us</a>\n    </div>\n    <div id=\"foot2\">\n      <p>\n        <img src=\"/assets/icons/logo used in footer.svg\" alt=\"Quantum Logo used in footer\" id=\"logo-foot\" />\n        | Copyright \u00A9 ".concat(currentYear, " <b>Zeus Systems Pvt. Ltd.</b> All rights reserved\n      </p>\n    </div>\n  ");
    return footer;
}
