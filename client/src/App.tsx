import { useState } from 'react';

function App() {
  const [message, setMessage] = useState<string>('Welcome to ResQ AI');

  return (
    <div className="App">
      <header className="App-header">
        <h1>ResQ AI</h1>
        <p>{message}</p>
      </header>
    </div>
  );
}

export default App; 