'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { CloudIcon, CloudIcon2, CloudIcon3, SunIcon } from '@/components/icons';

// Add this type definition
type TextUIPart = {
  type: 'text';
  text: string;
};

export default function Chat() {
  const { messages, input, handleInputChange, setMessages } = useChat();
  const [weather, setWeather] = useState<string>('Sunny');
  const [isDay, setIsDay] = useState<boolean>(true);
  const [currentCity, setCurrentCity] = useState('London');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function fetchWeather(city: string) {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      setWeather(data.condition);
      setIsDay(data.isDay);
      setCurrentCity(data.city);
    }
    
    fetchWeather(currentCity);
    const interval = setInterval(() => fetchWeather(currentCity), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentCity]);

  // Updated weather conditions mapping
  const renderWeatherIcons = () => {
    return (
      <>
        {/* Sun always visible */}
        <div className="relative z-0">
          <SunIcon />
        </div>
        
        {/* All clouds with different positions and animations */}
        <div className="relative z-10">
          <div className="animate-float">
            <CloudIcon />
          </div>
          <div className="animate-float-delayed2 -mt-36">
            <CloudIcon3 />
          </div>
          <div className="animate-float-delayed -mt-36">
            <CloudIcon2 />
          </div>
        </div>
      </>
    );
  };

  // Add a function to handle weather queries
  const handleWeatherQuery = async (message: string) => {
    const cityMatch = message.match(/weather in ([a-zA-Z\s]+)/i);
    if (cityMatch) {
      const city = cityMatch[1];
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      
      // Format the weather response
      return `Current weather in ${data.city}, ${data.country}:
• Condition: ${data.condition}
• Temperature: ${data.temperature}°C (Feels like ${data.feelsLike}°C)
• Humidity: ${data.humidity}%
• Wind: ${data.windSpeed} km/h ${data.windDirection}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (input.toLowerCase().includes('weather in')) {
      const weatherInfo = await handleWeatherQuery(input);
      if (weatherInfo) {
        messages.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: weatherInfo,
          parts: [{ type: 'text', text: weatherInfo }] as TextUIPart[]
        });
        
        const cityMatch = input.match(/weather in ([a-zA-Z\s]+)/i);
        if (cityMatch) {
          setCurrentCity(cityMatch[1]);
        }
        
        // Scroll to bottom after adding message
        setTimeout(scrollToBottom, 100);
      }
    }
  };

  // Update the clearMessages function
  const clearMessages = () => {
    setMessages([]); // Use setMessages instead of modifying messages directly
  };

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-sky-100 via-blue-200 to-emerald-200 -z-10" />
      
      {/* Weather display */}
      <div className="fixed top-0 left-0 right-0 w-full overflow-hidden pointer-events-none">
        {renderWeatherIcons()}
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/60 backdrop-blur-sm border-b border-white/30 shadow-sm z-20">
        <div className="max-w-md mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold text-gray-800">My Weather App</h1>
          <div className="space-x-2">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Top
            </button>
            <button 
              onClick={clearMessages}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch min-h-screen">
        <div className="flex-1 overflow-y-auto w-full">
          {messages.map(message => (
            <div key={message.id} className="whitespace-pre-wrap bg-white/60 backdrop-blur-sm rounded-lg p-4 mb-4 shadow-md border border-white/30">
              {message.role === 'user' ? (
                <div className="font-medium text-blue-600">User: </div>
              ) : (
                <div className="font-medium text-emerald-600">AI: </div>
              )}
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <div key={`${message.id}-${i}`}>{part.text}</div>;
                  case 'tool-invocation':
                    return (
                      <pre key={`${message.id}-${i}`}>
                        {JSON.stringify(part.toolInvocation, null, 2)}
                      </pre>
                    );
                }
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit}>
          <input
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 bg-white/60 backdrop-blur-sm rounded-lg shadow-md border border-white/30"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </>
  );
}

// Update animation styles
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0) }
    50% { transform: translateY(-8px) }
  }

  .animate-float {
    animation: float 12s ease-in-out infinite;
  }

  .animate-float-delayed {
    animation: float 12s ease-in-out infinite;
    animation-delay: -6s;
  }

  .animate-float-delayed2 {
    animation: float 12s ease-in-out infinite;
    animation-delay: -3s;
  }
`;