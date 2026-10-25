const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. CHAT ENDPOINT ---
app.post('/api/chat', (req, res) => {
    const { session_id, message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const lowerMsg = message.toLowerCase();

    // Check if user wants to track a ticket (e.g., contains SCH-)
    if (lowerMsg.includes('sch-') || lowerMsg.includes('track')) {
        const words = message.split(' ');
        const trackingId = words.find(w => w.toUpperCase().startsWith('SCH-'));
        
        if (trackingId) {
            db.get(`SELECT * FROM tickets WHERE tracking_id = ?`, [trackingId.toUpperCase()], (err, ticket) => {
                if (err || !ticket) {
                    return res.json({
                        reply: `I couldn't find any ticket with ID "${trackingId}". Please check the ID and try again.`,
                        type: 'text'
                    });
                }
                return res.json({
                    reply: `Here is the current status for your ticket ${ticket.tracking_id}:`,
                    type: 'status',
                    ticket: ticket
                });
            });
            return;
        }
    }

    // Check if user wants to raise a complaint or grievance
    if (lowerMsg.includes('complaint') || lowerMsg.includes('grievance') || lowerMsg.includes('issue') || lowerMsg.includes('problem')) {
        return res.json({
            reply: `I can help you file a grievance or complaint. Please provide your name, contact info, category (e.g., Transport, Fees, Academic), and a brief description of your issue.`,
            type: 'summary_prompt'
        });
    }

    // Search FAQs using basic keyword matching
    db.all(`SELECT * FROM faqs`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        // Find best matching FAQ based on keyword overlap
        let matchedFAQ = rows.find(faq => 
            lowerMsg.includes(faq.question.toLowerCase()) || 
            faq.question.toLowerCase().split(' ').some(word => word.length > 3 && lowerMsg.includes(word))
        );

        if (matchedFAQ) {
            return res.json({
                reply: matchedFAQ.answer,
                type: 'text'
            });
        }

        // Fallback response if no FAQ matches
        return res.json({
            reply: "I'm not completely sure about that. For specific queries, please contact the school office directly at office@krmangalam.edu or raise a support ticket.",
            type: 'text'
        });
    });
});

// --- 2. SUBMIT COMPLAINT / TICKET ENDPOINT ---
app.post('/api/tickets', (req, res) => {
    const { student_parent_name, contact_info, category, description, department, priority } = req.body;
    
    // Generate unique tracking ID e.g., SCH-2026-0042
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const tracking_id = `SCH-2026-${randomNum}`;

    const query = `INSERT INTO tickets (tracking_id, student_parent_name, contact_info, category, description, department, priority) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [tracking_id, student_parent_name, contact_info, category, description, department || 'Administration', priority || 'Medium'], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to create ticket' });
        }
        res.json({
            success: true,
            tracking_id: tracking_id,
            message: 'Ticket created successfully'
        });
    });
});

// --- 3. TRACK TICKET ENDPOINT ---
app.get('/api/tickets/:tracking_id', (req, res) => {
    const { tracking_id } = req.params;
    db.get(`SELECT * FROM tickets WHERE tracking_id = ?`, [tracking_id.toUpperCase()], (err, ticket) => {
        if (err || !ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json(ticket);
    });
});

// --- 4. STAFF LOGIN ENDPOINT ---
app.post('/api/staff/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM staff WHERE username = ? AND password = ?`, [username, password], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.json({
            success: true,
            token: 'mock-jwt-token-krmangalam-12345',
            staff: {
                username: user.username,
                department: user.department,
                role: user.role
            }
        });
    });
});

// --- 5. GET ALL TICKETS (For Staff Dashboard) ---
app.get('/api/staff/tickets', (req, res) => {
    db.all(`SELECT * FROM tickets ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Backend server is running live at http://localhost:${PORT}`);
});