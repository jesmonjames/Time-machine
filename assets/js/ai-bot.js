/**
 * TACTICAL AI STRATEGIST (JES-007)
 * Core Logic for the Portfolio's Persistent AI Assistant.
 * 
 * FEATURES:
 * - State Persistence: Remembers chat history and panel state across page loads.
 * - Keyword Engine: Sophisticated keyword matching with abbreviation expansion (u -> you, etc).
 * - Web Speech API: Voice recognition (Wake-word "007") and Text-to-Speech synthesis.
 * - Modular Design: Injects its own HTML/CSS and manages its own lifecycle.
 */

class TacticalBot {
    constructor() {
        // DOM Elements (Initialized in injectHTML)
        this.container = null;
        this.panel = null;
        this.messagesContainer = null;
        this.input = null;
        
        // --- STATE PERSISTENCE LAYER ---
        // Using versioned keys to avoid conflicts with older deployments or other apps on the same domain.
        this.STORAGE_KEYS = {
            HISTORY: 'jes007_tactical_v2_history',
            STATE: 'jes007_tactical_v2_isOpen'
        };

        this.isOpen = localStorage.getItem(this.STORAGE_KEYS.STATE) === 'true';
        this.chatHistory = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.HISTORY)) || [];
        this.isVoiceActive = false;
        
        // --- SPEECH RECOGNITION SETUP ---
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.wakeWord = "jesmon come online";
        
        // Database of responses (Fetched from external JSON)
        this.responses = null;

        this.init();
        this.listenForRemoteSync();
    }

    /**
     * Entry point: Injects UI, binds events, and synchronizes data.
     */
    init() {
        console.log("JES-007: Initializing Tactical Layer...");
        this.injectHTML();
        this.bindEvents();
        
        // --- DEFAULT FAILSAFE RESPONSES ---
        this.responses = {
            "core": {
                "initial": "UPLINK ESTABLISHED. Tactical AI Strategist JES-007 online. Intelligence protocols synchronized. What is your objective?",
                "online": "JES IS ONLINE. Strategic voice protocols active. What is your command?",
                "fallback": "COMMAND NOT RECOGNIZED. Suggesting core sectors for tactical advantage.",
                "help": "Available sectors: [RESEARCH_LIBRARY], [FIELD_JOURNAL], [CONTACT_ARRAY], [CORE_DASHBOARD]. You can also ask me about my skills, art, or mission."
            },
            "navigation": {
                "library": "REDIRECTING TO RESEARCH LIBRARY...",
                "journal": "ACCESSING FIELD JOURNAL...",
                "contact": "INITIALIZING COMMUNICATION PROTOCOL...",
                "dashboard": "RETURNING TO CORE DASHBOARD...",
                "home": "RETURNING TO CORE DASHBOARD...",
                "about": "ACCESSING DOSSIER..."
            },
            "personality": {
                "greetings": ["Hello. This is Jesmon's digital proxy. How can I assist?", "Uplink confirmed. What's on your mind?"],
                "who": "I'm Jesmon K J — an Engineer by day, an artist by night, and a lifelong teacher.",
                "location": "Current station: Kochi, Kerala, India.",
                "status": "Systems are optimal. I'm currently focused on my independent journey.",
                "mission": "My mission is the 'Autonomous Evolution'.",
                "art": "I work across various mediums: pencil sketching, oil pastels, and digital interfaces.",
                "skills": "Expertise in React, Vue, Drupal, and vanilla JavaScript.",
                "feeling": "Operating at peak efficiency. Resonance at 99.1%.",
                "thanks": "Acknowledged. Duty is its own reward. Standby."
            },
            "keywords": {
                "hello": "personality.greetings", "hi": "personality.greetings", "hey": "personality.greetings",
                "who": "personality.who", "you": "personality.who",
                "where": "personality.location", "kochi": "personality.location",
                "doing": "personality.status", "mission": "personality.mission",
                "art": "personality.art", "sketch": "personality.art",
                "skill": "personality.skills", "code": "personality.skills",
                "how are you": "personality.feeling", "thanks": "personality.thanks",
                "library": "navigation.library", "journal": "navigation.journal",
                "contact": "navigation.contact", "about": "navigation.about",
                "home": "navigation.dashboard", "help": "core.help"
            }
        };

        this.loadResponses(); 
        this.restoreChat();
        
        if (this.isOpen) {
            this.panel.classList.add('active');
            this.input.focus();
        }
    }

    /**
     * Cross-Tab Synchronization: Ensures all open tabs share the same chat state in real-time.
     */
    listenForRemoteSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEYS.HISTORY) {
                this.chatHistory = JSON.parse(e.newValue) || [];
                this.messagesContainer.innerHTML = '';
                this.restoreChat();
            }
            if (e.key === this.STORAGE_KEYS.STATE) {
                this.isOpen = e.newValue === 'true';
                this.panel.classList.toggle('active', this.isOpen);
            }
        });
    }

    saveState() {
        localStorage.setItem(this.STORAGE_KEYS.STATE, this.isOpen);
        localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(this.chatHistory));
    }

    restoreChat() {
        if (this.chatHistory.length === 0) {
            this.addBotMessage(this.responses.core.initial, true, false);
        } else {
            this.chatHistory.forEach(msg => {
                if (msg.type === 'user') {
                    this.addUserMessage(msg.text, false);
                } else {
                    this.addBotMessage(msg.text, msg.showSuggestions, false);
                }
            });
        }
    }

    async loadResponses() {
        try {
            const isSubPage = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
            const path = isSubPage ? '../assets/data/ai-responses.json' : 'assets/data/ai-responses.json';
            const response = await fetch(path);
            if (response.ok) {
                const remoteData = await response.json();
                this.responses = { ...this.responses, ...remoteData };
            }
        } catch (error) {
            console.log("JES-007: Operating on local backup protocols.");
        }
    }

    initSpeechRecognition() {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!window.SpeechRecognition) return;

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            if (transcript.includes(this.wakeWord)) {
                if (!this.isOpen) this.togglePanel();
                this.addBotMessage(this.responses.core.online, true);
                this.speak(this.responses.core.online);
                this.isVoiceActive = true;
                this.updateVoiceUI(true);
            } else if (this.isVoiceActive || this.isOpen) {
                this.handleVoiceInput(transcript);
            }
        };

        this.recognition.onend = () => {
            if (this.recognition) this.recognition.start();
        };

        try { this.recognition.start(); } catch (e) {}
    }

    injectHTML() {
        const botHTML = `
            <div class="ai-bot-container">
                <div class="ai-bot-panel" id="aiBotPanel">
                    <div class="ai-bot-header">
                        <div class="ai-bot-title">
                            <div class="ai-bot-status-dot"></div>
                            JES-007 // STRATEGIST
                        </div>
                        <div class="ai-bot-voice-indicator" id="voiceIndicator" title="VOICE STATUS">
                            <div class="wave"></div>
                            <div class="wave"></div>
                            <div class="wave"></div>
                        </div>
                        <div class="ai-bot-close" id="aiBotClose">[ X ]</div>
                    </div>
                    <div class="ai-bot-messages" id="aiBotMessages"></div>
                    <div class="ai-bot-input-area">
                        <input type="text" class="ai-bot-input" id="aiBotInput" placeholder="ENTER COMMAND..." autocomplete="off">
                        <button class="ai-bot-voice-btn" id="aiBotVoiceToggle" title="TOGGLE VOICE COMMS">
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        </button>
                        <button class="ai-bot-send" id="aiBotSend">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
                <div class="ai-bot-trigger" id="aiBotTrigger" title="TACTICAL AI ASSISTANT">
                    <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><circle cx="12" cy="10" r="2"></circle><line x1="12" y1="12" x2="12" y2="12.01"></line></svg>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', botHTML);
        this.container = document.querySelector('.ai-bot-container');
        this.panel = document.getElementById('aiBotPanel');
        this.messagesContainer = document.getElementById('aiBotMessages');
        this.input = document.getElementById('aiBotInput');
        this.voiceIndicator = document.getElementById('voiceIndicator');
    }

    bindEvents() {
        const initVoiceOnFirstClick = () => {
            if (!this.recognition && window.SpeechRecognition) {
                this.initSpeechRecognition();
                this.isVoiceActive = true;
                this.updateVoiceUI(true);
            }
            document.removeEventListener('click', initVoiceOnFirstClick);
        };
        document.addEventListener('click', initVoiceOnFirstClick);

        document.getElementById('aiBotTrigger').addEventListener('click', () => {
            this.togglePanel();
        });
        document.getElementById('aiBotClose').addEventListener('click', () => this.togglePanel());
        document.getElementById('aiBotSend').addEventListener('click', () => this.handleUserInput());
        document.getElementById('aiBotVoiceToggle').addEventListener('click', () => {
            this.isVoiceActive = !this.isVoiceActive;
            this.updateVoiceUI(this.isVoiceActive);
            if (this.isVoiceActive) this.speak("Voice comms activated.");
        });
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
        this.messagesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-tag')) {
                const cmd = e.target.getAttribute('data-cmd');
                this.input.value = cmd;
                this.handleUserInput();
            }
        });
    }

    togglePanel() {
        this.isOpen = !this.isOpen;
        this.panel.classList.toggle('active', this.isOpen);
        if (this.isOpen) this.input.focus();
        this.saveState();
    }

    handleUserInput() {
        const text = this.input.value.trim();
        if (!text) return;
        this.addUserMessage(text);
        this.input.value = '';
        setTimeout(() => this.processCommand(text.toLowerCase()), 500);
    }

    handleVoiceInput(transcript) {
        this.addUserMessage(transcript);
        setTimeout(() => this.processCommand(transcript), 500);
    }

    processCommand(cmd) {
        if (!this.responses) return;
        let normalizedCmd = cmd.toLowerCase().replace(/\bu\b/g, "you").replace(/\br\b/g, "are").replace(/\bhows\b/g, "how is").replace(/\bwhats\b/g, "what is").trim();
        let responseText = this.responses.core.fallback;
        let action = null;
        let matchedKey = null;

        const openMatch = normalizedCmd.match(/(?:open|access|show|view|take me to|go to)\s+(.+)/);
        const searchMatch = normalizedCmd.match(/(?:search|find|lookup)\s+(.+)/);

        // --- TACTICAL KINETIC SCROLLING ---
        const scrollTarget = document.querySelector('.main-layout') || window;
        const currentScroll = scrollTarget === window ? window.scrollY : scrollTarget.scrollTop;
        const maxScroll = scrollTarget === window ? document.documentElement.scrollHeight - window.innerHeight : scrollTarget.scrollHeight - scrollTarget.clientHeight;
        const atTop = currentScroll <= 5;
        const atBottom = currentScroll >= maxScroll - 5;

        if (normalizedCmd.includes('scroll fully to bottom') || normalizedCmd.includes('scroll to end')) {
            if (atBottom) responseText = "Scroll limit reached. Already at sector baseline.";
            else {
                const distance = (scrollTarget.scrollHeight || document.documentElement.scrollHeight);
                action = () => this.tacticalScroll(distance, 60);
                responseText = "Executing high-velocity descent to sector baseline.";
            }
        } else if (normalizedCmd.includes('scroll fully to top') || normalizedCmd.includes('scroll to top')) {
            if (atTop) responseText = "Scroll limit reached. Already at sector apex.";
            else {
                const distance = -(scrollTarget.scrollTop || window.scrollY || 2000);
                action = () => this.tacticalScroll(distance, 60);
                responseText = "Executing high-velocity ascent to sector apex.";
            }
        } else if (normalizedCmd.includes('scroll down') || normalizedCmd.includes('go down')) {
            if (atBottom) responseText = "Scroll limit reached. No further descent possible.";
            else {
                action = () => this.tacticalScroll(300);
                responseText = "Descending to lower tactical sector.";
            }
        } else if (normalizedCmd.includes('scroll up') || normalizedCmd.includes('go up')) {
            if (atTop) responseText = "Scroll limit reached. Already at maximum elevation.";
            else {
                action = () => this.tacticalScroll(-300);
                responseText = "Ascending to upper tactical sector.";
            }
        } else if (normalizedCmd.includes('take me there') || normalizedCmd.includes('go there')) {
            responseText = "Navigating to the requested tactical sector.";
            if (normalizedCmd.includes('library')) action = () => this.navigate('pages/library.html');
            else if (normalizedCmd.includes('journal')) action = () => this.navigate('pages/journal.html');
            else if (normalizedCmd.includes('contact')) action = () => this.navigate('pages/contact.html');
            else if (normalizedCmd.includes('about') || normalizedCmd.includes('dossier')) action = () => this.navigate('pages/about.html');
            else if (normalizedCmd.includes('home') || normalizedCmd.includes('dashboard')) action = () => this.navigate('index.html');
            else responseText = "Requesting clarification on 'THERE'. Which sector shall we access? [LIBRARY], [JOURNAL], or [DASHBOARD]?";
        } else if (normalizedCmd.includes('reload') || normalizedCmd.includes('restart timemachine') || normalizedCmd.includes('reboot')) {
            sessionStorage.removeItem('sysBooted');
            responseText = "Initiating full system reboot. Re-initializing cold boot sequence...";
            action = () => this.navigate('index.html');
        } else if (openMatch || searchMatch) {
            const isSearch = !!searchMatch && !normalizedCmd.includes('open');
            const query = (isSearch ? searchMatch[1] : openMatch[1]).trim().toLowerCase();
            
            // --- SECTOR REDIRECT OVERRIDE ---
            // If the query is a major sector, we prioritize navigation over in-page commands.
            const sectorMap = {
                'library': 'pages/library.html',
                'journal': 'pages/journal.html',
                'contact': 'pages/contact.html',
                'about': 'pages/about.html',
                'dossier': 'pages/about.html',
                'notebook': 'pages/about.html',
                'personal notebook': 'pages/about.html',
                'dashboard': 'index.html',
                'home': 'index.html'
            };

            if (!isSearch && sectorMap[query]) {
                responseText = `Navigating to ${query.toUpperCase()} sector. Initiating transition...`;
                action = () => this.navigate(sectorMap[query]);
            } else {
                const event = new CustomEvent('tacticalPageCommand', { 
                    detail: { type: isSearch ? 'search' : 'open', query: query } 
                });
                window.dispatchEvent(event);
                responseText = `Initiating tactical ${isSearch ? 'search' : 'access'} for: ${query.toUpperCase()}. Scanning current sector...`;
            }
        } else if (normalizedCmd.includes('switch to') || normalizedCmd.includes('change theme to') || normalizedCmd.includes('set theme to')) {
            const themes = ['crown', 'third eye', 'throat', 'heart', 'solar', 'sacral', 'root'];
            let foundTheme = null;
            for (const t of themes) {
                if (normalizedCmd.includes(t)) {
                    foundTheme = t.replace(' ', '-');
                    break;
                }
            }

            if (foundTheme) {
                const themeClass = `theme-${foundTheme}`;
                if (window.applyTheme) {
                    window.applyTheme(themeClass);
                    responseText = `Visual protocols synchronized to ${foundTheme.toUpperCase()} spectrum.`;
                } else {
                    responseText = "Theme engine link currently unavailable.";
                }
            } else {
                responseText = "Theme signature not recognized. Please specify: [CROWN, THIRD EYE, THROAT, HEART, SOLAR, SACRAL, ROOT].";
            }
        } else {
            const sortedKeywords = Object.keys(this.responses.keywords).sort((a, b) => b.length - a.length);
            for (const key of sortedKeywords) {
                if (normalizedCmd.includes(key)) {
                    matchedKey = this.responses.keywords[key];
                    break;
                }
            }

            if (matchedKey) {
                const parts = matchedKey.split('.');
                let target = this.responses;
                for (const p of parts) { target = target[p]; }
                responseText = Array.isArray(target) ? target[Math.floor(Math.random() * target.length)] : target;

                if (matchedKey.startsWith('navigation.')) {
                    const navKey = matchedKey.split('.')[1];
                    if (navKey === 'library') action = () => this.navigate('pages/library.html');
                    else if (navKey === 'journal') action = () => this.navigate('pages/journal.html');
                    else if (navKey === 'contact') action = () => this.navigate('pages/contact.html');
                    else if (navKey === 'about') action = () => this.navigate('pages/about.html');
                    else if (navKey === 'dashboard') action = () => this.navigate('index.html');
                }
            }
        }

        const fillers = ["Analyzing query...", "Let me check...", "Scanning archives...", "One moment..."];
        const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];

        this.addBotMessage(randomFiller, false, false);
        setTimeout(() => {
            const messages = this.messagesContainer.querySelectorAll('.message.bot');
            const lastFiller = messages[messages.length - 1];
            if (lastFiller && lastFiller.textContent.includes('...')) lastFiller.remove();
            this.addBotMessage(responseText, matchedKey === 'core.help');
            this.speak(responseText);
            if (action) setTimeout(action, 2000);
        }, 1000);
    }

    speak(text) {
        if (!this.synth) return;
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 0.8;
        this.synth.speak(utterance);
    }

    updateVoiceUI(active) {
        const toggleBtn = document.getElementById('aiBotVoiceToggle');
        if (this.voiceIndicator) this.voiceIndicator.classList.toggle('active', active);
        if (toggleBtn) toggleBtn.classList.toggle('active', active);
    }

    navigate(url) {
        const isSubPage = window.location.pathname.includes('/pages/');
        let finalUrl = url;
        if (isSubPage) {
            if (url === 'index.html') finalUrl = '../index.html';
            else if (url.startsWith('pages/')) finalUrl = url.split('/').pop();
        }
        window.location.href = finalUrl;
    }

    addUserMessage(text, save = true) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user';
        msgDiv.innerHTML = `<div class="message-label">RECRUIT</div><div class="message-content">${text}</div>`;
        this.messagesContainer.appendChild(msgDiv);
        if (save) {
            this.chatHistory.push({ type: 'user', text });
            this.saveState();
        }
        this.scrollToBottom();
    }

    addBotMessage(text, showSuggestions = false, save = true) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.innerHTML = `<div class="message-label">JES-007 // STRATEGIST</div><div class="message-content"></div>`;
        this.messagesContainer.appendChild(msgDiv);
        const contentDiv = msgDiv.querySelector('.message-content');
        if (!save) {
            contentDiv.textContent = text;
            if (showSuggestions) this.addSuggestions(msgDiv);
            this.scrollToBottom();
        } else {
            this.typeEffect(contentDiv, text, () => {
                if (showSuggestions) this.addSuggestions(msgDiv);
                this.scrollToBottom();
            });
            this.chatHistory.push({ type: 'bot', text, showSuggestions });
            this.saveState();
        }
        return msgDiv;
    }

    addSuggestions(parent) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'ai-bot-suggestions';
        const options = [{ label: 'LIBRARY', cmd: 'Go to library' }, { label: 'JOURNAL', cmd: 'Show journal' }, { label: 'CONTACT', cmd: 'Contact Jesmon' }, { label: 'HELP', cmd: 'help' }];
        options.forEach(opt => {
            const span = document.createElement('span');
            span.className = 'suggestion-tag';
            span.textContent = `[ ${opt.label} ]`;
            span.setAttribute('data-cmd', opt.cmd);
            suggestionsDiv.appendChild(span);
        });
        parent.appendChild(suggestionsDiv);
    }

    typeEffect(element, text, callback) {
        let i = 0;
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                let char = text.charAt(i);
                i++;
                let delay = 20; 
                if (char === '.' || char === '?' || char === '!') delay = 400;
                else if (char === ',') delay = 200;
                else delay = 10 + Math.random() * 30;
                setTimeout(type, delay);
                this.scrollToBottom();
            } else if (callback) callback();
        };
        type();
    }

    /**
     * Kinetic Drift: Performs a controlled incremental scroll.
     * @param {number} amount - Total pixels to scroll.
     * @param {number} speed - Pixels per step (higher = faster).
     */
    tacticalScroll(amount, speed = 10) {
        const scrollTarget = document.querySelector('.main-layout') || window;
        const interval = 15; // Ms between steps
        const stepAmount = amount > 0 ? speed : -speed;
        const totalSteps = Math.abs(amount / speed);
        
        let currentStep = 0;
        const scrollInt = setInterval(() => {
            if (scrollTarget === window) {
                window.scrollBy(0, stepAmount);
            } else {
                scrollTarget.scrollTop += stepAmount;
            }
            currentStep++;
            if (currentStep >= totalSteps) clearInterval(scrollInt);
        }, interval);
    }

    scrollToBottom() {
        if (this.messagesContainer) this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.tacticalBot = new TacticalBot();
});
