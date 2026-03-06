
// This file is used to test environment variables for edge functions

console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL'));
console.log('SUPABASE_ANON_KEY:', Deno.env.get('SUPABASE_ANON_KEY') ? 'Set' : 'Not set');
console.log('OPENAI_API_KEY:', Deno.env.get('OPENAI_API_KEY') ? 'Set' : 'Not set');
console.log('GITHUB_TOKEN:', Deno.env.get('GITHUB_TOKEN') ? 'Set' : 'Not set');
console.log('RESEND_API_KEY:', Deno.env.get('RESEND_API_KEY') ? 'Set' : 'Not set');

// Test that the Security Scanner can access the required environment variables
console.log('Testing Security Scanner environment variables:');
const securityScannerEnvVars = [
  'OPENAI_API_KEY',
  'GITHUB_TOKEN',
  'RESEND_API_KEY'
];

const missingVars = securityScannerEnvVars.filter(varName => !Deno.env.get(varName));
if (missingVars.length > 0) {
  console.warn(`Warning: Missing environment variables for Security Scanner: ${missingVars.join(', ')}`);
} else {
  console.log('All Security Scanner environment variables are set');
}

