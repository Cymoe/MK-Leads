import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function analyzeSanDiegoRemodeling() {
  console.log('Analyzing San Diego Home Remodeling companies...\n')
  
  try {
    // First, let's get the total count
    const { count: totalCount, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('city', 'San Diego')
      .eq('industry', 'Home Remodeling')
    
    if (countError) throw countError
    console.log(`Total San Diego Home Remodeling companies: ${totalCount}\n`)
    
    // Fetch all records to analyze
    let allRecords = []
    const batchSize = 1000
    
    for (let offset = 0; offset < totalCount; offset += batchSize) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('city', 'San Diego')
        .eq('industry', 'Home Remodeling')
        .range(offset, Math.min(offset + batchSize - 1, totalCount - 1))
        .order('company_name')
      
      if (error) throw error
      allRecords = [...allRecords, ...data]
    }
    
    console.log(`Fetched ${allRecords.length} records for analysis\n`)
    
    // 1. Check for duplicate phone numbers
    console.log('=== DUPLICATE PHONE NUMBERS ===')
    const phoneMap = new Map()
    allRecords.forEach(record => {
      if (record.phone) {
        const cleanPhone = record.phone.replace(/\D/g, '')
        if (cleanPhone.length >= 10) {
          if (!phoneMap.has(cleanPhone)) {
            phoneMap.set(cleanPhone, [])
          }
          phoneMap.get(cleanPhone).push({
            id: record.id,
            name: record.company_name,
            address: record.address,
            service_type: record.service_type
          })
        }
      }
    })
    
    let duplicatePhoneCount = 0
    phoneMap.forEach((companies, phone) => {
      if (companies.length > 1) {
        duplicatePhoneCount++
        console.log(`\nPhone: ${phone}`)
        companies.forEach(company => {
          console.log(`  - ${company.name} | ${company.address || 'No address'} | ${company.service_type || 'No service type'}`)
        })
      }
    })
    console.log(`\nTotal duplicate phone numbers: ${duplicatePhoneCount}`)
    
    // 2. Check for very similar names
    console.log('\n=== SIMILAR COMPANY NAMES ===')
    const nameMap = new Map()
    allRecords.forEach(record => {
      const baseName = record.company_name
        .toLowerCase()
        .replace(/\b(inc|llc|corp|corporation|company|co)\b/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim()
      
      if (!nameMap.has(baseName)) {
        nameMap.set(baseName, [])
      }
      nameMap.get(baseName).push({
        id: record.id,
        originalName: record.company_name,
        address: record.address,
        phone: record.phone,
        service_type: record.service_type
      })
    })
    
    let similarNameCount = 0
    nameMap.forEach((companies, baseName) => {
      if (companies.length > 1 && baseName.length > 3) {
        similarNameCount++
        console.log(`\nBase name: "${baseName}"`)
        companies.forEach(company => {
          console.log(`  - ${company.originalName} | ${company.phone || 'No phone'} | ${company.address || 'No address'}`)
        })
      }
    })
    console.log(`\nTotal groups of similar names: ${similarNameCount}`)
    
    // 3. Check for same address
    console.log('\n=== DUPLICATE ADDRESSES ===')
    const addressMap = new Map()
    allRecords.forEach(record => {
      if (record.address) {
        const cleanAddress = record.address.toLowerCase().trim()
        if (!addressMap.has(cleanAddress)) {
          addressMap.set(cleanAddress, [])
        }
        addressMap.get(cleanAddress).push({
          id: record.id,
          name: record.company_name,
          phone: record.phone,
          service_type: record.service_type
        })
      }
    })
    
    let duplicateAddressCount = 0
    addressMap.forEach((companies, address) => {
      if (companies.length > 1) {
        duplicateAddressCount++
        console.log(`\nAddress: ${address}`)
        companies.forEach(company => {
          console.log(`  - ${company.name} | ${company.phone || 'No phone'} | ${company.service_type || 'No service type'}`)
        })
      }
    })
    console.log(`\nTotal duplicate addresses: ${duplicateAddressCount}`)
    
    // 4. Check for franchise patterns
    console.log('\n=== FRANCHISE PATTERNS ===')
    const franchisePatterns = [
      'Re-Bath', 'Bath Fitter', 'California Closets', 'Closets by Design',
      'Kitchen Tune-Up', 'Mr. Handyman', 'Handyman Connection',
      'Five Star Bath Solutions', 'West Shore Home', 'Window World',
      'Renewal by Andersen', 'Budget Blinds', 'Floor Coverings International'
    ]
    
    franchisePatterns.forEach(franchise => {
      const franchiseRecords = allRecords.filter(record => 
        record.company_name.toLowerCase().includes(franchise.toLowerCase())
      )
      if (franchiseRecords.length > 1) {
        console.log(`\n${franchise}: ${franchiseRecords.length} locations`)
        franchiseRecords.forEach(record => {
          console.log(`  - ${record.company_name} | ${record.address || 'No address'}`)
        })
      }
    })
    
    // 5. Check service type distribution
    console.log('\n=== SERVICE TYPE DISTRIBUTION ===')
    const serviceTypeCount = new Map()
    allRecords.forEach(record => {
      const serviceType = record.service_type || 'Not specified'
      serviceTypeCount.set(serviceType, (serviceTypeCount.get(serviceType) || 0) + 1)
    })
    
    const sortedServiceTypes = Array.from(serviceTypeCount.entries())
      .sort((a, b) => b[1] - a[1])
    
    sortedServiceTypes.forEach(([serviceType, count]) => {
      console.log(`${serviceType}: ${count} (${(count/allRecords.length*100).toFixed(1)}%)`)
    })
    
    // 6. Check import dates
    console.log('\n=== IMPORT DATE ANALYSIS ===')
    const importDateCount = new Map()
    allRecords.forEach(record => {
      const date = new Date(record.created_at).toISOString().split('T')[0]
      importDateCount.set(date, (importDateCount.get(date) || 0) + 1)
    })
    
    const sortedDates = Array.from(importDateCount.entries()).sort()
    console.log('\nRecords imported by date:')
    sortedDates.forEach(([date, count]) => {
      console.log(`${date}: ${count} records`)
    })
    
    // 7. Check for suburbs listed as San Diego
    console.log('\n=== POTENTIAL SUBURB RECORDS ===')
    const suburbPatterns = [
      'La Jolla', 'Chula Vista', 'Coronado', 'Del Mar', 'Encinitas',
      'Escondido', 'La Mesa', 'National City', 'Oceanside', 'Poway',
      'Santee', 'Vista', 'Carlsbad', 'El Cajon'
    ]
    
    suburbPatterns.forEach(suburb => {
      const suburbRecords = allRecords.filter(record => 
        record.address && record.address.includes(suburb)
      )
      if (suburbRecords.length > 0) {
        console.log(`\n${suburb} addresses: ${suburbRecords.length}`)
      }
    })
    
    // 8. Sample random companies to verify legitimacy
    console.log('\n=== RANDOM SAMPLE OF 20 COMPANIES ===')
    const shuffled = [...allRecords].sort(() => 0.5 - Math.random())
    const sample = shuffled.slice(0, 20)
    
    sample.forEach((record, index) => {
      console.log(`\n${index + 1}. ${record.company_name}`)
      console.log(`   Service: ${record.service_type || 'Not specified'}`)
      console.log(`   Phone: ${record.phone || 'Not provided'}`)
      console.log(`   Address: ${record.address || 'Not provided'}`)
      console.log(`   Website: ${record.website || 'Not provided'}`)
      console.log(`   Imported: ${new Date(record.created_at).toLocaleDateString()}`)
    })
    
    // Summary
    console.log('\n=== SUMMARY ===')
    console.log(`Total records: ${allRecords.length}`)
    console.log(`Unique phone numbers: ${phoneMap.size}`)
    console.log(`Duplicate phone groups: ${duplicatePhoneCount}`)
    console.log(`Similar name groups: ${similarNameCount}`)
    console.log(`Duplicate address groups: ${duplicateAddressCount}`)
    console.log(`Records without phone: ${allRecords.filter(r => !r.phone).length}`)
    console.log(`Records without address: ${allRecords.filter(r => !r.address).length}`)
    console.log(`Records without service type: ${allRecords.filter(r => !r.service_type).length}`)
    
    // Market analysis
    console.log('\n=== MARKET ANALYSIS ===')
    const sanDiegoMetroPopulation = 3298634 // 2023 estimate
    const avgHomesPerCapita = 0.4 // Approximate homes per person
    const estimatedHomes = sanDiegoMetroPopulation * avgHomesPerCapita
    const avgRemodelCycle = 15 // Years between major remodels
    const annualRemodelDemand = estimatedHomes / avgRemodelCycle
    const avgJobsPerCompany = annualRemodelDemand / allRecords.length
    
    console.log(`San Diego Metro Population: ${sanDiegoMetroPopulation.toLocaleString()}`)
    console.log(`Estimated homes: ${Math.round(estimatedHomes).toLocaleString()}`)
    console.log(`Estimated annual remodel demand: ${Math.round(annualRemodelDemand).toLocaleString()} homes`)
    console.log(`Companies per 100,000 population: ${(allRecords.length / sanDiegoMetroPopulation * 100000).toFixed(1)}`)
    console.log(`Average annual jobs per company: ${Math.round(avgJobsPerCompany)}`)
    
    // Realistic assessment
    console.log('\n=== REALISTIC ASSESSMENT ===')
    const uniquePhones = phoneMap.size
    const estimatedDuplicates = allRecords.length - uniquePhones
    const duplicateRate = (estimatedDuplicates / allRecords.length * 100).toFixed(1)
    
    console.log(`Based on unique phone numbers: ~${uniquePhones} unique companies`)
    console.log(`Estimated duplicate rate: ${duplicateRate}%`)
    console.log(`\nConclusion: The number seems ${duplicateRate > 20 ? 'inflated due to duplicates' : 'reasonable for a major metro area'}`)
    
  } catch (error) {
    console.error('Error analyzing data:', error)
  }
}

// Run the analysis
analyzeSanDiegoRemodeling()