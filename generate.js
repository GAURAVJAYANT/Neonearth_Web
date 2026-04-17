require('dotenv').config();
const AIEngine = require('./utils/ai');

const story = process.argv[2];

if (!story) {
  console.error('Usage: node generate.js "your user story or test requirement"');
  process.exit(1);
}

(async () => {
    try {
        await AIEngine.generateTest(story);
        console.log('---');
        console.log('✅ AI Test Engine: Generation complete.');
    } catch (err) {
        console.error('❌ AI Test Engine: Generation failed:', err.message);
    }
})();
