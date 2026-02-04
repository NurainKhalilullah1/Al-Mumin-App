import React, { useState, useEffect } from 'react';
import { getTickerNotices } from '../utils/db'; // <--- NEW IMPORT

const NewsTicker = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadMessages = async () => {
      // Re-fetch every time component loads (or use an event listener in a real app)
      const data = await getTickerNotices();
      setMessages(data);
    };
    loadMessages();

    // Poll for updates every 15 seconds (Simple "live" effect - Increased to 15s to reduce load)
    const interval = setInterval(loadMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  if (messages.length === 0) return null; // Hide if empty

  return (
    <div className="bg-schoolGreen text-white text-xs py-2 overflow-hidden relative border-b border-white/10 z-[60]">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="bg-schoolGold text-schoolGreen font-bold px-3 py-0.5 rounded text-[10px] uppercase tracking-widest mr-4 z-10 shrink-0">
          Latest Updates
        </div>
        <div className="whitespace-nowrap animate-marquee flex items-center w-full">
          {messages.map((msg, index) => (
            <React.Fragment key={msg.id}>
              <span className="mx-8 font-medium">{msg.message}</span>
              <span className="mx-8 text-schoolGold">•</span>
              {/* Clone for loop illusion if few items (simple method) */}
              {messages.length < 3 && (
                <>
                  <span className="mx-8 font-medium">{msg.message}</span>
                  <span className="mx-8 text-schoolGold">•</span>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;