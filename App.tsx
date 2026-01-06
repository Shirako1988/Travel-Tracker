import React, { useState, useEffect, useRef } from 'react';
import { TravelPace, AppState, TravelLogEntry } from './types';
import { PACE_RULES, MAX_TRAVEL_HOURS, FORCED_MARCH_BASE_DC, FORCED_MARCH_DC_INC } from './constants';
import { ProgressBar } from './components/ProgressBar';

const App: React.FC = () => {
  // Application State
  const [state, setState] = useState<AppState>({
    totalDistance: 100,
    traveledDistance: 0,
    pace: TravelPace.NORMAL,
    day: 1,
    hoursTraveledToday: 0,
    logs: [],
    exhaustion: 0,
  });

  const [inputDistance, setInputDistance] = useState<number>(100);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [state.logs]);

  // Handler: Update Total Distance
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setInputDistance(val);
    setState(prev => ({ ...prev, totalDistance: val }));
  };

  // Handler: Change Pace
  const handlePaceChange = (pace: TravelPace) => {
    setState(prev => ({ ...prev, pace }));
  };

  // Logic: Travel
  const travel = (hours: number) => {
    const { pace, hoursTraveledToday, day, traveledDistance } = state;
    const speed = PACE_RULES[pace].speed;
    const distanceCovered = hours * speed;
    const newHoursTotal = hoursTraveledToday + hours;
    
    // Forced March Calculation
    const forcedHours = Math.max(0, newHoursTotal - MAX_TRAVEL_HOURS);
    const isForcedMarch = newHoursTotal > MAX_TRAVEL_HOURS;
    
    let logMessage = `Traveled ${hours} hour(s) at ${pace} pace (${distanceCovered} miles).`;
    let dc = 0;

    if (isForcedMarch) {
      // Calculate DC for the *current* hour of forced march
      // If we travel 1 hour and it is the 9th hour, the DC is 10 + 1 = 11.
      const hoursOver = newHoursTotal - MAX_TRAVEL_HOURS;
      dc = FORCED_MARCH_BASE_DC + hoursOver;
      logMessage += ` Forced March! CON Save DC ${dc} to avoid exhaustion.`;
    }

    const newLog: TravelLogEntry = {
      id: Date.now().toString(),
      day,
      hour: newHoursTotal,
      distanceDelta: distanceCovered,
      description: logMessage,
      isForcedMarch,
      conSaveDC: isForcedMarch ? dc : undefined
    };

    setState(prev => ({
      ...prev,
      traveledDistance: Math.min(prev.totalDistance, prev.traveledDistance + distanceCovered),
      hoursTraveledToday: newHoursTotal,
      logs: [...prev.logs, newLog]
    }));
  };

  // Logic: Long Rest
  const handleLongRest = () => {
    setState(prev => ({
      ...prev,
      day: prev.day + 1,
      hoursTraveledToday: 0,
      logs: [...prev.logs, {
        id: Date.now().toString(),
        day: prev.day,
        hour: prev.hoursTraveledToday,
        distanceDelta: 0,
        description: "Took a Long Rest. Day ends. Travel time reset.",
        isForcedMarch: false
      }]
    }));
  };

  // Logic: Reset App
  const handleReset = () => {
    setState({
      totalDistance: inputDistance,
      traveledDistance: 0,
      pace: TravelPace.NORMAL,
      day: 1,
      hoursTraveledToday: 0,
      logs: [],
      exhaustion: 0
    });
  };

  const remainingDistance = state.totalDistance - state.traveledDistance;
  const isFinished = remainingDistance <= 0;
  const hoursUntilForced = Math.max(0, MAX_TRAVEL_HOURS - state.hoursTraveledToday);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-parchment-100 rounded-lg shadow-2xl overflow-hidden border-4 border-parchment-300">
        
        {/* Header */}
        <header className="bg-dragon-red text-parchment-100 p-6 text-center border-b-4 border-dragon-gold">
          <h1 className="text-4xl font-serif font-black tracking-wider uppercase drop-shadow-md">
            Traveler's Trek
          </h1>
          <p className="font-sans text-parchment-300 mt-2 text-sm uppercase tracking-widest">
            D&D 5e Distance Tracker
          </p>
        </header>

        <main className="p-6 md:p-8">
          
          {/* Configuration Section */}
          <section className="bg-parchment-200 p-6 rounded-lg border border-parchment-300 mb-8 shadow-sm">
            <h2 className="text-2xl font-serif text-parchment-900 mb-4 border-b border-parchment-800 pb-2">
              Journey Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Distance Input */}
              <div className="flex flex-col">
                <label className="font-bold text-parchment-800 mb-1">Total Distance (Miles)</label>
                <input 
                  type="number" 
                  min="1"
                  value={inputDistance} 
                  onChange={handleDistanceChange}
                  disabled={state.traveledDistance > 0}
                  className="bg-white border-2 border-parchment-300 p-2 rounded font-mono text-lg focus:border-dragon-red outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Pace Selector */}
              <div className="flex flex-col">
                <label className="font-bold text-parchment-800 mb-1">Travel Pace</label>
                <div className="flex rounded-md shadow-sm" role="group">
                  {Object.values(TravelPace).map((paceOption) => (
                    <button
                      key={paceOption}
                      onClick={() => handlePaceChange(paceOption)}
                      className={`
                        flex-1 px-4 py-2 text-sm font-medium border border-parchment-800
                        ${state.pace === paceOption 
                          ? 'bg-dragon-red text-white' 
                          : 'bg-parchment-100 text-parchment-900 hover:bg-parchment-200'}
                        ${paceOption === TravelPace.SLOW ? 'rounded-l-lg' : ''}
                        ${paceOption === TravelPace.FAST ? 'rounded-r-lg' : ''}
                      `}
                    >
                      {paceOption}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-parchment-800 mt-2 italic font-serif">
                  Effect: {PACE_RULES[state.pace].effect}
                </p>
              </div>
            </div>
          </section>

          {/* Visual Progress */}
          <section className="mb-8">
            <ProgressBar current={state.traveledDistance} total={state.totalDistance} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Controls Panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-parchment-800 text-parchment-100 p-4 rounded-lg shadow-lg">
                <div className="text-center mb-4">
                  <div className="text-3xl font-serif font-bold">Day {state.day}</div>
                  <div className="text-sm uppercase tracking-widest text-parchment-300">
                    Hour {state.hoursTraveledToday}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Safe Hours Left:</span>
                    <span className="font-bold text-dragon-gold">{hoursUntilForced}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Speed:</span>
                    <span className="font-bold">{PACE_RULES[state.pace].speed} mph</span>
                  </div>
                </div>
              </div>

              {!isFinished && (
                <div className="space-y-3">
                  <button 
                    onClick={() => travel(1)}
                    className={`w-full py-3 rounded font-serif font-bold text-lg shadow-md transition-transform active:scale-95 border-2
                      ${state.hoursTraveledToday >= MAX_TRAVEL_HOURS 
                        ? 'bg-red-800 text-white border-red-900 hover:bg-red-700' 
                        : 'bg-white text-parchment-900 border-parchment-300 hover:bg-parchment-100'}
                    `}
                  >
                    {state.hoursTraveledToday >= MAX_TRAVEL_HOURS ? 'Forced March (+1 hr)' : 'Travel 1 Hour'}
                  </button>

                  <button 
                    onClick={() => travel(Math.min(MAX_TRAVEL_HOURS, remainingDistance / PACE_RULES[state.pace].speed))}
                    disabled={state.hoursTraveledToday >= MAX_TRAVEL_HOURS}
                    className="w-full bg-dragon-gold text-parchment-900 border-2 border-yellow-600 py-3 rounded font-serif font-bold text-lg shadow-md hover:bg-yellow-400 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Travel Normal Day
                  </button>

                  <button 
                    onClick={handleLongRest}
                    className="w-full bg-parchment-800 text-parchment-100 border-2 border-black py-3 rounded font-serif font-bold text-lg shadow-md hover:bg-gray-700 transition-transform active:scale-95"
                  >
                    Take Long Rest (Next Day)
                  </button>
                </div>
              )}

              {isFinished && (
                <div className="bg-green-100 border-2 border-green-600 p-4 rounded text-center">
                  <h3 className="text-xl font-bold text-green-800 mb-2">Arrival!</h3>
                  <p className="text-green-900">You have reached your destination.</p>
                  <button 
                    onClick={handleReset}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Start New Journey
                  </button>
                </div>
              )}
            </div>

            {/* Log Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white border-2 border-parchment-300 rounded-lg h-96 flex flex-col shadow-inner">
                <div className="bg-parchment-200 p-2 border-b border-parchment-300 font-bold text-parchment-800 font-serif flex justify-between items-center">
                  <span>Adventure Log</span>
                  <span className="text-xs font-sans font-normal opacity-70">Newest at bottom</span>
                </div>
                <div 
                  ref={logContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
                >
                  {state.logs.length === 0 && (
                    <p className="text-gray-400 text-center italic mt-10">The journey begins with a single step...</p>
                  )}
                  
                  {state.logs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded border-l-4 text-sm ${
                        log.description.includes("Rest") 
                          ? "bg-blue-50 border-blue-400" 
                          : log.isForcedMarch 
                            ? "bg-red-50 border-red-500" 
                            : "bg-parchment-100 border-parchment-400"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-parchment-900">Day {log.day}, Hour {log.hour}</span>
                        {log.isForcedMarch && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full border border-red-200 font-bold">
                            CON Save DC {log.conSaveDC}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700">{log.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;