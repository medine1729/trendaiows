const apiKey = "AIzaSyAFy7HVhVuoSTCBQ8cf4lO-H1fCiu94ldg";

async function test() {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
             system_instruction: {
                parts: {
                  text: `You are an AI e-commerce assistant.
                  Extract intention from the user's message.
                  Return ONLY a valid JSON object matching this schema:
                  {
                      "intentType": "greeting" | "product_search" | "payment_intent" | "unknown",
                      "category": "string (the product category, like 'shoes', 'dress', 'laptop')",
                      "budgetLimit": "number (extract maximum budget if specified, e.g. 'under 150' -> 150. Null otherwise)"
                  }`
                }
             },
             contents: [
               {
                 role: "user",
                 parts: [
                   { text: "find me a dress under 50" }
                 ]
               }
             ],
             generationConfig: {
                 responseMimeType: "application/json"
             }
        })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}
test();
