import React, { useState, useEffect } from 'react';

const Terminal = ({ setShowButton }) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [output, setOutput] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    const processCommand = async () => {
        const trimmedInput = input.trim();
        const args = trimmedInput.split(' ');
        const command = args.shift().toLowerCase();

        let result = '';

        const commands = {
            help: () => {
                const helpText = `Available commands:
                    - help : Lists available commands
                    - about : Displays information about the terminal
                    - clear : Clears the screen
                    - date : Displays the current date
                    - echo [text] : Repeats the entered text
                    - party : Toggles multicolor mode for Matrix Rain
                    - go : Run the Ai program
                    - game : Start Pong game
                    - status : Check the status of solTerminal`;

                return helpText.split('\n').map((line, index) => <div key={index}>{line}</div>);
            },
            about: () => 'SOLTerminal Version 1.0 - Interactive simulation for the Solana blockchain.',
            clear: () => {
                setOutput([]);
                return '';
            },
            date: () => new Date().toLocaleString('en-US', { timeZone: 'UTC' }),
            echo: (args) => args.join(' '),
            go: () => {
                setShowButton(true); // Show button when "go" is entered
                return '';
            },
            status: () => (
                <div>
                    [ 🔧 Implementation: Expanding ecosystem features ] <br />
                    [ 🌐 Website: User experience enhancements in progress ] <br />
                    [ 🛠️ Debug Mode: Final optimizations underway ]
                </div>
            )
            
        };

        if (commands[command]) {
            result = await commands[command](args);
        } else {
            result = `Command not recognized: ${command}. Type 'help' for a list of available commands.`;
        }

        setOutput(prevOutput => [
            ...prevOutput,
            <div key={prevOutput.length}>
                <span className="prompt">guest@terminal:~$</span> {input}
            </div>,
            <div key={prevOutput.length + 1}>{result}</div>
        ]);

        setHistory(prevHistory => [...prevHistory, input]);
        setHistoryIndex(history.length);
        setInput('');
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        setIsTyping(true); // User is typing
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) {
                processCommand();
                setIsTyping(false); // Stop typing when enter is pressed
            }
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                setHistoryIndex(historyIndex - 1);
                setInput(history[historyIndex - 1]);
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < history.length - 1) {
                setHistoryIndex(historyIndex + 1);
                setInput(history[historyIndex + 1]);
            } else {
                setHistoryIndex(history.length);
                setInput('');
            }
        }
    };

    useEffect(() => {
        if (isTyping) {
            document.getElementById('typed-text').classList.add('active-cursor');
        } else {
            document.getElementById('typed-text').classList.remove('active-cursor');
        }
    }, [isTyping]);

    return (
        <div className="terminal-content">
            <div id="output">
                {output}
            </div>

            <div className="command-line">
                <span className="prompt">guest@terminal:~$</span>
                <span id="typed-text">{input}</span>
                <input
                    id="terminal-input"
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />
            </div>
        </div>
    );
};

export default Terminal;
