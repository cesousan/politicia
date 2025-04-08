import * as fs from 'fs'
import * as path from 'path'
import { Pool } from 'pg'
import { config } from 'dotenv'

// Load environment variables
config()

async function runMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  })

  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'initial-schema.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')

    // Execute the SQL
    console.log('Running migrations...')
    await pool.query(sql)
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Error running migrations:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { runMigrations }
