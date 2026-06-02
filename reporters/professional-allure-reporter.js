function stripAnsi(text) {
  return String(text || '').replace(/\u001b\[[0-9;]*m/g, '');
}

function firstLine(text) {
  return stripAnsi(text).split('\n').find(Boolean) || 'No error message captured.';
}

function classifyFailure(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes('timeout')) return 'Timeout / application response delay';
  if (normalized.includes('locator') || normalized.includes('strict mode')) return 'Locator / element identification issue';
  if (normalized.includes('expect') || normalized.includes('expected')) return 'Assertion mismatch';
  if (normalized.includes('net::') || normalized.includes('navigation')) return 'Navigation / network issue';
  if (normalized.includes('api') || normalized.includes('response')) return 'API / backend response issue';
  if (normalized.includes('filechooser') || normalized.includes('upload')) return 'Upload flow issue';

  return 'Unclassified failure';
}

function attachText(result, name, content) {
  result.attachments.push({
    name,
    contentType: 'text/plain',
    body: Buffer.from(content),
  });
}

class ProfessionalAllureReporter {
  onTestEnd(test, result) {
    if (result.status === 'passed' && result.retry > 0) {
      attachText(
        result,
        'Passed After Retry - QA Highlight',
        [
          'Status: PASSED AFTER RETRY',
          `Project: Neonearth`,
          `Application: Playwright Automation JS`,
          `QA Owner: QA Gaurav Jayant`,
          `Test: ${test.title}`,
          `Retry Attempt: ${result.retry}/${test.retries}`,
          '',
          'Observation:',
          'The test failed on an earlier attempt but passed on retry.',
          'This should be reviewed as a possible flaky, timing, environment, or data stability issue.',
        ].join('\n')
      );
    }

    if (result.status !== 'passed' && result.status !== 'skipped') {
      const errorMessage = result.errors?.[0]?.message || result.error?.message || 'Unknown failure';
      const stack = result.errors?.[0]?.stack || result.error?.stack || '';

      attachText(
        result,
        'Failure Reason - QA Highlight',
        [
          'Status: FAILED',
          `Project: Neonearth`,
          `Application: Playwright Automation JS`,
          `QA Owner: QA Gaurav Jayant`,
          `Test: ${test.title}`,
          `Retry Attempt: ${result.retry}/${test.retries}`,
          `Likely Category: ${classifyFailure(errorMessage)}`,
          '',
          'Failure Summary:',
          firstLine(errorMessage),
          '',
          'Full Error:',
          stripAnsi(errorMessage),
          '',
          'Stack Trace:',
          stripAnsi(stack || 'No stack trace captured.'),
        ].join('\n')
      );
    }
  }
}

module.exports = ProfessionalAllureReporter;
