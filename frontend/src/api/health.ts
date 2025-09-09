export async function getHealth() {
  const res = await fetch("http://localhost:8080/health");
  return res.json();
}
