import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

async function removePhoenixTurfLeads() {
  try {
    console.log('Removing Phoenix Artificial Turf Installation leads...\n')
    
    // First, let's count how many we have
    const { data: countData, error: countError } = await supabase
      .from('leads')
      .select('id', { count: 'exact' })
      .eq('city', 'Phoenix')
      .eq('state', 'AZ')
      .or('service_type.eq.Artificial Turf Installation,service_type.eq.Turf Installers,service_type.eq.Turf installation,service_type.eq.Synthetic grass installation,service_type.eq.Artificial grass installer,service_type.eq.Turf supplier,service_type.eq.Landscaper')
    
    if (countError) {
      console.error('Error counting Phoenix turf leads:', countError)
      return
    }
    
    const totalCount = countData.length
    console.log(`Found ${totalCount} Phoenix turf-related leads to remove`)
    
    if (totalCount === 0) {
      console.log('No Phoenix turf leads found to remove')
      return
    }
    
    // Show some examples before deletion
    const { data: exampleData } = await supabase
      .from('leads')
      .select('company_name, service_type, phone, rating')
      .eq('city', 'Phoenix')
      .eq('state', 'AZ')
      .or('service_type.eq.Artificial Turf Installation,service_type.eq.Turf Installers,service_type.eq.Turf installation,service_type.eq.Synthetic grass installation,service_type.eq.Artificial grass installer,service_type.eq.Turf supplier,service_type.eq.Landscaper')
      .limit(10)
    
    console.log('\nExample leads to be removed:')
    exampleData.forEach(lead => {
      console.log(`- ${lead.company_name} | ${lead.service_type} | Rating: ${lead.rating || 'N/A'}`)
    })
    
    // Delete the leads
    console.log('\nDeleting Phoenix turf leads...')
    
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('city', 'Phoenix')
      .eq('state', 'AZ')
      .or('service_type.eq.Artificial Turf Installation,service_type.eq.Turf Installers,service_type.eq.Turf installation,service_type.eq.Synthetic grass installation,service_type.eq.Artificial grass installer,service_type.eq.Turf supplier,service_type.eq.Landscaper')
    
    if (deleteError) {
      console.error('Error deleting leads:', deleteError)
      return
    }
    
    console.log(`\n✅ Successfully removed ${totalCount} Phoenix turf leads`)
    console.log('\nYou can now re-import Phoenix Artificial Turf Installation leads to test the improved AI filtering')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the removal
removePhoenixTurfLeads()