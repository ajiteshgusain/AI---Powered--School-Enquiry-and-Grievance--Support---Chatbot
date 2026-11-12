// import React, { useState } from 'react';
// import Dashboard from './components/Dashboard';
// import ChatBot from './components/ChatBot';

// export default function App() {
//   const [activeTab, setActiveTab] = useState('dashboard');



//   return (
//     <div>
//       <nav className="navbar">
//         <div className="brand">
//           <h2>School Front Office & AI Support</h2>
//           <span className="subtitle">School Support Platform</span>
//         </div>
//         <div className="tabs">
//           <button 
//             className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
//             onClick={() => setActiveTab('chat')}
//           >
//             Student/Parent Chat
//           </button>
//           <button 
//             className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
//             onClick={() => setActiveTab('dashboard')}
//           >
//             Staff Dashboard
//           </button>
//         </div>
//       </nav>

//       {activeTab === 'chat' ? <ChatBot /> : <Dashboard />}
//     </div>
//   );
// }