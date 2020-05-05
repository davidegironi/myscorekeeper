// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

module.exports = {

  /**
   * make a random color from string
   * @param {string} str
   * @param {boolean} darkcolor
   */
  hashColor(str, darkcolor) {
    let s = str;
    if (s == null || s.length === 0) s = ' ';
    let hash = 0;
    for (let i = 0; i < s.length; i += 1) {
      // eslint-disable-next-line no-bitwise
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    // eslint-disable-next-line no-bitwise
    const c = (darkcolor
      // eslint-disable-next-line no-bitwise
      ? `5${(hash & 0x00FFFFFF).toString(16).toUpperCase().slice(-5).toString()}`
      // eslint-disable-next-line no-bitwise
      : (hash & 0x00FFFFFF).toString(16).toUpperCase());
    return `#${'00000'.substring(0, 6 - c.length)}${c}`;
  },

  /**
   * find the inversion color for an hex color
   * @param {string} hex
   * @param {boolen, blackandwhite
   */
  invertColor(hex, blackandwhite) {
    let h = hex;
    if (h.indexOf('#') === 0) h = h.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return h;
    let r = parseInt(h.slice(0, 2), 16);
    let g = parseInt(h.slice(2, 4), 16);
    let b = parseInt(h.slice(4, 6), 16);
    if (blackandwhite) {
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        ? '#000000'
        : '#FFFFFF';
    }
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    return `#${(`0${r}`).slice(-2)}${(`0${g}`).slice(-2)}${(`0${b}`).slice(-2)}`;
  },

  /**
   * add opacity to color
   * @param {string} hex
   * @param {double} opacity
   */
  opacityColor(hex, opacity) {
    let h = hex;
    if (h.indexOf('#') === 0) h = h.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return h;
    if (opacity < 0 || opacity > 1) return h;
    const r = Math.floor(
      parseInt(h.slice(0, 2), 16) * opacity + 0xff * (1 - opacity)
    ).toString(16);
    const g = Math.floor(
      parseInt(h.slice(2, 4), 16) * opacity + 0xff * (1 - opacity)
    ).toString(16);
    const b = Math.floor(
      parseInt(h.slice(4, 6), 16) * opacity + 0xff * (1 - opacity)
    ).toString(16);
    return `#${(`0${r}`).slice(-2)}${(`0${g}`).slice(-2)}${(`0${b}`).slice(-2)}`;
  }

};
