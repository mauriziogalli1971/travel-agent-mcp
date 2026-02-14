import { Start } from './components/Start';
import Settings from './components/Settings';
import { useState } from 'react';

function App() {
  const [intro, setIntro] = useState<boolean>(true);

  return <div className='container'>{intro ? <Start setIntro={setIntro} /> : <Settings />}</div>;
}

export default App;
