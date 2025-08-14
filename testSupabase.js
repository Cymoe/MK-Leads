import { setupDatabase } from './src/utils/setupDatabase.js'

console.log('Starting Supabase setup...\n')

setupDatabase()
  .then(() => {
    console.log('\n✨ Setup process completed')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Setup failed:', err)
    process.exit(1)
  })
