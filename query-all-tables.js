import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://dicscsehiegqsmtwewis.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function queryAllTables() {
  console.log('Connecting to Supabase project: dicscsehiegqsmtwewis');
  console.log('Checking all tables...\n');

  // Check leads table
  console.log('1. LEADS TABLE:');
  try {
    const { data: leads, count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.log('   Error:', error.message);
    } else {
      console.log(`   Total records: ${count}`);
      if (leads && leads.length > 0) {
        console.log('   Sample data:', JSON.stringify(leads[0], null, 2));
      }
    }
  } catch (err) {
    console.log('   Error accessing table:', err.message);
  }

  // Check markets table
  console.log('\n2. MARKETS TABLE:');
  try {
    const { data: markets, count, error } = await supabase
      .from('markets')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.log('   Error:', error.message);
    } else {
      console.log(`   Total records: ${count}`);
      if (markets && markets.length > 0) {
        console.log('   Sample data:', JSON.stringify(markets[0], null, 2));
      }
    }
  } catch (err) {
    console.log('   Error accessing table:', err.message);
  }

  // Check import_history table
  console.log('\n3. IMPORT_HISTORY TABLE:');
  try {
    const { data: imports, count, error } = await supabase
      .from('import_history')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.log('   Error:', error.message);
    } else {
      console.log(`   Total records: ${count}`);
      if (imports && imports.length > 0) {
        console.log('   Sample data:', JSON.stringify(imports[0], null, 2));
      }
    }
  } catch (err) {
    console.log('   Error accessing table:', err.message);
  }

  // Let's also check the table schema
  console.log('\n4. CHECKING TABLE SCHEMA FOR LEADS:');
  try {
    // Try to insert a dummy record to see the table structure from error
    const { error } = await supabase
      .from('leads')
      .insert({ dummy: 'test' });
    
    if (error) {
      console.log('   Table exists. Error details reveal structure:', error.message);
    }
  } catch (err) {
    console.log('   Error:', err.message);
  }
}

// Run the query
queryAllTables();