#!/usr/bin/env node

/**
 * This script sets up a cron job to regularly update the plagiarism corpus.
 * It uses the node-cron package to schedule the updates.
 */

const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const { createLogger } = require('../utils/logger');

const logger = createLogger('schedule-corpus-updates');

// Schedule configuration (can be set via environment variables)
const SCHEDULE = process.env.CORPUS_UPDATE_SCHEDULE || '0 0 * * *'; // Default: daily at midnight
const PROJECT_ROOT = path.resolve(__dirname, '..');

logger.info('Starting corpus update scheduler', {
  context: { schedule: SCHEDULE }
});

// Validate cron schedule
if (!cron.validate(SCHEDULE)) {
  logger.error('Invalid cron schedule', {
    context: { schedule: SCHEDULE }
  });
  process.exit(1);
}

// Schedule the corpus update job
cron.schedule(SCHEDULE, () => {
  logger.info('Running scheduled corpus update');
  
  const command = 'npm run update-corpus';
  
  exec(command, { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
    if (error) {
      logger.error('Corpus update failed', {
        context: { error: error.message }
      });
      return;
    }
    
    if (stderr) {
      logger.warn('Corpus update warnings', {
        context: { stderr }
      });
    }
    
    logger.info('Corpus update completed successfully', {
      context: { stdout }
    });
  });
});

logger.info('Corpus update scheduler started', {
  context: { nextRun: new Date(cron.nextDate().toString()) }
});

// Keep the process running
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Corpus update scheduler stopping');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Corpus update scheduler stopping');
  process.exit(0);
});
