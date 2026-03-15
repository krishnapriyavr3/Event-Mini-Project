import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Bot, SendHorizontal } from "lucide-react";
import { apiService } from "../apiService";
import { EventContext } from "../context/EventContext";
import "./create-event.css";

const EVENT_TYPE_SUGGESTIONS = ["Workshop", "Seminar", "Cultural", "Technical", "Conference", "Networking"];

const QUESTIONS = [
  {
    key: "name",
    prompt: "Let’s create your event. What should I call it?",
    placeholder: "Event name",
    required: true,
  },
  {
    key: "type",
    prompt: "Nice. What type of event is this?",
    placeholder: "Event type",
    required: true,
    suggestions: EVENT_TYPE_SUGGESTIONS,
  },
  {
    key: "date",
    prompt: "Great. What is the event date? (YYYY-MM-DD)",
    placeholder: "YYYY-MM-DD",
    required: true,
  },
  {
    key: "location",
    prompt: "Where will this event happen?",
    placeholder: "Location",
    required: true,
  },
  {
    key: "budget",
    prompt: "What is the estimated budget? (Type 'skip' if not needed)",
    placeholder: "Budget or skip",
    required: false,
  },
  {
    key: "description",
    prompt: "Any short description? (Type 'skip' if not needed)",
    placeholder: "Description or skip",
    required: false,
  },
];

const getTodayLocalDateText = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function CreateEvent() {
  const { setEvent } = useContext(EventContext);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: "",
    location: "",
    description: "",
    budget: "",
  });
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I’m your Event AI assistant." },
    { role: "assistant", content: QUESTIONS[0].prompt },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const messageEndRef = useRef(null);

  const activeQuestion = useMemo(() => QUESTIONS[currentStep] || null, [currentStep]);

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsAssistantTyping(false), 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSubmitting, isAssistantTyping]);

  useEffect(() => {
    const canvas = document.querySelector(".particle-network-create");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = 1.4;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
        if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;
      }

      draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
      }
    }

    const createParticles = () => {
      particles = [];
      for (let index = 0; index < 55; index += 1) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(14, 165, 233, 0.55)";
      context.strokeStyle = "rgba(14, 165, 233, 0.2)";

      particles.forEach((particle, currentIndex) => {
        particle.update();
        particle.draw();

        for (let nextIndex = currentIndex + 1; nextIndex < particles.length; nextIndex += 1) {
          const target = particles[nextIndex];
          const distance = Math.hypot(particle.x - target.x, particle.y - target.y);
          if (distance < 120) {
            context.globalAlpha = 1 - distance / 120;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(target.x, target.y);
            context.stroke();
            context.globalAlpha = 1;
          }
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener("resize", resizeCanvas);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const appendMessage = (role, content) => {
    setMessages((previousMessages) => [...previousMessages, { role, content }]);
  };

  const normalizeAnswer = (question, rawAnswer) => {
    const value = rawAnswer.trim();
    const wantsSkip = value.toLowerCase() === "skip";

    if (!question.required && wantsSkip) {
      return { valid: true, value: "" };
    }

    if (question.required && !value) {
      return { valid: false, error: "This answer is required. Please enter a value." };
    }

    if (question.key === "date") {
      const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
      if (!isValidDate) {
        return { valid: false, error: "Please use date format YYYY-MM-DD." };
      }

      const todayText = getTodayLocalDateText();
      if (value < todayText) {
        return { valid: false, error: "Event date cannot be before today." };
      }
    }

    if (question.key === "budget" && value && !/^\d+(\.\d+)?$/.test(value)) {
      return { valid: false, error: "Budget should be a number, or type 'skip'." };
    }

    return { valid: true, value };
  };

  const submitEvent = async (finalData) => {
    setIsSubmitting(true);
    appendMessage("assistant", "Perfect. Creating your event now...");

    try {
      const response = await apiService.createEvent(finalData);

      setEvent({
        event_id: response.event_id,
        name: finalData.name,
        type: finalData.type,
        date: finalData.date,
        location: finalData.location,
        description: finalData.description,
        budget: finalData.budget,
      });

      appendMessage("assistant", `✅ Event created successfully! Event ID: ${response.event_id}`);
      setIsCompleted(true);
    } catch (error) {
      appendMessage("assistant", "I couldn’t create the event. Please check backend connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const processAnswer = async (rawAnswer) => {
    if (!activeQuestion || isSubmitting || isCompleted) return;

    const answer = rawAnswer.trim();
    if (!answer) return;

    appendMessage("user", answer);
    setInputValue("");

    const parsed = normalizeAnswer(activeQuestion, answer);
    if (!parsed.valid) {
      appendMessage("assistant", parsed.error);
      return;
    }

    const nextFormData = { ...formData, [activeQuestion.key]: parsed.value };
    setFormData(nextFormData);

    const nextStep = currentStep + 1;
    if (nextStep < QUESTIONS.length) {
      setCurrentStep(nextStep);
      appendMessage("assistant", QUESTIONS[nextStep].prompt);
      return;
    }

    appendMessage("assistant", "Thanks! I have everything I need.");
    await submitEvent(nextFormData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await processAnswer(inputValue);
  };

  const applySuggestion = async (value) => {
    await processAnswer(value);
  };

  const restartConversation = () => {
    setFormData({
      name: "",
      type: "",
      date: "",
      location: "",
      description: "",
      budget: "",
    });
    setMessages([
      { role: "assistant", content: "Starting fresh. Let’s create another event." },
      { role: "assistant", content: QUESTIONS[0].prompt },
    ]);
    setCurrentStep(0);
    setInputValue("");
    setIsCompleted(false);
  };

  return (
    <div className="create-event">
      <canvas className="particle-network-create" />

      <div className="chat-shell">
        <div className="chat-shell-header">
          <div className="assistant-title">
            <Bot size={20} />
            Event AI Assistant
          </div>
          <span className="assistant-status">Live</span>
        </div>

        <div className="chat-thread">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
              {message.content}
            </div>
          ))}

          {(isAssistantTyping || isSubmitting) && (
            <div className="chat-typing" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {activeQuestion?.suggestions && !isCompleted && (
          <div className="chat-suggestions">
            {activeQuestion.suggestions.map((suggestion) => (
              <button key={suggestion} type="button" className="chat-chip" onClick={() => applySuggestion(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {isCompleted && (
          <div className="chat-actions">
            <button type="button" className="chat-chip action" onClick={restartConversation}>
              Create Another Event
            </button>
          </div>
        )}

        <form className="chat-composer" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={activeQuestion?.placeholder || "Conversation complete"}
            disabled={isSubmitting || isCompleted}
          />
          <button type="submit" className="chat-send" disabled={isSubmitting || isCompleted || !inputValue.trim()}>
            <SendHorizontal size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}