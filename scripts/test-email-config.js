#!/usr/bin/env node

const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfig() {
  console.log('🔍 Testing Email Configuration...\n');
  
  const config = {
    emailUser: process.env.EMAIL_USER || 'ne.automation.user.01@gmail.com',
    emailPassword: process.env.EMAIL_PASSWORD || 'pdfwuwgrpkqxuttp',
    emailTo: process.env.EMAIL_TO || 'gaurav.jayant@groupbayport.com',
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: process.env.SMTP_PORT || 587,
  };

  console.log('Configuration from .env:');
  console.log(`  📧 Email User: ${config.emailUser}`);
  console.log(`  🔐 Password Length: ${config.emailPassword.length} characters`);
  console.log(`  📮 Send To: ${config.emailTo}`);
  console.log(`  🖥️  SMTP Host: ${config.smtpHost}`);
  console.log(`  🔌 SMTP Port: ${config.smtpPort}\n`);

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    console.log('🧪 Testing connection to SMTP server...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    // Send test email
    console.log('📧 Sending test email...');
    const testEmail = await transporter.sendMail({
      from: config.emailUser,
      to: config.emailTo,
      subject: '✅ Neonearth Automation - Email Configuration Test',
      html: `
        <h2>Email Configuration Test Successful</h2>
        <p>Your email configuration is working correctly!</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>SMTP Host: ${config.smtpHost}</li>
          <li>SMTP Port: ${config.smtpPort}</li>
          <li>From: ${config.emailUser}</li>
          <li>To: ${config.emailTo}</li>
          <li>Time: ${new Date().toLocaleString()}</li>
        </ul>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${testEmail.messageId}\n`);
    console.log('🎉 Email configuration is working. Your automation emails should now send!\n');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message, '\n');
    
    if (error.message.includes('Invalid login') || error.message.includes('535')) {
      console.error('🔴 AUTHENTICATION FAILED');
      console.error('   Your email/password combination is incorrect.');
      console.error('   Solutions:');
      console.error('   1. Verify EMAIL_USER and EMAIL_PASSWORD in .env file');
      console.error('   2. For Gmail: Generate a new App Password:');
      console.error('      → Go to https://myaccount.google.com/apppasswords');
      console.error('      → Select "Mail" and "Windows Computer"');
      console.error('      → Copy the 16-character password to EMAIL_PASSWORD in .env');
      console.error('   3. Ensure 2-Factor Authentication is enabled on your Gmail account\n');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🔴 NETWORK ERROR');
      console.error('   Cannot reach SMTP server. Check your internet connection.\n');
    } else if (error.message.includes('socket hang up')) {
      console.error('🔴 CONNECTION TIMEOUT');
      console.error('   SMTP server did not respond. Check SMTP_HOST and SMTP_PORT.\n');
    }
    
    return false;
  }
}

testEmailConfig().then(success => {
  process.exit(success ? 0 : 1);
});
