// Simple script to check environment variables
console.log('Environment Variables Check:');
console.log('============================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DEEPSEEK_API_KEY exists:', !!process.env.DEEPSEEK_API_KEY);
console.log('NEXT_PUBLIC_DEEPSEEK_API_KEY exists:', !!process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY);
console.log('============================');
