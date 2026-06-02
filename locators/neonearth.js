// locators/neonearth.js
module.exports = {
  navigation: {
    menuBar: 'nav.header-navigation-bar',
    tapestriesMenu: 'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Tapestries"))',
    rugsMenu: 'nav.header-navigation-bar li.top-level-item:has(span.label-text:has-text("Rugs & Mats"))',
  },
  overlays: [
    '.loading-mask',
    '.spinner',
    '.overlay',
    '.ajax-loader',
    '.loader'
  ],
};
