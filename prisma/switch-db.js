const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Replace SQLite with PostgreSQL provider
schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');

fs.writeFileSync(schemaPath, schema);
console.log('✔ Switched Prisma provider to postgresql for Vercel production deployment');
