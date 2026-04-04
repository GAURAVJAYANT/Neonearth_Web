const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

class AllureOpenReporter {
    // onBegin is called when Playwright starts any run (even from the Play button in VS Code)
    async onBegin(config, suite) {
        if (process.env.CI) return;

        console.log('\n🧹 Preparing for fresh test run...');
        const resultsDir = path.resolve('allure-results');

        // We wipe the results folder at the start of EVERY run
        // This stops old tests from showing up in your report!
        if (fs.existsSync(resultsDir)) {
            try {
                // We keep the history folder if we want trends, but many users prefer a total wipe.
                // To keep history trends only (without the old tests), we would preserve allure-results/history.
                // However, the user asked for a "fresh report", so we will wipe it all.
                fs.rmSync(resultsDir, { recursive: true, force: true });
                console.log('🗑️  Wiped last results. Ready for a fresh report.');
            } catch (err) {
                console.error('⚠️ Could not wipe allure-results:', err.message);
            }
        }
    }

    // onEnd is called when the run is finished
    async onEnd(result) {
        if (process.env.CI) return;

        console.log('\n==========================================');
        console.log('🚀 FINAL REPORT AUTOMATION TRIGGER');
        console.log('==========================================');

        const projectDir = process.cwd();
        const allureCmd = os.platform() === 'win32' ? 'npx.cmd' : 'npx';
        const port = Math.floor(Math.random() * 999) + 9000;

        console.log(`🏗️  Opening Fresh Allure Dashboard (Port: ${port})...`);

        // Spawn 'allure serve' natively.
        const args = ['allure', 'serve', 'allure-results', '-p', port.toString()];

        const allureProcess = spawn(allureCmd, args, {
            cwd: projectDir,
            detached: true,
            stdio: 'ignore',
            shell: true
        });

        allureProcess.unref();

        console.log('✅ Final Allure server triggered! Fresh report opening...');
        console.log('==========================================\n');
    }
}

module.exports = AllureOpenReporter;
