import { supabase } from '../lib/supabase'

/**
 * Clean up San Diego remodelers by removing obvious non-service businesses
 * This is a one-time cleanup for pre-AI filtering imports
 */

export async function cleanupSanDiegoRemodelers() {
  console.log('Starting San Diego remodelers cleanup...')
  
  // Patterns to identify non-service businesses
  const excludePatterns = [
    // Big box stores
    'home depot', 'lowe\'s', 'lowes',
    
    // Flooring/tile stores (retail only)
    'floor & decor', 'floor and decor',
    'tile shop', 'bedrosians tile',
    'arizona tile', 'daltile',
    
    // Cabinet/kitchen showrooms (retail only)
    'cabinet showroom', 'kitchen showroom',
    'ferguson bath', 'ferguson kitchen',
    
    // Design centers (no construction)
    'design center', 'design studio',
    'staging company', 'home staging',
    
    // Supply stores
    'supply company', 'supply store',
    'wholesale', 'distributor',
    
    // Real estate related
    'real estate', 'realty', 'property management',
    
    // Other retail
    'furniture store', 'appliance store',
    'lighting store', 'plumbing showroom'
  ]
  
  try {
    // First, get all San Diego remodeling companies
    const { data: companies, error: fetchError } = await supabase
      .from('leads')
      .select('id, company_name, service_type')
      .eq('city', 'San Diego')
      .in('service_type', [
        'Construction company', 
        'General contractor', 
        'Kitchen remodeler', 
        'Contractor', 
        'Remodeler',
        'Whole Home Remodel',
        'Bathroom remodeler',
        'Home builder'
      ])
    
    if (fetchError) {
      console.error('Error fetching companies:', fetchError)
      return { error: fetchError }
    }
    
    console.log(`Found ${companies.length} San Diego remodeling companies`)
    
    // Identify companies to remove
    const toRemove = companies.filter(company => {
      const nameLower = company.company_name.toLowerCase()
      return excludePatterns.some(pattern => nameLower.includes(pattern))
    })
    
    console.log(`Identified ${toRemove.length} non-service businesses to remove:`)
    toRemove.forEach(company => {
      console.log(`- ${company.company_name} (${company.service_type})`)
    })
    
    if (toRemove.length === 0) {
      console.log('No obvious non-service businesses found')
      return { removed: 0, remaining: companies.length }
    }
    
    // Remove the non-service businesses
    const idsToRemove = toRemove.map(c => c.id)
    
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .in('id', idsToRemove)
    
    if (deleteError) {
      console.error('Error removing companies:', deleteError)
      return { error: deleteError }
    }
    
    const remaining = companies.length - toRemove.length
    console.log(`✅ Cleanup complete!`)
    console.log(`- Removed: ${toRemove.length} non-service businesses`)
    console.log(`- Remaining: ${remaining} legitimate remodeling contractors`)
    
    return {
      removed: toRemove.length,
      remaining: remaining,
      removedCompanies: toRemove
    }
    
  } catch (error) {
    console.error('Cleanup error:', error)
    return { error }
  }
}

/**
 * Identify and merge potential duplicates
 */
export async function identifyDuplicates() {
  console.log('Identifying potential duplicates in San Diego remodelers...')
  
  try {
    // Get all San Diego remodeling companies with phone numbers
    const { data: companies, error } = await supabase
      .from('leads')
      .select('id, company_name, phone, service_type')
      .eq('city', 'San Diego')
      .in('service_type', [
        'Construction company', 
        'General contractor', 
        'Kitchen remodeler', 
        'Contractor', 
        'Remodeler',
        'Whole Home Remodel',
        'Bathroom remodeler',
        'Home builder'
      ])
      .not('phone', 'is', null)
      .order('phone')
    
    if (error) {
      console.error('Error fetching companies:', error)
      return { error }
    }
    
    // Group by phone number to find duplicates
    const phoneGroups = {}
    companies.forEach(company => {
      const phone = company.phone.replace(/\D/g, '') // Remove non-digits
      if (!phoneGroups[phone]) {
        phoneGroups[phone] = []
      }
      phoneGroups[phone].push(company)
    })
    
    // Find groups with duplicates
    const duplicates = Object.entries(phoneGroups)
      .filter(([phone, group]) => group.length > 1)
      .map(([phone, group]) => ({
        phone,
        count: group.length,
        companies: group
      }))
    
    console.log(`Found ${duplicates.length} phone numbers with multiple entries`)
    
    // Show some examples
    duplicates.slice(0, 5).forEach(dup => {
      console.log(`\nPhone ${dup.phone} has ${dup.count} entries:`)
      dup.companies.forEach(c => {
        console.log(`  - ${c.company_name} (${c.service_type})`)
      })
    })
    
    const totalDuplicates = duplicates.reduce((sum, dup) => sum + (dup.count - 1), 0)
    console.log(`\nTotal duplicate entries: ${totalDuplicates}`)
    
    return {
      duplicateGroups: duplicates.length,
      totalDuplicates,
      examples: duplicates.slice(0, 10)
    }
    
  } catch (error) {
    console.error('Error identifying duplicates:', error)
    return { error }
  }
}