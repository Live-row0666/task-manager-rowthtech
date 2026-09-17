const fs = require('fs');
const path = require('path');

// Create necessary directories
const directories = [
    'logs',
    'uploads',
    'backups'
];

directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// Create .env.example file
const envExample = `# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/taskmanager

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=8h

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Rate Limiting
MAX_LOGIN_ATTEMPTS=10
LOGIN_WINDOW_MINUTES=10
API_RATE_LIMIT=500
API_WINDOW_MINUTES=10

# Admin User Configuration
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=SecurePassword@123`;

fs.writeFileSync('.env.example', envExample);
console.log('Created .env.example file');

console.log('\nSetup completed successfully!');
console.log('\nNext steps:');
console.log('1. Copy .env.example to .env and configure your environment variables');
console.log('2. Install dependencies: npm install');
console.log('3. Start the server: npm run dev');
console.log('\nFor production deployment:');
console.log('1. Set NODE_ENV=production in your .env file');
console.log('2. Configure your production database and AWS credentials');
console.log('3. Start with: npm start');