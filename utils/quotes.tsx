// utils/quotes.tsx
import  { useEffect, useState } from 'react';

const quotes = [
  {
    text: "We forget just how painfully dim the world was before electricity. A candle, a good candle, provides barely a hundredth of the illumination of a single 100-watt light bulb.",
    author: "Bill Bryson",
  },
  {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
  },
  {
    text: "Success is not the key to happiness. Happiness is the key to success.",
    author: "Albert Schweitzer",
  },
  {
    text: "Your time is limited, so don’t waste it living someone else’s life.",
    author: "Steve Jobs",
  },
];

export function Quotes() {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 8000); // Change quote every 8 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <blockquote className="space-y-2">
      <p className="text-md">&ldquo;{quotes[currentQuote].text}&rdquo;</p>
      <footer className="text-sm">{quotes[currentQuote].author}</footer>
    </blockquote>
  );
}
