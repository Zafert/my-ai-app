'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { CloudIcon, CloudIcon2, CloudIcon3, SunIcon } from '@/components/icons';

// Add this type definition
type TextUIPart = {
  type: 'text';
  text: string;
};

// Update the SavedCard type and state
type SavedCard = {
  city: string;
  note: string;
  weather: string;
  timestamp: number;
};

// Add new animation state type
type AnimationState = {
  id: string;
  type: 'slide-left' | 'slide-right' | 'tear';
};

export default function Chat() {
  const { messages, input, handleInputChange, setMessages, setInput } = useChat();
  const [weather, setWeather] = useState<string>('Sunny');
  const [isDay, setIsDay] = useState<boolean>(true);
  const [currentCity, setCurrentCity] = useState('London');
  const [latestResponse, setLatestResponse] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    { city: 'London', note: 'Default', weather: 'Sunny', timestamp: Date.now() }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update state to track both close and save animations
  const [slidingMessageId, setSlidingMessageId] = useState<{id: string, direction: 'left' | 'right'} | null>(null);

  // Add new states at the top of the component
  const [savingCard, setSavingCard] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState('');

  // Add state for active message at the top
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  // Update the animation state
  const [animationState, setAnimationState] = useState<AnimationState | null>(null);

  // Add state to track the displayed note
  const [displayNote, setDisplayNote] = useState<string | null>(null);

  // Add a state to track cards opened from dropdown
  const [isFromDropdown, setIsFromDropdown] = useState<string | null>(null);

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

  // Add this useEffect near the other useEffect hooks
  useEffect(() => {
    // Load saved cards from localStorage on client-side
    const saved = localStorage.getItem('weatherCards');
    if (saved) {
      setSavedCards(JSON.parse(saved));
    }
  }, []); // Empty dependency array means this runs once on mount

  // Update the existing localStorage save effect
  useEffect(() => {
    if (typeof window !== 'undefined') { // Check if we're on client-side
      localStorage.setItem('weatherCards', JSON.stringify(savedCards));
    }
  }, [savedCards]);

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
        const newMessageId = Date.now().toString();
        setActiveMessageId(newMessageId);
        messages.push({
          id: newMessageId,
          role: 'assistant',
          content: weatherInfo,
          parts: [{ type: 'text', text: weatherInfo }] as TextUIPart[]
        });
        
        const cityMatch = input.match(/weather in ([a-zA-Z\s]+)/i);
        if (cityMatch) {
          setCurrentCity(cityMatch[1]);
        }
        
        setInput(''); // Clear the input after successful query
        setTimeout(scrollToBottom, 100);
      }
    }
  };

  // Update the clearMessages function
  const clearMessages = () => {
    setMessages([]); // Use setMessages instead of modifying messages directly
  };

  const handleCardSelect = async (card: SavedCard) => {
    const weatherInfo = await handleWeatherQuery(`weather in ${card.city}`);
    if (weatherInfo) {
      const newMessageId = Date.now().toString();
      setCurrentCity(card.city);
      setDisplayNote(card.note);
      setIsFromDropdown(newMessageId); // Set the flag with message ID
      setMessages(prev => [...prev, {
        id: newMessageId,
        role: 'assistant',
        content: weatherInfo,
        parts: [{ type: 'text', text: weatherInfo }] as TextUIPart[]
      }]);
      setActiveMessageId(newMessageId);
      setIsDropdownOpen(false);
    }
  };

  // Update the close handler
  const handleCloseCard = (messageId: string) => {
    setSlidingMessageId({ id: messageId, direction: 'left' });
    setTimeout(() => {
      setMessages(messages.filter(m => m.id !== messageId));
      setSlidingMessageId(null);
    }, 500);
  };

  // Update the save handler
  const handleSaveCard = (messageId: string) => {
    setSavingCard(messageId);
    setSaveNote('');
  };

  // Add new handlers
  const handleCancelSave = () => {
    setSavingCard(null);
    setSaveNote('');
  };

  // Update the handleConfirmSave function
  const handleConfirmSave = (messageId: string) => {
    const messageToSave = messages.find(m => m.id === messageId);
    if (!messageToSave) return;

    // Create new card
    const newCard: SavedCard = {
      city: currentCity,
      note: saveNote,
      weather: messageToSave.content,
      timestamp: Date.now()
    };

    // Add to saved cards
    setSavedCards(prev => [newCard, ...prev]);

    // Animate and remove message
    setSlidingMessageId({ id: messageId, direction: 'right' });
    setTimeout(() => {
      setMessages(messages.filter(m => m.id !== messageId));
      setSlidingMessageId(null);
      setSavingCard(null);
      setSaveNote('');
    }, 500);
  };

  // Update the delete handler
  const handleDeleteSavedCard = (messageContent: string) => {
    const messageId = activeMessageId;
    if (!messageId) return;
    
    const cardToDelete = savedCards.find(card => card.weather === messageContent);
    if (!cardToDelete) return;

    setAnimationState({ id: messageId, type: 'tear' });
    setTimeout(() => {
      setSavedCards(prev => prev.filter(card => card.timestamp !== cardToDelete.timestamp));
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setActiveMessageId(null);
      setAnimationState(null);
    }, 500);
  };

  // Update isFromSavedCard to check the dropdown flag
  const isFromSavedCard = (messageId: string) => {
    return messageId === isFromDropdown;
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
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center"
            >
              Saved Cards
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white/80 backdrop-blur-sm rounded-md shadow-lg border border-white/30">
                <div className="py-1">
                  {savedCards.length > 0 ? (
                    savedCards.map((card, index) => (
                      <button
                        key={card.timestamp}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
                        onClick={() => handleCardSelect(card)}
                      >
                        <div className="font-medium text-gray-700">{card.city}</div>
                        <div className="text-gray-500 text-xs truncate">{card.note}</div>
                        <div className="text-gray-400 text-xs">
                          {new Date(card.timestamp).toLocaleDateString()}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="text-gray-400 text-sm">
                        No saved dates exist
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        Save a weather card to see it here
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch min-h-screen">
        <div className="flex-1 overflow-y-auto w-full">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`whitespace-pre-wrap transition-all duration-500 ${
                message.role === 'assistant' && message.id === activeMessageId
                  ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4' 
                  : 'bg-white/60 backdrop-blur-sm rounded-lg p-4 mb-4 shadow-md border border-white/30'
              } ${
                slidingMessageId?.id === message.id 
                  ? slidingMessageId.direction === 'left' 
                    ? '-translate-x-[150vw]' 
                    : 'translate-x-[150vw]'
                  : ''
              } ${message.role === 'assistant' && message.id !== activeMessageId ? 'hidden' : ''}`}
            >
              {message.role === 'user' ? (
                <>
                  <div className="font-medium text-blue-600">User: </div>
                  {message.parts.map((part, i) => (
                    <div key={`${message.id}-${i}`}>{part.text}</div>
                  ))}
                </>
              ) : (
                <div className="relative">
                  <div 
                    className={`bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/30 ${
                      animationState?.id === message.id ? 'opacity-0' : ''
                    }`}
                  >
                    {savingCard === message.id ? (
                      <div className="transform scale-110 transition-transform">
                        <input
                          type="text"
                          className="w-full p-2 mb-4 rounded shadow-sm bg-white/90 border border-white/30"
                          placeholder="How would you like to save this day?"
                          value={saveNote}
                          onChange={(e) => setSaveNote(e.target.value)}
                          autoFocus
                        />
                        {message.content}
                        <div className="flex justify-between mt-4">
                          <button 
                            onClick={handleCancelSave}
                            className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleConfirmSave(message.id)}
                            className={`px-3 py-1 text-white rounded-md text-sm ${
                              saveNote.trim() 
                                ? 'bg-blue-500 hover:bg-blue-600' 
                                : 'bg-blue-300 cursor-not-allowed'
                            }`}
                            disabled={!saveNote.trim()}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {displayNote && isFromSavedCard(message.id) && (
                          <div className="mb-4 text-lg font-semibold text-gray-700">
                            <span className="text-gray-500 font-medium">Note:</span> {displayNote}
                          </div>
                        )}
                        <div className="flex justify-between mb-4">
                          {!isFromSavedCard(message.id) ? (
                            <>
                              <button 
                                onClick={() => handleCloseCard(message.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                              >
                                Close
                              </button>
                              <button 
                                onClick={() => handleSaveCard(message.id)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                              >
                                Save
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleDeleteSavedCard(message.content)}
                                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                              >
                                Delete
                              </button>
                              <button 
                                onClick={() => setActiveMessageId(null)}
                                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                              >
                                Close
                              </button>
                            </>
                          )}
                        </div>
                        {message.content}
                      </>
                    )}
                  </div>
                  {animationState?.id === message.id && animationState.type === 'tear' && (
                    <>
                      <div 
                        className="absolute top-0 left-0 w-full h-full bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/30"
                        style={{
                          clipPath: 'polygon(0 0, 49% 0, 45% 100%, 0 100%)',
                          animation: 'tear-left 0.5s ease-in forwards'
                        }}
                      >
                        {message.content}
                      </div>
                      <div 
                        className="absolute top-0 right-0 w-full h-full bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/30"
                        style={{
                          clipPath: 'polygon(51% 0, 100% 0, 100% 100%, 55% 100%)',
                          animation: 'tear-right 0.5s ease-in forwards'
                        }}
                      >
                        {message.content}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="absolute left-1/2 top-[60%] -translate-x-1/2 w-full max-w-md px-4">
          <input
            type="text"
            className="w-full p-2 rounded shadow-sm bg-white/60 backdrop-blur-sm border border-white/30 overflow-hidden"
            placeholder="Search for the City"
            value={input}
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