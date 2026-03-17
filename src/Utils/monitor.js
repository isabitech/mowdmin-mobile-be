export function logMemoryUsage() {
  const used = process.memoryUsage();

  for (const key of Object.keys(used)) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024)} MB`);
  }
}

export function startMemoryUsageMonitor() {
  logMemoryUsage();
  return setInterval(logMemoryUsage, 5000);
}
