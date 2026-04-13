/**
 * Utility to clean and minimize DOM for AI processing.
 */
function getSanitizedDOM(html) {
    // Basic regex-based cleanup to keep it lightweight (can be replaced with JSDOM if needed)
    let clean = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")   // Remove styles
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "[SVG]")   // Replace SVGs
        .replace(/class="[^"]*"/gi, "")                                   // Optionally remove classes to save tokens
        .replace(/\s\s+/g, ' ');                                           // Collapse whitespace

    // Focus on interactive elements (simplified)
    const interactiveMatches = clean.match(/<(button|input|a|select|textarea|label)[^>]*>.*?<\/\1>/gi) || [];
    
    return interactiveMatches.join("\n") || clean.substring(0, 5000); // Return interactive or truncated clean
}

module.exports = { getSanitizedDOM };
