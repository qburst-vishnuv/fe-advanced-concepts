export function yieldToMainThread() {
    return new Promise((resolve) => {
        const channel = new MessageChannel();

        channel.port1.onmessage = () => {
        console.log("IN")

            resolve();
        }

        channel.port2.postMessage(null);

    })
}

export async function processMassiveArray(items) {
  let lastYieldTime = performance.now();

  for (let i = 0; i < items.length; i++) {
    // Perform item work
    heavyTask(items[i]);

    // Check if we've spent more than 5ms in the current frame
    if (performance.now() - lastYieldTime > 5) {
      // Yield to main thread! Lets browser process clicks/paints, then returns instantly
      await yieldToMainThread();
      lastYieldTime = performance.now(); // Reset frame clock
    }
  }
}

function heavyTask() {
     const now = performance.now();
    while (performance.now() - now < 300) {}
    return ;
}

