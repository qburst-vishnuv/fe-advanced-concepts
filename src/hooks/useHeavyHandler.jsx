export async function heavyHandler() {
    if ('scheduler' in window && 'yield' in window.scheduler) {
        await window.scheduler.yield();
    }
    return new Promise((resolve) => {
        const channel = new MessageChannel();

        channel.port1.onmessage = function () {
            resolve();
        }

        channel.port2.postMessage(null);
    })
}

