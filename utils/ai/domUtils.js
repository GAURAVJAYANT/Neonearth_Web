/**
 * Utility to clean and minimize DOM for AI processing.
 * Strips scripts and styles but KEEPS class attributes since
 * Playwright locators rely heavily on class names.
 */
function getSanitizedDOM(html) {
    let clean = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")  // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")      // Remove styles
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "[SVG]")       // Replace SVGs
        .replace(/\s\s+/g, ' ');                                                // Collapse whitespace

    // Focus on interactive elements — keep class/id/href/role/name attributes for better AI locator suggestions
    const interactiveMatches = clean.match(/<(button|input|a|select|textarea|label|span|div)[^>]*>.*?<\/\1>/gi) || [];

    return interactiveMatches.join("\n") || clean.substring(0, 5000);
}

module.exports = { getSanitizedDOM };
