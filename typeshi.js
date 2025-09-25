// TypeShi - Keyboard Layout Learning App
class TypeShi {
    constructor() {
        this.currentMode = 'alphas';
        this.currentLength = 'short';
        this.currentAccuracyTarget = 70;
        
        this.masteredChars = [];  // Changed to array to maintain order
        this.availableChars = [];  // Currently available chars for sequences
        this.currentSequence = '';
        this.userInput = '';
        this.currentCharIndex = 0;
        this.attempts = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.minAttemptsRequired = 0;
        
        this.charSets = {
            alphas: 'abcdefghijklmnopqrstuvwxyz',
            alphanumeric: 'abcdefghijklmnopqrstuvwxyz0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
            all: 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        this.lengthMappings = {
            short: { min: 3, max: 5 },
            medium: { min: 5, max: 8 },
            long: { min: 8, max: 12 },
            extra: { min: 12, max: 15 }
        };
        
        // Character learning order (roughly by frequency and ease)
        this.learningOrder = {
            alphas: 'jfkdlsahgqwertyuiopzxcvbnm',
            alphanumeric: 'jfkdlsahgqwertyuiopzxcvbnm1234567890',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
            all: 'jfkdlsahgqwertyuiopzxcvbnm1234567890!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeAvailableChars();
        this.generateNewSequence();
        this.updateStats();
        this.focusTypingArea();
    }
    
    initializeAvailableChars() {
        // Start with just the first character from learning order
        const learningChars = this.learningOrder[this.currentMode];
        this.availableChars = [learningChars[0]]; // Start with just 'j'
        this.masteredChars = [];
    }
    
    setupEventListeners() {
        // Option buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleOptionClick(e));
        });
        
        // Control buttons
        document.getElementById('rstBtn').addEventListener('click', () => this.reset());
        document.getElementById('skipBtn').addEventListener('click', () => this.skip());
        
        // Keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Focus management
        document.addEventListener('click', () => this.focusTypingArea());
    }
    
    handleOptionClick(e) {
        const btn = e.target;
        const group = btn.dataset.group;
        const value = btn.dataset.value;
        
        // Handle "try-words" special case
        if (value === 'words') {
            alert('Word mode is not yet implemented. Please select another option.');
            return;
        }
        
        // Update active state
        document.querySelectorAll(`[data-group="${group}"]`).forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        
        // Update settings
        switch (group) {
            case 'mode':
                this.currentMode = value;
                this.initializeAvailableChars();
                break;
            case 'length':
                this.currentLength = value;
                break;
            case 'accuracy':
                this.currentAccuracyTarget = parseInt(value);
                document.getElementById('target').textContent = `${value}%`;
                break;
        }
        
        this.reset();
    }
    
    generateNewSequence() {
        if (this.availableChars.length === 0) {
            this.showCompletionMessage();
            return;
        }
        
        const sequenceLength = this.getSequenceLength();
        let sequence = '';
        
        // Generate sequence using only available characters
        for (let i = 0; i < sequenceLength; i++) {
            const randomChar = this.availableChars[Math.floor(Math.random() * this.availableChars.length)];
            sequence += randomChar;
            
            // Add space occasionally for readability (20% chance, only if not the last char)
            if (i < sequenceLength - 1 && Math.random() < 0.2) {
                sequence += ' ';
            }
        }
        
        this.currentSequence = sequence;
        this.calculateMinAttempts();
        this.renderSequence();
    }
    
    calculateMinAttempts() {
        // Minimum attempts = sequence length to prevent instant 100% on first try
        const config = this.lengthMappings[this.currentLength];
        this.minAttemptsRequired = config ? config.min : 3;
    }
    
    getSequenceLength() {
        const config = this.lengthMappings[this.currentLength];
        if (!config) return 5;
        
        // Adjust length based on number of available characters
        let maxLength = config.max;
        let minLength = config.min;
        
        // For early stages with few chars, keep sequences shorter
        if (this.availableChars.length <= 2) {
            maxLength = Math.min(maxLength, 6);
            minLength = Math.min(minLength, 3);
        }
        
        return Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    }
    
