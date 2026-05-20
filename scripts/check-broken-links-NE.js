const { chromium, request } = require('@playwright/test');
const fs = require('fs');

async function checkUrl(requestContext, url) {
    try {
        if (!url.startsWith('http')) return { url, status: 'Skipped', ok: true };
        
        // Use GET request with timeouts to check status quickly
        const response = await requestContext.get(url, { 
            maxRedirects: 5, 
            timeout: 10000 
        });
        
        return { url, status: response.status(), ok: response.ok() };
    } catch (error) {
        return { url, status: 'Error', ok: false, error: error.message };
    }
}

async function checkUrlBatch(requestContext, urls) {
    const BATCH_SIZE = 10;
    const results = [];
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        const batch = urls.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(url => checkUrl(requestContext, url));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }
    return results;
}

(async () => {
    const sitemapFile = process.argv[2] || 'sitemap.xml';
    console.log(`Reading ${sitemapFile}...`);
    let xml = '';
    try {
        xml = fs.readFileSync(sitemapFile, 'utf8');
    } catch (e) {
        console.error(`Could not find ${sitemapFile}. Please run the script from the directory containing it.`);
        process.exit(1);
    }
    
    // Parse URLs using regex
    const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
    const pageUrls = matches.map(m => m[1]);
    console.log(`Found ${pageUrls.length} pages to check.`);

    if (pageUrls.length === 0) {
        console.log('No URLs found in the sitemap. Exiting...');
        process.exit(0);
    }

    const browser = await chromium.launch({ headless: false });
    // Use request context for fast background network requests, bypassing DOM parsing overhead for resources
    const requestContext = await request.newContext({ ignoreHTTPSErrors: true });
    
    let allBrokenLinks = [];
    let allBrokenImages = [];

    // Process sequential to avoid opening 60 Playwright tabs at once, which could crash or be rate limited heavily
    for (let i = 0; i < pageUrls.length; i++) {
        const pageUrl = pageUrls[i];
        console.log(`\n[${i + 1}/${pageUrls.length}] Visiting: ${pageUrl}`);
        
        const page = await browser.newPage();
        try {
            // Load the page
            const response = await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
            if (!response || !response.ok()) {
                console.log(`  [!] Page itself is broken or returned non-OK status: ${response ? response.status() : 'No response'}`);
                allBrokenLinks.push({ page: pageUrl, resource: pageUrl, type: 'Page URL (from XML)', status: response ? response.status() : 'Error' });
                await page.close();
                continue;
            }

            // Extract all unique links and images
            const extracted = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a')).map(a => a.href).filter(href => href && href.startsWith('http'));
                const images = Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src && src.startsWith('http'));
                
                // Also get background images or CSS embedded images if needed, but standard img tags are normally enough for this scope.
                
                return { 
                    links: [...new Set(anchors)], 
                    images: [...new Set(images)] 
                };
            });

            console.log(`  Found ${extracted.links.length} unique links and ${extracted.images.length} unique images.`);

            // Batch check extracted links
            if (extracted.links.length > 0) {
                process.stdout.write('  Checking links... ');
                const linkResults = await checkUrlBatch(requestContext, extracted.links);
                const brokenLinks = linkResults.filter(r => !r.ok);
                brokenLinks.forEach(b => {
                    allBrokenLinks.push({ page: pageUrl, resource: b.url, type: 'Link', status: b.status, error: b.error });
                });
                console.log(`${brokenLinks.length > 0 ? '\x1b[31m' + brokenLinks.length + ' broken\x1b[0m' : '0 broken'}.`);
            }

            // Batch check extracted images
            if (extracted.images.length > 0) {
                process.stdout.write('  Checking images... ');
                const imgResults = await checkUrlBatch(requestContext, extracted.images);
                const brokenImages = imgResults.filter(r => !r.ok);
                brokenImages.forEach(b => {
                    allBrokenImages.push({ page: pageUrl, resource: b.url, type: 'Image', status: b.status, error: b.error });
                });
                console.log(`${brokenImages.length > 0 ? '\x1b[31m' + brokenImages.length + ' broken\x1b[0m' : '0 broken'}.`);
            }

        } catch (err) {
            console.log(`  [!] Error visiting page: ${err.message}`);
            allBrokenLinks.push({ page: pageUrl, resource: pageUrl, type: 'Page URL (from XML)', status: err.message });
        } finally {
            await page.close();
        }
    }

    await browser.close();
    await requestContext.dispose();

    // Print summary
    console.log('\n======================================');
    console.log('SUMMARY REPORT');
    console.log('======================================');
    console.log(`Total Pages Checked: ${pageUrls.length}`);
    console.log(`Total Broken Links: ${allBrokenLinks.length}`);
    console.log(`Total Broken Images: ${allBrokenImages.length}`);
    
    if (allBrokenLinks.length > 0) {
        console.log('\n--- BROKEN LINKS ---');
        allBrokenLinks.forEach(b => {
            const errorMsg = b.error ? ` - ${b.error}` : '';
            console.log(`[${b.status}] ${b.resource} (found on ${b.page})${errorMsg}`);
        });
    }
    
    if (allBrokenImages.length > 0) {
        console.log('\n--- BROKEN IMAGES ---');
        allBrokenImages.forEach(b => {
            const errorMsg = b.error ? ` - ${b.error}` : '';
            console.log(`[${b.status}] ${b.resource} (found on ${b.page})${errorMsg}`);
        });
    }
    
    // Save report to file
    const reportObj = {
        scanDate: new Date().toISOString(),
        totalPages: pageUrls.length,
        totalBrokenLinks: allBrokenLinks.length,
        totalBrokenImages: allBrokenImages.length,
        brokenLinks: allBrokenLinks,
        brokenImages: allBrokenImages
    };
    
    fs.writeFileSync('broken_links_report.json', JSON.stringify(reportObj, null, 2));
    console.log('\nDetailed report saved to broken_links_report.json');

})();
