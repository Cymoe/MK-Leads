// Test Google Sheets Integration
// Run this in browser console or as a separate test

const testGoogleSheetsIntegration = async () => {
  const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
  
  if (!scriptUrl) {
    console.error('❌ VITE_GOOGLE_SCRIPT_URL not found in environment variables');
    return;
  }
  
  console.log('🔗 Testing Google Sheets integration...');
  console.log('Script URL:', scriptUrl);
  
  // Test data
  const testData = {
    action: 'append',
    sheet: 'Test_Export_' + new Date().toISOString().split('T')[0],
    data: [
      {
        'Company Name': 'Test Company 1',
        'Service Type': 'Roofing',
        'Phone': '555-0123',
        'Email': 'test1@example.com',
        'City': 'Los Angeles',
        'State': 'CA'
      },
      {
        'Company Name': 'Test Company 2', 
        'Service Type': 'Plumbing',
        'Phone': '555-0456',
        'Email': 'test2@example.com',
        'City': 'San Diego',
        'State': 'CA'
      }
    ]
  };
  
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Google Sheets integration working!');
      console.log('📊 Spreadsheet URL:', result.spreadsheetUrl);
      console.log('📄 Sheet Name:', result.sheetName);
    } else {
      console.error('❌ Integration failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

// Run the test
testGoogleSheetsIntegration();