    renderSequence() {
        const display = document.getElementById('textDisplay');
        display.innerHTML = '';
        
        for (let i = 0; i < this.currentSequence.length; i++) {
            const char = this.currentSequence[i];
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add('char');
            
            if (i === this.currentCharIndex) {
                span.classList.add('current');
            } else if (i < this.userInput.length) {
                if (this.userInput[i] === char) {
                    span.classList.add('correct');
                } else {
                    span.classList.add('incorrect');
                }
            }
            
            display.appendChild(span);
        }
    }
    
    handleKeyPress(e) {
        // Ignore modifier keys and non-printable keys
        if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1 && e.key !== 'Backspace') {
            return;
        }
        
        e.preventDefault();
        
        if (e.key === 'Backspace') {
            this.handleBackspace();
        } else if (e.key.length === 1) {
            this.handleCharInput(e.key);
        }
    }
    
    handleCharInput(char) {
        if (this.currentCharIndex >= this.currentSequence.length) {
            return;
        }
        
        this.userInput += char;
        this.currentCharIndex++;
        this.totalChars++;
        
        if (char === this.currentSequence[this.currentCharIndex - 1]) {
            this.correctChars++;
        }
        
        this.renderSequence();
        
        if (this.currentCharIndex >= this.currentSequence.length) {
            this.handleSequenceComplete();
        }
        
        this.updateStats();
    }
    
    handleBackspace() {
        if (this.currentCharIndex > 0) {
            const removedChar = this.userInput[this.currentCharIndex - 1];
            const expectedChar = this.currentSequence[this.currentCharIndex - 1];
            
            this.userInput = this.userInput.slice(0, -1);
            this.currentCharIndex--;
            this.totalChars--;
            
            if (removedChar === expectedChar) {
                this.correctChars--;
            }
            
            this.renderSequence();
            this.updateStats();
        }
    }
    
    handleSequenceComplete() {
        this.attempts++;
        const accuracy = this.getAccuracy();
        
        // Check if we've met both accuracy and minimum attempts requirements
        if (accuracy >= this.currentAccuracyTarget && this.attempts >= this.minAttemptsRequired) {
            this.advanceToNextStage();
        }
        
        // Brief pause before generating new sequence
        setTimeout(() => {
            this.generateNewSequence();
            this.resetInput();
        }, 500);
    }
    
    advanceToNextStage() {
        // Add the next character from learning order if available
        const learningChars = this.learningOrder[this.currentMode];
        const currentStage = this.availableChars.length;
        
        if (currentStage < learningChars.length) {
            const nextChar = learningChars[currentStage];
            this.availableChars.push(nextChar);
            
            // Reset stats for the new stage
            this.attempts = 0;
            this.correctChars = 0;
            this.totalChars = 0;
            
            console.log(`Advanced to stage ${currentStage + 1}. Available chars:`, this.availableChars.join(''));
        }
    }
    
    resetInput() {
        this.userInput = '';
        this.currentCharIndex = 0;
    }
    
    reset() {
        this.attempts = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.initializeAvailableChars();
        this.resetInput();
        this.generateNewSequence();
        this.updateStats();
    }
    
    skip() {
        // Skip to next stage for debugging
        this.advanceToNextStage();
        this.generateNewSequence();
        this.resetInput();
        this.updateStats();
    }
    
    getAccuracy() {
        return this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 0;
    }
    
    updateStats() {
        document.getElementById('accuracy').textContent = `${this.getAccuracy()}%`;
        document.getElementById('attempts').textContent = this.attempts;
        
        const totalChars = this.learningOrder[this.currentMode].length;
        const currentStage = this.availableChars.length;
        document.getElementById('mastered').textContent = `${currentStage}/${totalChars}`;
    }
    
    showCompletionMessage() {
        const display = document.getElementById('textDisplay');
        display.innerHTML = '<span class="char correct">All characters mastered! Great job!</span>';
    }
    
    focusTypingArea() {
        // Visual focus indicator - the typing area is always "focused"
        document.querySelector('.typing-area').style.outline = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypeShi();
});
