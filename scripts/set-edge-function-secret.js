#!/usr/bin/env node

// Script to set OpenAI API key for Supabase Edge Function
// Run this after updating your .env file with the new OpenAI API key

import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

const openAiKey = process.env.VITE_OPENAI_API_KEY;

if (!openAiKey) {
  console.error('❌ Error: VITE_OPENAI_API_KEY not found in .env file');
  console.error('Please add your OpenAI API key to the .env file first');
  process.exit(1);
}

console.log('🔐 Setting OpenAI API key as Edge Function secret...\n');

try {
  // Set the secret using Supabase CLI
  execSync(`supabase secrets set OPENAI_API_KEY="${openAiKey}" --project-ref dicscsehiegqsmtwewis`, {
    stdio: 'inherit'
  });
  
  console.log('\n✅ Secret set successfully!');
  console.log('Your Edge Function now has access to the OpenAI API key.');
  console.log('\nThe AI filtering should now work without CORS issues.');
  
} catch (error) {
  console.error('❌ Error setting secret:', error.message);
  console.error('\nMake sure you have the Supabase CLI installed and are logged in.');
  console.error('You can also set the secret manually with:');
  console.error('supabase secrets set OPENAI_API_KEY="your-key-here" --project-ref dicscsehiegqsmtwewis');
}