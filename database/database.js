const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database file (creates it if it doesn't exist)
const dbPath = path.resolve(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database', err.message);
    } else {
        console.log('✅ Connected to SQLite database successfully.');
    }
});

// Initialize Tables
db.serialize(() => {
    // 1. FAQs Table
    db.run(`CREATE TABLE IF NOT EXISTS faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL
    )`);

    // 2. Tickets Table (for grievances & complaints)
    db.run(`CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_id TEXT UNIQUE NOT NULL,
        student_parent_name TEXT NOT NULL,
        contact_info TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        department TEXT NOT NULL,
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'New',
        assigned_to TEXT DEFAULT 'Unassigned',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. Ticket Logs (Audit trail for staff notes)
    db.run(`CREATE TABLE IF NOT EXISTS ticket_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER,
        note TEXT NOT NULL,
        updated_by TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    )`);

    // 4. Staff Users Table
    db.run(`CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        department TEXT NOT NULL,
        role TEXT DEFAULT 'Staff'
    )`, () => {
        // Insert a default demo staff account if table is empty
        db.get(`SELECT COUNT(*) as count FROM staff`, (err, row) => {
            if (row.count === 0) {
                db.run(`INSERT INTO staff (username, password, department, role) VALUES ('admin@krmangalam.edu', 'password123', 'Administration', 'Admin')`);
                console.log('👤 Default staff account created: admin@krmangalam.edu / password123');
            }
        });
    });

    // 5. Insert sample FAQs if empty
    db.get(`SELECT COUNT(*) as count FROM faqs`, (err, row) => {
        if (row.count === 0) {
            const sampleFAQs = [
                ['Admissions', 'What is the admission process?', 'Admissions for KR Mangalam World School open in January. You can fill out the online form or visit the campus.'],
                ['Fees', 'What is the fee structure for class 6?', 'The annual tuition fee for Class 6 is approximately INR 1,20,000, payable in quarterly installments.'],
                ['Timings', 'What are the school timings?', 'School timings for primary and secondary classes are from 8:00 AM to 2:00 PM, Monday through Friday.'],
                ['Transport', 'Is school bus facility available?', 'Yes, AC bus transport is available across major routes in Gurugram and surrounding areas with GPS live tracking.']
            ];
            const stmt = db.prepare(`INSERT INTO faqs (category, question, answer) VALUES (?, ?, ?)`);
            sampleFAQs.forEach(faq => stmt.run(faq));
            stmt.finalize();
            console.log('📚 Sample FAQs loaded into database.');
        }
    });
});

module.exports = db;