import { supabase } from '../lib/supabase'

/**
 * Remove duplicate San Diego remodelers carefully
 * Keep the entry with the most complete data
 */
export async function removeSanDiegoDuplicates() {
  console.log('Starting duplicate removal for San Diego remodelers...')
  
  const duplicatesToRemove = []
  
  try {
    // 1. Handle exact duplicates (same name, same phone)
    const exactDuplicates = [
      { phone: '6192728532', keep: 'Cali Pro Builders', remove: ['Cali Pro Builders'] }, // Keep first, remove second
    ]
    
    // 2. Handle name variations (same phone, slightly different names)
    const nameVariations = [
      { 
        phone: '6192290116', 
        keep: 'Best Rate - San Diego Balcony & Deck Repair', // More descriptive name
        remove: ['BRR Contractors'] 
      },
      { 
        phone: '6195773749', 
        keep: 'Sheiner Construction | Whole House Remodeling in San Diego', // More complete name
        remove: ['Sheiner Construction & House Remodeling in San Diego'] 
      },
      { 
        phone: '8582083206', 
        keep: 'Antoon Construction Services', // Correct spelling
        remove: ['Antoon Construction Servies'] // Typo version
      }
    ]
    
    // Collect all duplicates to remove
    const allDuplicateRules = [...exactDuplicates, ...nameVariations]
    
    for (const rule of allDuplicateRules) {
      for (const nameToRemove of rule.remove) {
        // Find the duplicate entry
        const { data: duplicates, error } = await supabase
          .from('leads')
          .select('id, company_name, phone')
          .eq('city', 'San Diego')
          .eq('company_name', nameToRemove)
          .eq('phone', rule.phone)
        
        if (error) {
          console.error(`Error finding duplicate ${nameToRemove}:`, error)
          continue
        }
        
        if (duplicates && duplicates.length > 0) {
          // If multiple matches, remove all but keep the first one if it matches the "keep" name
          const toRemove = duplicates.filter(d => d.company_name !== rule.keep)
          duplicatesToRemove.push(...toRemove)
        }
      }
    }
    
    // 3. Handle companies with no phone number (optional - uncomment if you want to remove these)
    /*
    const { data: noPhoneCompanies, error: noPhoneError } = await supabase
      .from('leads')
      .select('id, company_name')
      .eq('city', 'San Diego')
      .in('service_type', ['Construction company', 'General contractor', 'Kitchen remodeler', 'Contractor', 'Remodeler'])
      .or('phone.is.null,phone.eq.')
    
    if (!noPhoneError && noPhoneCompanies) {
      console.log(`Found ${noPhoneCompanies.length} companies without phone numbers`)
      // Optionally add these to removal list
      // duplicatesToRemove.push(...noPhoneCompanies)
    }
    */
    
    console.log(`Removing ${duplicatesToRemove.length} duplicate entries:`)
    duplicatesToRemove.forEach(dup => {
      console.log(`- ${dup.company_name} (ID: ${dup.id})`)
    })
    
    if (duplicatesToRemove.length === 0) {
      return { removed: 0, message: 'No duplicates to remove' }
    }
    
    // Remove the duplicates
    const idsToRemove = duplicatesToRemove.map(d => d.id)
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .in('id', idsToRemove)
    
    if (deleteError) {
      console.error('Error removing duplicates:', deleteError)
      return { error: deleteError }
    }
    
    // Get updated count
    const { count, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('city', 'San Diego')
      .in('service_type', ['Construction company', 'General contractor', 'Kitchen remodeler', 'Contractor', 'Remodeler', 'Whole Home Remodel', 'Bathroom remodeler', 'Home builder'])
    
    return {
      removed: duplicatesToRemove.length,
      removedCompanies: duplicatesToRemove,
      remaining: count || 0,
      message: `Successfully removed ${duplicatesToRemove.length} duplicates`
    }
    
  } catch (error) {
    console.error('Error during duplicate removal:', error)
    return { error }
  }
}

/**
 * Fix companies with missing phone numbers by finding their phone from other sources
 */
export async function fixMissingPhones() {
  try {
    const { data: noPhoneCompanies, error } = await supabase
      .from('leads')
      .select('id, company_name, website')
      .eq('city', 'San Diego')
      .in('service_type', ['Construction company', 'General contractor', 'Kitchen remodeler', 'Contractor', 'Remodeler'])
      .or('phone.is.null,phone.eq.')
    
    if (error) {
      console.error('Error finding companies without phones:', error)
      return { error }
    }
    
    console.log(`Found ${noPhoneCompanies.length} companies without phone numbers`)
    
    return {
      companiesWithoutPhones: noPhoneCompanies.length,
      examples: noPhoneCompanies.slice(0, 10)
    }
    
  } catch (error) {
    console.error('Error:', error)
    return { error }
  }
}