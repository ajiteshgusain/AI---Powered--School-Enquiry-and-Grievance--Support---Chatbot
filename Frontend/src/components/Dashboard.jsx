import React, { useState } from 'react';

const INITIAL_TICKETS = [
  {
    id: "SCH-2026-0047",
    title: "Bullying on the school bus",
    author: "Sunita Sharma (Parent)",
    category: "Bullying",
    received: "30 Sept, 6:01 pm",
    department: "Counsellor",
    status: "New",
    priority: "Urgent",
    assigned: "Unassigned",
    desc: "My son says older students push and threaten him on bus route 4 every morning.",
    timeline: [{ author: "Chatbot", text: "Complaint received via chatbot", time: "30 Sept, 6:01 pm" }]
  },
  {
    id: "SCH-2026-0042",
    title: "Feeling unsafe near back gate",
    author: "Rohan V. (Student)",
    category: "Safety",
    received: "30 Sept, 4:15 pm",
    department: "Principal",
    status: "In Progress",
    priority: "Urgent",
    assigned: "Principal",
    desc: "Streetlights are completely out near the back gate boundary.",
    timeline: [{ author: "Chatbot", text: "Complaint received via chatbot", time: "30 Sept, 4:15 pm" }]
  },
  {
    id: "SCH-2026-0046",
    title: "Fee receipt shows wrong amount",
    author: "Amit K. (Parent)",
    category: "Accounts",
    received: "29 Sept, 11:20 am",
    department: "Accounts",
    status: "Assigned",
    priority: "High",
    assigned: "Finance Desk",
    desc: "Quarter 3 bus conveyance was charged twice on receipt #4102.",
    timeline: [{ author: "Chatbot", text: "Complaint received via chatbot", time: "29 Sept, 11:20 am" }]
  }
];

export default function Dashboard() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState(INITIAL_TICKETS[0]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [note, setNote] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveNote = () => {
    if (!note.trim() || !selectedTicket) return;
    const updated = {
      ...selectedTicket,
      timeline: [...selectedTicket.timeline, { author: "Staff", text: note, time: "Just now" }]
    };
    setSelectedTicket(updated);
    setTickets(tickets.map(t => t.id === updated.id ? updated : t));
    setNote('');
  };

  return (
    <div className="container">
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-num">10</span>
          <span className="metric-label">Open tickets</span>
        </div>
        <div className="metric-card">
          <span className="metric-num">3</span>
          <span className="metric-label">New, unassigned</span>
        </div>
        <div className="metric-card alert-urgent">
          <span className="metric-num">2</span>
          <span className="metric-label">Urgent open</span>
        </div>
        <div className="metric-card alert-stale">
          <span className="metric-num">2</span>
          <span className="metric-label">Untouched 3+ days</span>
        </div>
        <div className="metric-card">
          <span className="metric-num">2</span>
          <span className="metric-label">Resolved</span>
        </div>
      </div>

      <div className="split-view">
        <div className="card">
          <div className="filter-bar">
            <input 
              type="text" 
              placeholder="Search tickets..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)} 
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="tickets-list">
            {filteredTickets.map(t => (
              <div 
                key={t.id} 
                className={`ticket-item ${selectedTicket?.id === t.id ? 'active' : ''}`}
                onClick={() => setSelectedTicket(t)}
              >
                <div className="ticket-header">
                  <span>{t.title}</span>
                  <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                </div>
                <div className="ticket-meta">
                  <span>{t.id}</span> · 
                  <span>{t.department}</span> · 
                  <span className="badge badge-new">{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          {selectedTicket ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{selectedTicket.title}</h3>
                <span className={`badge badge-${selectedTicket.priority.toLowerCase()}`}>{selectedTicket.priority}</span>
              </div>
              <p className="subtitle" style={{ margin: '4px 0 14px 0' }}>
                {selectedTicket.id} · {selectedTicket.author} · Received {selectedTicket.received}
              </p>

              <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px', border: '1px solid #eee', marginBottom: '16px' }}>
                {selectedTicket.desc}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Status</label>
                  <select 
                    style={{ width: '100%' }}
                    value={selectedTicket.status}
                    onChange={(e) => {
                      const updated = { ...selectedTicket, status: e.target.value };
                      setSelectedTicket(updated);
                      setTickets(tickets.map(t => t.id === updated.id ? updated : t));
                    }}
                  >
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Department</label>
                  <select 
                    style={{ width: '100%' }}
                    value={selectedTicket.department}
                    onChange={(e) => {
                      const updated = { ...selectedTicket, department: e.target.value };
                      setSelectedTicket(updated);
                      setTickets(tickets.map(t => t.id === updated.id ? updated : t));
                    }}
                  >
                    <option value="Counsellor">Counsellor</option>
                    <option value="Principal">Principal</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Transport">Transport</option>
                    <option value="Facilities">Facilities</option>
                  </select>
                </div>
              </div>

              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Add a note</label>
              <textarea 
                style={{ width: '100%', height: '70px', marginBottom: '10px' }}
                placeholder="What did you do or decide?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleSaveNote}>Save note</button>

              <h4 style={{ fontSize: '0.88rem', margin: '20px 0 8px 0' }}>Accountability timeline</h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedTicket.timeline.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    • <strong>{item.author}</strong>: {item.text} <span style={{ opacity: 0.7 }}>({item.time})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="subtitle">Select a ticket to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}