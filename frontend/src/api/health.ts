export async function getHealth() {
  const res = await fetch(`/health`);
  return res.json();
}
