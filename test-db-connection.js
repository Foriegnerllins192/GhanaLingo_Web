const { getPool, testConnection } = require('./config/db-vercel');

async function testDB() {
    console.log('Testing database connection...');
    
    try {
        const success = await testConnection();
        if (success) {
            console.log('✅ Database connection successful!');
            
            // Test a simple query
            try {
                const pool = getPool();
                const [rows] = await pool.execute('SELECT 1 as test');
                console.log('✅ Database query test successful:', rows);
            } catch (queryError) {
                console.error('❌ Database query test failed:', queryError);
            }
        } else {
            console.log('❌ Database connection failed!');
        }
    } catch (error) {
        console.error('❌ Database connection test failed with error:', error);
    }
}

testDB();