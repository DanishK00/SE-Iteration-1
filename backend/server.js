const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

const OLLAMA_CHAT_URL = "http://localhost:11434/api/chat";

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.send("TLEB backend is running with Ollama model selection, math, and live weather.");
});

app.get("/api/models", function (req, res) {
  res.json({
    models: [
      {
        id: "phi3",
        label: "Local Small - phi3",
        note: "Small local model"
      },
      {
        id: "mistral",
        label: "Local - mistral",
        note: "Mistral local model"
      },
      {
        id: "gpt-oss",
        label: "ChatGPT/OpenAI Style - gpt-oss",
        note: "OpenAI open-weight style model through Ollama"
      },
      {
        id: "gemini-3-flash-preview",
        label: "Gemini - gemini-3-flash-preview",
        note: "Gemini model through Ollama"
      },
      {
        id: "gpt-oss",
        label: "Claude Code Compatible - gpt-oss",
        note: "Claude-style option routed through gpt-oss"
      }
    ]
  });
});

app.post("/api/chat", async function (req, res) {
  try {
    const userMessage = req.body.message;
    const selectedModel = req.body.model || "phi3";

    if (!userMessage) {
      return res.status(400).json({
        error: "No message was provided."
      });
    }

    console.log("Received message:", userMessage);
    console.log("Selected model:", selectedModel);

    // Math tool
    if (looksLikeMath(userMessage)) {
      const mathAnswer = solveMath(userMessage);

      if (mathAnswer !== null) {
        return res.json({
          reply: `The answer is ${mathAnswer}.`,
          model: selectedModel,
          toolUsed: "math"
        });
      }
    }

    // Weather tool
    if (looksLikeWeatherQuestion(userMessage)) {
      const location = extractWeatherLocation(userMessage);
      const weatherReply = await getWeather(location);

      return res.json({
        reply: weatherReply,
        model: selectedModel,
        toolUsed: "open-meteo-weather"
      });
    }

    // Normal Ollama LLM chat
    const ollamaResponse = await fetch(OLLAMA_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content:
              "You are TLEB, a helpful AI assistant. Keep answers clear, useful, and not too long."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        stream: false
      })
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error("Ollama error:", errorText);

      return res.status(500).json({
        error:
          "Ollama had an issue. Make sure the selected model is installed or available in Ollama."
      });
    }

    const data = await ollamaResponse.json();

    res.json({
      reply: data.message.content,
      model: selectedModel,
      toolUsed: "ollama-chat"
    });
  } catch (error) {
    console.error("Backend error:", error);

    res.status(500).json({
      error:
        "Something went wrong. Make sure Ollama is running and your backend is started."
    });
  }
});

function looksLikeMath(message) {
  return /[\d]+\s*[\+\-\*\/]\s*[\d]+/.test(message);
}

function solveMath(message) {
  const match = message.match(/([\d\.\s\+\-\*\/\(\)]+)/);

  if (!match) {
    return null;
  }

  const expression = match[1].trim();

  if (!/^[\d\.\s\+\-\*\/\(\)]+$/.test(expression)) {
    return null;
  }

  try {
    const answer = Function(`"use strict"; return (${expression});`)();

    if (Number.isFinite(answer)) {
      return answer;
    }

    return null;
  } catch {
    return null;
  }
}

function looksLikeWeatherQuestion(message) {
  const lower = message.toLowerCase();

  return (
    lower.includes("weather") ||
    lower.includes("temperature") ||
    lower.includes("forecast")
  );
}

function extractWeatherLocation(message) {
  let location = message.trim();

  const cleanupWords = [
    "what is",
    "what's",
    "whats",
    "tell me",
    "show me",
    "give me",
    "the",
    "current",
    "right now",
    "currently",
    "today",
    "now",
    "like",
    "weather",
    "temperature",
    "forecast",
    "in",
    "for",
    "at"
  ];

  location = location.replace(/\?/g, "");

  cleanupWords.forEach(function (word) {
    const regex = new RegExp("\\b" + word + "\\b", "gi");
    location = location.replace(regex, "");
  });

  location = location.replace(/\s+/g, " ").trim();

  if (location === "") {
    return "New York";
  }

  return location;
}

async function getWeather(location) {
  try {
    const geoUrl =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(location) +
      "&count=1&language=en&format=json";

    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return `I couldn't find weather data for "${location}". Try using a city name like "New York", "Hampton Bays", or "London".`;
    }

    const place = geoData.results[0];

    const latitude = place.latitude;
    const longitude = place.longitude;
    const cityName = place.name;
    const country = place.country || "";
    const admin1 = place.admin1 || "";

    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast?" +
      `latitude=${latitude}&longitude=${longitude}` +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m" +
      "&temperature_unit=fahrenheit" +
      "&wind_speed_unit=mph" +
      "&precipitation_unit=inch";

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    if (!weatherData.current) {
      return `I found ${cityName}, but I couldn't load the current weather.`;
    }

    const current = weatherData.current;
    const condition = getWeatherDescription(current.weather_code);

    const locationLabel = admin1
      ? `${cityName}, ${admin1}, ${country}`
      : `${cityName}, ${country}`;

    return (
      `Current weather in ${locationLabel}: ` +
      `${Math.round(current.temperature_2m)}°F, ` +
      `feels like ${Math.round(current.apparent_temperature)}°F. ` +
      `Condition: ${condition}. ` +
      `Humidity: ${current.relative_humidity_2m}%. ` +
      `Wind: ${Math.round(current.wind_speed_10m)} mph. ` +
      `Precipitation: ${current.precipitation} in.`
    );
  } catch (error) {
    console.error("Weather tool error:", error);

    return "Sorry, I had trouble getting live weather data. Make sure your internet connection is working.";
  }
}

function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail"
  };

  return weatherCodes[code] || "Unknown conditions";
}

app.listen(PORT, function () {
  console.log(`TLEB backend running at http://localhost:${PORT}`);
});