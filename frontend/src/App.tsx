import { useEffect, useState } from "react";
import { getHealth } from "./health";

function App() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    getHealth().then((data) => setStatus(data.status));
  }, []);

  return <h1>backend health: {status}</h1>;
}

export default App;
