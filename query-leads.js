import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://dicscsehiegqsmtwewis.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function queryLeadsTable() {
  console.log('Connecting to Supabase project: dicscsehiegqsmtwewis');
  console.log('Querying the leads table...\n');

  try {
    // Get all leads from the table
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10); // Limiting to first 10 for initial view

    if (error) {
      console.error('Error querying leads table:', error);
      return;
    }

    if (!leads || leads.length === 0) {
      console.log('No leads found in the table.');
      return;
    }

    console.log(`Found ${leads.length} leads (showing first 10):\n`);
    
    // Display leads in a formatted way
    leads.forEach((lead, index) => {
      console.log(`Lead ${index + 1}:`);
      console.log(`  Name: ${lead.name || 'N/A'}`);
      console.log(`  City: ${lead.city || 'N/A'}`);
      console.log(`  State: ${lead.state || 'N/A'}`);
      console.log(`  Phone: ${lead.phone || 'N/A'}`);
      console.log(`  Email: ${lead.email || 'N/A'}`);
      console.log(`  Address: ${lead.address || 'N/A'}`);
      console.log(`  Category: ${lead.category || 'N/A'}`);
      console.log(`  Source: ${lead.source || 'N/A'}`);
      console.log(`  Created: ${lead.created_at || 'N/A'}`);
      console.log('---');
    });

    // Get total count
    const { count, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (!countError && count !== null) {
      console.log(`\nTotal leads in database: ${count}`);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the query
queryLeadsTable();