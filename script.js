// Get DOM elements
const startRecognitionButton = document.getElementById('start-recognition');
const speakButton = document.getElementById('speak-button');
const transcriptDiv = document.getElementById('transcript');
const translatedDiv = document.getElementById('translated');
let translatedText = ''; // Store translated text for later speech

// Initialize Speech Recognition API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';

// Start speech recognition on button click
startRecognitionButton.addEventListener('click', () => {
    recognition.start();
    console.log('Speech recognition has started');
});

// Handle speech recognition results
recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    transcriptDiv.textContent = `Recognized: ${transcript}`;

    // Translate the recognized text
    const inputLang = 'en'; // Static as per your requirement
    const outputLang = document.getElementById('output-language').value;
    const translation = await translateText(transcript, inputLang, outputLang);
    translatedText = translation;
    translatedDiv.textContent = `Translated: ${translatedText}`;

    // Enable Speak button once translation is available
    speakButton.disabled = false;
};

// Handle recognition end event
recognition.onend = () => {
    console.log('Recognition ended');
};

// Function to handle the text-to-speech
function speakTranslation() {
    if (translatedText) {
        const speech = new SpeechSynthesisUtterance(translatedText);
        speech.lang = getLangForSpeech(document.getElementById('output-language').value);
        window.speechSynthesis.speak(speech);
    }
}

// Function to map language code to speech language
function getLangForSpeech(outputLang) {
    const langMap = {
        'fr': 'fr-FR',
        'es': 'es-ES',
        'hi': 'hi-IN'
    };
    return langMap[outputLang] || 'en-US'; // Default to English if no match
}

// Add event listener to the Speak button
speakButton.addEventListener('click', speakTranslation);

// Function to handle translation (same as previous)
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
