const puppeteer = require('puppeteer');

// Launch configuration for Puppeteer
const launchOptions = {
  headless: true,
  args: []
};

// Check if we are on Render
if (process.env.RENDER) {
  // Use system Chrome
  launchOptions.executablePath = '/usr/bin/google-chrome-stable';
  launchOptions.args.push('--no-sandbox');
  launchOptions.args.push('--disable-setuid-sandbox');
}

// Launch Puppeteer with the configured options
const browser = await puppeteer.launch(launchOptions);
