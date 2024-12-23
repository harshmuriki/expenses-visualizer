import React, { useState } from 'react';

interface InputModalProps {
  initialParentName: string;
  onSubmit: (newParentName: string, anotherVariable: string) => void;
  onClose: () => void;
}

const InputModal: React.FC<InputModalProps> = ({ initialParentName, onSubmit, onClose }) => {
  const [newParentName, setNewParentName] = useState(initialParentName);
  const [newCost, setNewCost] = useState('');

  const handleSubmit = () => {
    onSubmit(newParentName, newCost);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
      <h3>Update Node Information</h3>
      <div>
        <label>
          New Parent Name:
          <input
            type="text"
            value={newParentName}
            onChange={(e) => setNewParentName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Change Cost:
          <input
            type="text"
            value={newCost}
            onChange={(e) => setNewCost(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default InputModal;