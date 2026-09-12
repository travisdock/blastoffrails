document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("subscribe-form");
    if (!form) return;

    document.getElementById("ts").value = Date.now();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = form.email.value;
        const website = form.website.value;
        const ts = form.ts.value;
        const message = document.getElementById("subscribe-message");
        const button = form.querySelector("button");

        button.disabled = true;
        message.textContent = "";
        message.className = "";

        try {
            const res = await fetch("https://mailerlite-api.travisdock.workers.dev/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, ts, website }),
            });

            const data = await res.json();
            message.textContent = res.ok ? "✅ Thanks for subscribing!" : "❌ Error: " + data.error;
            message.className = res.ok ? "success" : "error";
            if (res.ok) form.reset();
        } catch (err) {
            message.textContent = "❌ Something went wrong. Please try again.";
            message.className = "error";
        } finally {
            button.disabled = false;
        }
    });
});
