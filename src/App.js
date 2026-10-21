import './App.css';
// import { BrokenModalApp } from './projects/01-The Laggy Modal/BrokenModalApp';
import { BrokenModalAppFix } from './projects/01-The Laggy Modal/BrokenModalAppFix';
import { BrokenForm } from './projects/02-Keystroke Freeze/BrokenForm';
import { TabsDemo } from './projects/03-The Flexible Compound Tab/TabsDemo';
import { HeavyStatusRenderer } from './projects/04- Heavy Sync';
import { BrokenOrderBook } from './projects/05-Crypto';

function App() {
  return (
    <div className="App">
      {/* project 1 */}
      {/* <BrokenModalApp /> */}
      {/* <BrokenModalAppFix /> */}
      {/* <HeavyStatusRenderer /> */}
      <BrokenOrderBook />

      {/* project 2 */}
      {/* <BrokenForm /> */}
      {/* <TabsDemo /> */}
    </div>
  );
}

export default App;
