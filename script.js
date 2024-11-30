// Initialize the speech recognition API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
recognition.lang = "en-US"; // Default to English for input
recognition.interimResults = false;

// Start speech recognition when the button is clicked
document.getElementById("start-recognition").addEventListener("click", function() {
    recognition.start();
    console.log("Recognition started");
});

// When speech is detected, process the results
recognition.onresult = async function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("transcript").innerText = "You said: " + transcript;
    
    // Translate the text
    const inputLang = "en"; // Hardcoded as English for simplicity
    const outputLang = document.getElementById("output-language").value;
    
    try {
        const translatedText = await translateText(transcript, inputLang, outputLang);
        document.getElementById("translated").innerText = translatedText;
    } catch (error) {
        document.getElementById("translated").innerText = "Error in translation.";
    }
};

// Handle the end of the speech recognition
recognition.onend = function() {
    console.log("Recognition ended");
};

// Function to handle text translation using Hugging Face API
async function translateText(text, inputLang, targetLang) {
    const apiKey = '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'; // Hugging Face API Key
    const modelUrl = `https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-${inputLang}-${targetLang}`;
    
    const requestOptions = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
    };

    try {
        const response = await fetch(modelUrl, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data[0]?.translation_text || "Translation unavailable";
    } catch (error) {
        console.error("Translation error:", error);
        return "Error in translation.";
    }
}

// Speak the translated text when the "Speak Translation" button is clicked
document.getElementById("speak-translation").addEventListener("click", function() {
    const translatedText = document.getElementById("translated").innerText;

    if (translatedText) {
        const utterance = new SpeechSynthesisUtterance(translatedText);
        window.speechSynthesis.speak(utterance);
    } else {
        alert("No translated text available.");
    }
});
