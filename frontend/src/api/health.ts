const API_BASE = "http://localhost:8080";

export async function getHealth() {
  const res = await fetch(`${API_BASE}/transactions`);
  return res.json();
}
