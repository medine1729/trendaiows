const apiKey = "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";

async function test() {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "meta-llama/llama-3-8b-instruct:free",
            response_format: { type: "json_object" },
            messages: [
            {
                role: "system",
                content: `You are an AI e-commerce assistant.
                Extract intention from the user's message.
                Return ONLY a valid JSON object matching this schema:
                {
                    "intentType": "greeting" | "product_search" | "payment_intent" | "unknown",
                    "category": "string (the product category, like 'shoes', 'dress', 'laptop')",
                    "budgetLimit": "number (extract maximum budget if specified, e.g. 'under 150' -> 150. Null otherwise)"
                }`
            },
            {
                role: "user",
                content: "find me a dress under 50"
            }
            ]
        })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}
test();
