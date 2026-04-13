const AIEngine = require('./utils/ai');
const { log } = require('./utils/helpers/logger');

class AIReporter {
  async onTestEnd(test, result) {
    if (result.status !== 'passed' && result.status !== 'skipped') {
      const isLastRetry = result.retry === test.retries;
      const retryStatus = `[Retry ${result.retry}/${test.retries}]`;
      
      log(`🚨 AI Reporter: ${retryStatus} Test "${test.title}" failed. Analyzing...`);
      
      const errorMessage = result.errors[0]?.message || 'Unknown error';
      
      try {
        // Deep analysis including retry context
        const prompt = `
          The test "${test.title}" failed.
          Error: ${errorMessage}
          Retry Attempt: ${result.retry} of ${test.retries}.
          
          Please analyze this failure and provide:
          1. ROOT CAUSE: Why did it fail?
          2. SMART RETRY ADVICE: Is this a flaky issue (network/timing) that a retry will fix, or a hard bug?
          3. RECOMMENDED FIX: What should the developer change?
        `;

        const analysis = await AIEngine.ask(prompt);
        
        // Log to console for immediate visibility
        console.log(`\n--- 🤖 AI SMART ANALYSIS ${retryStatus} ---\n${analysis}\n------------------------------------------\n`);

        // Attach to Playwright result so it shows up in reports
        result.attachments.push({
          name: 'AI Failure Analysis',
          contentType: 'text/plain',
          body: Buffer.from(analysis)
        });

      } catch (err) {
        log(`❌ AI Reporter: Analysis failed: ${err.message}`);
      }
    }
  }
}

module.exports = AIReporter;
