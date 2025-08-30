// Set timestamp on page load
document.addEventListener('DOMContentLoaded', function() {
    const tsField = document.getElementById("ts");
    if (tsField) {
        tsField.value = Date.now();
    }

    const subscribeForm = document.getElementById("subscribe-form");
    if (subscribeForm) {
        subscribeForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const form = e.target;
            const email = form.email.value;
            const website = form.website.value;
            const ts = form.ts.value;

            const res = await fetch("https://mailerlite-api.travisdock.workers.dev/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, ts, website }),
            });

            const data = await res.json();
            const message = document.getElementById("subscribe-message");
            message.textContent = res.ok ? "✅ Thanks for subscribing!" : "❌ Error: " + data.error;
        });
    }
});