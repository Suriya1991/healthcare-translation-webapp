document.getElementById('start-recognition').addEventListener('click', () => {
    console.log("Recognition started");

    // Check if SpeechRecognition is supported in the browser
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        alert('Speech Recognition API is not supported in this browser.');
        return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        console.log("Speech recognition has started");
    };

    recognition.onresult = async (event) => {
        console.log("Recognition result received");
        if (event.results && event.results.length > 0 && event.results[0].length > 0) {
            const transcript = event.results[0][0].transcript;
            console.log(`Transcription: ${transcript}`);
            document.getElementById('transcript').innerText = `Original: ${transcript}`;

            // Get the selected output language
            const outputLang = document.getElementById('output-language').value;
            console.log(`Selected Output Language: ${outputLang}`);

            // Translate using Hugging Face API
            try {
                const translatedText = await translateText(transcript, 'en', outputLang);  // Translate from English to selected language
                console.log(`Translated: ${translatedText}`);
                document.getElementById('translated').innerText = `Translated: ${translatedText}`;

                // Speak the translated text
                const utterance = new SpeechSynthesisUtterance(translatedText);
                utterance.lang = outputLang;
                window.speechSynthesis.speak(utterance);
            } catch (error) {
                console.error("Translation error:", error);
                document.getElementById('translated').innerText = "Error in translation.";
            }
        } else {
            console.error('No transcription result available');
            document.getElementById('transcript').innerText = 'Error: No transcription result available.';
        }
    };

    recognition.onerror = (event) => {
        console.error(`Recognition error: ${event.error}`);
        document.getElementById('transcript').innerText = `Error: ${event.error}`;
    };

    recognition.onend = () => {
        console.log("Recognition ended");
    };

    recognition.start();
});

async function translateText(text, inputLang, targetLang) {
    const apiKey = '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';
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
