// Load env: `.env.test.local` (gitignored, point it at a local/Neon-branch DB) wins over `.env`.
import dotenv from 'dotenv'

dotenv.config({ path: ['.env.test.local', '.env'] })
