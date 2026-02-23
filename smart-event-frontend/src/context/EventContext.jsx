import { createContext, useState, useEffect } from "react";

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const savedEvent = localStorage.getItem("activeEvent");
    if (savedEvent) {
      try {
        setEvent(JSON.parse(savedEvent));
      } catch (e) {
        console.error("Failed to parse saved event", e);
      }
    }
  }, []); // Keeps the active event even after page refresh

  const updateEvent = (newEvent) => {
    setEvent(newEvent);
    if (newEvent) {
      localStorage.setItem("activeEvent", JSON.stringify(newEvent));
    } else {
      localStorage.removeItem("activeEvent");
    }
  };

  return (
    <EventContext.Provider value={{ event, setEvent: updateEvent }}>
      {children}
    </EventContext.Provider>
  );
};