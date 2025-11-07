
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'Atomberg_Electrolyte', 
    user: 'postgres',             
    password: 'Your_Password',    
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database Connection Error:', err.stack);
    } else {
        console.log('✅ PostgreSQL Database Connected Successfully');
        release();
    }
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
});


app.get('/api/data', async (req, res) => {
    const startTime = Date.now();
    const { serialNumber } = req.query;

    if (!serialNumber || serialNumber.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Serial Number is required'
        });
    }

    try {
        const query = `
            SELECT 
                sr_no, lot_no, rf_no, pcb_sr_no, fan_sr_no, ticket_no, 
                line_item_no, version, model, part_code, customer_complaint, 
                symptom, defect, rf_observation, created_at
            FROM manufacturing_data 
            WHERE pcb_sr_no = $1
            LIMIT 1
        `;
        
        const result = await pool.query(query, [serialNumber.trim()]);
        const queryTime = Date.now() - startTime;

        if (result.rows.length > 0) {
            const dbData = result.rows[0];
          
            const responseData = {
                "Repair Date": dbData.created_at ? new Date(dbData.created_at).toLocaleDateString('en-GB') : '',
                "Fan Sr No": dbData.fan_sr_no || '',
                "Ticket No   ": dbData.ticket_no || '',
                "Linen Item No": dbData.line_item_no || '',
                "Version": dbData.version || '',
                "Model Type": dbData.model || '',
                "Customer Complaint": dbData.customer_complaint || '',
                "Symp. Defe.": dbData.symptom || '',
                "Defect Description": dbData.defect || '',
                "RF Observation": dbData.rf_observation || '',
                "Lot No": dbData.lot_no || '',
                "PCB Sr No": dbData.pcb_sr_no || '',
                "RF No": dbData.rf_no || '',
                "Part Code": dbData.part_code || ''
            };

            res.json(responseData);
            console.log(`✅ Found record for Serial Number: ${serialNumber} (${queryTime}ms)`);
        } else {
            res.status(404).json({
                success: false,
                message: `No record found for Serial Number: ${serialNumber}`,
                queryTime: queryTime
            });
            console.log(`⚠️  No record found for Serial Number: ${serialNumber}`);
        }
    } catch (error) {
        console.error('❌ Database Error:', error);
        res.status(500).json({
            success: false,
            error: 'Database error occurred',
            message: error.message
        });
    }
});



app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.url}`
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Global Error Handler:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

const server = app.listen(PORT, () => {
  
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🎯 Frontend: http://localhost:5173`);

});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM signal received');
    server.close(() => {
        pool.end(() => {
            console.log('💾 Database pool closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT signal received');
    server.close(() => {
        pool.end(() => {
            console.log('💾 Database pool closed');
            process.exit(0);
        });
    });
});

module.exports = app;
