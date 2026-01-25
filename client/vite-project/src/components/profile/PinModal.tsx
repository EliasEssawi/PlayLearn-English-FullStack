import React, { useRef } from "react";
// Props definition for the PIN modal
type PinModalProps = {
  profileName: string;
  pinInputs: string[];
  pinError: boolean;
  isDarkMode: boolean;
  onChange: (value: string, idx: number) => void;
  onBackspace: (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onClose: () => void;
};
// Modal component for entering a profile PIN

const PinModal: React.FC<PinModalProps> = ({ 
  profileName, pinInputs, pinError, isDarkMode, onChange, onBackspace, onSubmit, onClose 
}) => {
  // Store references to PIN input elements for focus control
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;     // Allow only a single digit or empty value


    onChange(val, idx);

    // Automatically move focus to the next input when a digit is entered
    if (val && idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      // Automatically move focus backward if current input is empty
      if (!pinInputs[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
      onBackspace(idx, e);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{
          backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#1e293b",
          padding: '2.5rem', borderRadius: '20px', border: '2px solid #86e07f', 
          textAlign: 'center', minWidth: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ color: '#86e07f', marginBottom: '1.5rem', fontSize: '1.5rem' }}>{profileName}'s PIN</h2>
        
        {pinError && <p style={{ color: '#f87171', marginBottom: '1rem' }}>Wrong PIN, try again</p>}
        
        {}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center', 
          alignItems: 'center',
          margin: '25px 0' 
        }}>
          {pinInputs.map((val, i) => (
            <input 
  key={i}
  ref={(el) => { inputRefs.current[i] = el; }}
  type="password"          
  value={val}
  maxLength={1}
  inputMode="numeric"
  autoFocus={i === 0}
  onChange={e => handleChange(e.target.value, i)}
  onKeyDown={e => handleKeyDown(i, e)}
  style={{ 
    width: '50px', 
    height: '65px', 
    textAlign: 'center', 
    fontSize: '2rem', 
    background: 'transparent', 
    color: 'inherit', 
    border: '2px solid #86e07f', 
    borderRadius: '12px', 
    outline: 'none'
  }}
/>

          ))}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={onSubmit} style={{ 
            background: '#86e07f', color: 'white', padding: '14px', 
            border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' 
          }}>
            Continue
          </button>
          <button onClick={onClose} style={{ 
            background: 'transparent', border: 'none', color: 'inherit', 
            cursor: 'pointer', fontSize: '1rem', opacity: 0.8 
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinModal;