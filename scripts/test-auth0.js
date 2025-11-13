import { ManagementClient } from 'auth0';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

async function testConnection() {
  try {
    console.log('Testing Auth0 connection...');
    console.log(`Domain: ${process.env.AUTH0_DOMAIN}`);
    
    const client = await management.clients.get(process.env.AUTH0_CLIENT_ID);
    
    console.log('Auth0 connection successful!');
    console.log(`Application: ${client.name}`);
    console.log('Testing Management API permissions...');
    const users = await management.users.list({ per_page: 1 });
    console.log('Management API access granted');
    console.log(`Current users in tenant: ${users.data.length === 0 ? 'None yet' : users.data.length}`);
    
    console.log('Auth0 setup complete! You can create users.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Auth0 test failed:');
    console.error(error.message);
    
    if (error.message.includes('Insufficient scope')) {
      console.error('\n Management API permissions not enabled!');
      console.error('   Go to: Auth0 Dashboard → APIs → Auth0 Management API');
      console.error('   Enable your Expense Tracker app and grant create:users permission');
    }
    
    process.exit(1);
  }
}

testConnection();