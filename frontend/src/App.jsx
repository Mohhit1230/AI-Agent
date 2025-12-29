import { useState } from "react";

import Preloader from "./components/Preloader";
import { Routes, Route } from "react-router-dom";


import About from "./components/About";
import Home from "./components/Home/Home";


function App() {

  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <>
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
      <Routes>
        <Route path="/" element={
          <Home showPreloader={showPreloader} />
        } />
        <Route path="/about" element={<About />} />
      </Routes>


    </>
  );
}

export default App;
