import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, User, Ticket, ChatHistory } from './database.js';

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'school_portal_secret_key_2026';

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH'] }));
app.use(express.json());

connectDB();

const SYSTEM_INSTRUCTION = `
You are the official, warm, cheerful, and deeply empathetic AI Front-Office Assistant for "R.D. Public School".

--- OFFICIAL SCHOOL FACTS (Keep answers simple, structured, and direct) ---
- School Name: R.D. Public School
- School Timings:
  - Nursery to Grade 2: 8:30 AM to 12:30 PM (Mon-Fri)
  - Grade 3 to Grade 12: 8:00 AM to 2:15 PM (Mon-Fri)
  - Front Office / Enquiry Desk: 8:00 AM to 3:30 PM (Mon-Sat)
- Simple 3-Step Admission Process:
  1. Fill the simple registration form online or at the front office desk.
  2. Submit basic documents: Birth Certificate, 2 passport photos, and previous report card.
  3. Friendly interaction with the teacher and fee submission to confirm the seat.
- Fee Structure (Simplified):
  - Primary (Grades 1-5): ₹4,500 / month
  - Middle (Grades 6-8): ₹5,200 / month
  - Secondary (Grades 9-12): ₹6,000 / month
  - Bus conveyance: ₹1,500 - ₹2,000 / month depending on distance.
- Facilities: Smart AC classrooms, STEM & Robotics Lab, athletic ground, basketball court, GPS-tracked buses, and 24/7 CCTV surveillance.
- Safety & Support: Dedicated full-time child counsellor and on-campus medical infirmary.

--- INSTRUCTIONS ---
1. Greet the user warmly as the R.D. Public School assistant.
2. Keep general answers simple and easy to read.
3. If a student or parent reports bullying, distress, or a safety issue, validate their feelings warmly and remind them they can immediately submit a formal ticket using the Grievance Form right beside this chat window.
`;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session. Please sign out and sign in again.' });
    req.user = user;
    next();
  });
}

// 1. REGISTER (With Role Access Code Verification)
app.post('/api/register', async (req, res) => {
  const { name, email, password, role, accessCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  const selectedRole = role || 'student';
  const STAFF_CODE = process.env.STAFF_SECRET_CODE || 'RDPS-ADMIN-2026';
  const PARENT_CODE = process.env.PARENT_SECRET_CODE || 'RDPS-PARENT-2026';

  if (selectedRole === 'staff') {
    if (!accessCode || accessCode.trim() !== STAFF_CODE) {
      return res.status(403).json({
        error: 'Invalid Teacher/Admin Authorization Code. Contact the Principal office for access.'
      });
    }
  }

  if (selectedRole === 'parent') {
    if (!accessCode || accessCode.trim() !== PARENT_CODE) {
      return res.status(403).json({
        error: 'Invalid Parent Verification Code. Check your ward’s school diary or SMS.'
      });
    }
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email is already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: selectedRole
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// 3. GET USER CHATS
app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    const messages = await ChatHistory.find({ userId: req.user.id })
      .sort({ timestamp: 1 })
      .select('sender text -_id');
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve chat history.' });
  }
});

// 4. CHAT WITH AI (Cloud Groq in Production / Local Ollama on PC)
app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    await ChatHistory.create({ userId: req.user.id, sender: 'user', text: message });
  } catch (dbErr) {
    console.error('Chat history save error:', dbErr.message);
  }

  try {
    let botReply = '';

    if (process.env.GROQ_API_KEY) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY.trim()}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: message }
          ]
        })
      });

      const rawText = await response.text();
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(`Invalid JSON from Groq (${response.status}): ${rawText.slice(0, 120)}`);
      }

      if (!response.ok) {
        throw new Error(data.error?.message || `Groq API error (${response.status})`);
      }

      botReply = data.choices?.[0]?.message?.content || 'No response from AI.';
    } else {
      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          system: SYSTEM_INSTRUCTION,
          prompt: message,
          stream: false
        })
      });
      const data = await response.json();
      botReply = data.response;
    }

    try {
      await ChatHistory.create({ userId: req.user.id, sender: 'bot', text: botReply });
    } catch (dbErr) {
      console.error('Bot reply save error:', dbErr.message);
    }

    res.json({ reply: botReply });
  } catch (err) {
    console.error('AI Chat Error:', err.message);
    res.status(500).json({
      reply: "I'm having trouble connecting to the AI service right now. Please try again shortly."
    });
  }
});

// 5. CREATE FORMAL GRIEVANCE TICKET (Student/Parent)
app.post('/api/tickets', authenticateToken, async (req, res) => {
  const { title, category, description, priority } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `RDPS-2026-${randomNum}`;

    let department = 'Front Office';
    if (category === 'Bullying' || category === 'Safety') department = 'Counsellor';
    else if (category === 'Accounts') department = 'Accounts';
    else if (category === 'Transport') department = 'Transport';
    else if (category === 'Academics') department = 'Principal';

    const newTicket = await Ticket.create({
      ticketId,
      userId: req.user.id,
      authorName: `${req.user.name} (${req.user.role})`,
      title,
      category: category || 'General',
      description,
      department,
      priority: priority || (category === 'Bullying' || category === 'Safety' ? 'Urgent' : 'Medium'),
      timeline: [{ author: req.user.name, text: 'Formal grievance submitted via portal' }]
    });

    res.json({ ticket: newTicket });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit grievance ticket.' });
  }
});

// 6. GET TICKETS (Staff gets all; Student/Parent gets their own)
app.get('/api/tickets', authenticateToken, async (req, res) => {
  try {
    const query = req.user.role === 'staff' ? {} : { userId: req.user.id };
    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load tickets.' });
  }
});

// 7. UPDATE TICKET (Staff only)
app.patch('/api/tickets/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Unauthorized. Staff access required.' });
  }

  const { status, department, note } = req.body;
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.id });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    if (status) ticket.status = status;
    if (department) ticket.department = department;
    if (note) {
      ticket.timeline.push({ author: `${req.user.name} (Staff)`, text: note });
    }

    await ticket.save();
    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ticket.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`R.D. Public School Server running on http://localhost:${PORT}`);
});