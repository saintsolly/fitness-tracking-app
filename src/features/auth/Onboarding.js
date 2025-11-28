import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const steps = [
  {
    id: 'goals',
    title: 'Primary focus',
    description: 'What do you want to improve first?',
    options: ['Endurance', 'Strength', 'Mobility', 'Weight loss'],
  },
  {
    id: 'units',
    title: 'Measurement units',
    description: 'Choose the system that matches your gear.',
    options: ['imperial', 'metric'],
  },
  {
    id: 'wearable',
    title: 'Wearable integration',
    description: 'Connect a device to unlock live stats.',
    options: ['Not now', 'Connect later', 'Already connected'],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const step = steps[index];

  const handleSelect = (value) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
  };

  const handleContinue = async () => {
    if (index < steps.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      await completeOnboarding({
        preferredFocus: answers.goals,
        units: answers.units,
        wearableConnected: answers.wearable === 'Already connected',
      });
      navigate('/');
    }
  };

  return (
    <div className="auth-card">
      <h1>{step.title}</h1>
      <p>{step.description}</p>
      <div className="onboarding-options">
        {step.options.map((option) => (
          <button
            key={option}
            type="button"
            className={`btn ${answers[step.id] === option ? 'primary' : 'secondary'}`}
            onClick={() => handleSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="form-actions">
        <button
          type="button"
          className="btn primary"
          disabled={!answers[step.id]}
          onClick={handleContinue}
        >
          {index === steps.length - 1 ? 'Finish setup' : 'Continue'}
        </button>
      </div>
      <p className="auth-footnote">
        Step {index + 1} of {steps.length}
      </p>
    </div>
  );
}

