// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
            console.log('ServiceWorker registration successful with scope:', registration.scope);
        } catch (err) {
            console.log('ServiceWorker registration failed:', err);
        }
    });
}

// Add to home screen prompt
let deferredPrompt;
const addBtn = document.createElement('button');
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the add button
    addBtn.style.display = 'block';
}); 
