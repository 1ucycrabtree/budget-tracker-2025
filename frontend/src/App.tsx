import { Transactions } from "./pages/Transaction";

function App() {
  const userId = "lucy-test";

  return (
    <div>
      <h1 className="justify-self-center font-extrabold text-2xl px-4 py-2 uppercase">
        Budget Tracker
        </h1>
      <Transactions userId={userId} />
    </div>
  );
}

export default App;

