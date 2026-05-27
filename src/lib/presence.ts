export function formatLastOnline(lastDisconnected: number) {
  const diff = Date.now() - lastDisconnected;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) {
    const minutes = Math.floor(diff / 60_000);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }
  if (diff < 86_400_000) {
    const hours = Math.floor(diff / 3_600_000);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }
  if (diff < 604_800_000) {
    const days = Math.floor(diff / 86_400_000);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
  return "Over a week ago";
}
