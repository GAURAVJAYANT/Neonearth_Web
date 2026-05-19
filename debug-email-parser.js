const fs = require('fs');
const path = require('path');

const reportPath = path.resolve('./test-results/report.json');

if (!fs.existsSync(reportPath)) {
  console.log('❌ Report file not found:', reportPath);
  process.exit(1);
}

const data = fs.readFileSync(reportPath, 'utf8');
const report = JSON.parse(data);

console.log('\n=== DEBUGGING PLAYWRIGHT REPORT ===\n');

let total = 0;
let passed = 0;
let failed = 0;
let skipped = 0;
let totalDuration = 0;

if (report.suites && Array.isArray(report.suites)) {
  console.log(`📁 Found ${report.suites.length} top-level suites\n`);
  
  report.suites.forEach((suite, suiteIdx) => {
    console.log(`\n📂 Suite ${suiteIdx}: "${suite.title}"`);
    console.log(`   Specs: ${suite.specs ? suite.specs.length : 0}`);
    console.log(`   Nested Suites: ${suite.suites ? suite.suites.length : 0}`);
    
    // Check specs at this level
    if (suite.specs && suite.specs.length > 0) {
      console.log(`   Processing ${suite.specs.length} specs...`);
      suite.specs.forEach((spec, specIdx) => {
        console.log(`     📋 Spec ${specIdx}: "${spec.title}"`);
        if (spec.tests && spec.tests.length > 0) {
          spec.tests.forEach((test, testIdx) => {
            total++;
            if (test.results && test.results[0]) {
              const status = test.results[0].status;
              console.log(`        Test ${testIdx}: status="${status}" duration=${test.results[0].duration}ms`);
              
              if (status === 'passed') {
                passed++;
              } else if (status === 'failed' || status === 'interrupted') {
                failed++;
              } else if (status === 'skipped') {
                skipped++;
              }
              totalDuration += test.results[0].duration || 0;
            }
          });
        }
      });
    }
    
    // Check nested suites
    if (suite.suites && suite.suites.length > 0) {
      console.log(`   Processing ${suite.suites.length} nested suites...`);
      suite.suites.forEach((nestedSuite, nestedIdx) => {
        console.log(`     🗂️  Nested Suite ${nestedIdx}: "${nestedSuite.title}"`);
        console.log(`        Specs: ${nestedSuite.specs ? nestedSuite.specs.length : 0}`);
        
        if (nestedSuite.specs && nestedSuite.specs.length > 0) {
          nestedSuite.specs.forEach((spec, specIdx) => {
            console.log(`          📋 Spec ${specIdx}: "${spec.title}"`);
            if (spec.tests && spec.tests.length > 0) {
              spec.tests.forEach((test, testIdx) => {
                total++;
                if (test.results && test.results[0]) {
                  const status = test.results[0].status;
                  console.log(`             Test ${testIdx}: status="${status}" duration=${test.results[0].duration}ms`);
                  
                  if (status === 'passed') {
                    passed++;
                  } else if (status === 'failed' || status === 'interrupted') {
                    failed++;
                  } else if (status === 'skipped') {
                    skipped++;
                  }
                  totalDuration += test.results[0].duration || 0;
                }
              });
            }
          });
        }
      });
    }
  });
}

console.log('\n=== FINAL COUNTS ===');
console.log(`Total: ${total}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Skipped: ${skipped}`);
console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
console.log(`Success Rate: ${total > 0 ? ((passed / total) * 100).toFixed(2) : 0}%`);
console.log(`Failure Rate: ${total > 0 ? ((failed / total) * 100).toFixed(2) : 0}%`);
console.log(`\n`);
