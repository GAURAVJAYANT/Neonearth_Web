const { exec } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

class AllureOpenReporter {
    async onBegin(config, suite) {
        if (process.env.CI) return;
        console.log('\n🧹 Preparing for fresh test run...');
        const resultsDir = path.resolve('allure-results');
        if (fs.existsSync(resultsDir)) {
            try {
                fs.rmSync(resultsDir, { recursive: true, force: true });
                console.log('🗑️  Wiped last results. Ready for a fresh report.');
            } catch (err) {
                console.error('⚠️ Could not wipe allure-results:', err.message);
            }
        }
    }

    async onEnd(result) {
        console.log('🏁 Playwright execution finished. Hook: onEnd triggered.');
        if (process.env.CI) return;

        const projectDir = process.cwd();
        const port = Math.floor(Math.random() * 999) + 9000;
        const batchFilePath = path.join(projectDir, 'open_allure.bat');
        
        try {
            const isWin = os.platform() === 'win32';
            if (isWin) {
                console.log(`🚀 Creating Allure trigger batch file (Port: ${port})...`);
                
                // Create a batch file that:
                // 1. Clears JAVA_HOME completely
                // 2. Runs npx allure serve
                // 3. Deletes itself (optional, but cleaner)
                const npxPath = 'C:\\Program Files\\nodejs\\npx.cmd';
                const batchContent = `@echo off\n` +
                    `SET JAVA_HOME=\n` +
                    `echo Opening Allure Report on port ${port}...\n` +
                    `"${npxPath}" allure serve allure-results -p ${port}\n`;
                
                fs.writeFileSync(batchFilePath, batchContent);

                // Run the batch file in a new minimized window
                console.log(`  Executing: start /min "" "${batchFilePath}"`);
                exec(`start /min "" "${batchFilePath}"`, { cwd: projectDir });
                
                // Note: We don't delete the batch file immediately as the 'start' command 
                // needs time to read it. It can be cleaned up in next onBegin.
            } else {
                console.log(`🚀 Launching Allure on Linux/Mac (Port: ${port})...`);
                const { spawn } = require('child_process');
                const allureProcess = spawn('npx', ['allure', 'serve', 'allure-results', '-p', port.toString()], {
                    cwd: projectDir,
                    detached: true,
                    stdio: 'ignore'
                });
                allureProcess.unref();
            }

            console.log('✅ Allure trigger sent! If the browser still does not open, check if Java is installed.');
        } catch (err) {
            console.error('❌ Fatal error in Allure reporter:', err.message);
        }
    }
}

module.exports = AllureOpenReporter;
