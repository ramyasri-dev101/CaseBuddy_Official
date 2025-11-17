const https = require('https');

const supabaseUrl = 'vqwowndvaomlvctprcsb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxd293bmR2YW9tbHZjdHByY3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDA1MTYsImV4cCI6MjA3NjM3NjUxNn0.xdJEEECw1-vk0K2QZRjsddKxbagHZvKN5XoDf7AqYPs';

const postData = JSON.stringify({
  query: 'ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS patient_birthdate text;'
});

const options = {
  hostname: supabaseUrl,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Length': postData.length
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(postData);
req.end();
