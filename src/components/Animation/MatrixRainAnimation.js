import React, { useEffect, useRef, useState, useCallback } from "react";

function MatrixRainAnimation() {
    const canvasRef = useRef(null);
    const [partyMode, setPartyMode] = useState(true);
    const [characterSet, setCharacterSet] = useState('matrix');
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const symbolsRef = useRef([]);
    const animationFrameRef = useRef(null);

    // Character sets
    const characterSets = {
        matrix: "ABCDEFGHIJKLMNOPQRSTUVWXYZ01",
        emoji: ["🏳️‍🌈","🌈", "🚀", "🌟", "🔮", "🌸", "🌊", "🌋", "🌙", "🍄", "🦄", "🐙", "🐬", "🐲", "🦁", "🦊", "🐨", "🐸", "🐳"],
        binary: "01",
        hacker: "!@#$%^&*()_+{}[]|\\:;<>?,./",
        japanese: "あいうえおかきくけこさしすせそ"
    };

    const createSymbol = useCallback((x, y, fontSize, canvasHeight, characters) => {
        return {
            x,
            y,
            fontSize,
            canvasHeight,
            text: "",
            draw(context) {
                // Adjust font for emojis
                if (Array.isArray(characters)) {
                    this.text = characters[Math.floor(Math.random() * characters.length)];
                    context.font = `${fontSize}px serif`; // Use a font that supports emojis
                } else {
                    this.text = characters.charAt(Math.floor(Math.random() * characters.length));
                    context.font = `${fontSize}px monospace`;
                }
                
                context.textAlign = "center";
                context.fillText(this.text, this.x * this.fontSize, this.y * this.fontSize);
            },
            update(mousePosition, interactionRadius) {
                const symbolCenterX = this.x * this.fontSize;
                const symbolCenterY = this.y * this.fontSize;
                const dx = symbolCenterX - mousePosition.x;
                const dy = symbolCenterY - mousePosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < interactionRadius) {
                    const pushFactor = 1 - (distance / interactionRadius);
                    this.y -= pushFactor * 2;
                    
                    if (this.y < 0) this.y = this.canvasHeight / this.fontSize;
                } else {
                    if (this.y * this.fontSize > this.canvasHeight && Math.random() > 0.98) {
                        this.y = 0;
                    } else {
                        this.y += 1;
                    }
                }
            },
        };
    }, []);

    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const fontSize = 15; // Increased font size for better emoji visibility
        const columns = Math.floor(canvas.width / fontSize);
        const characters = characterSets[characterSet];

        // Clear previous animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Reset symbols
        symbolsRef.current = [];
        for (let i = 0; i < columns; i++) {
            symbolsRef.current.push(
                createSymbol(i, 0, fontSize, canvas.height, characters)
            );
        }

        // Create gradient
        const createGradient = () => {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "red");
            gradient.addColorStop(0.2, "yellow");
            gradient.addColorStop(0.4, "green");
            gradient.addColorStop(0.6, "cyan");
            gradient.addColorStop(0.8, "blue");
            gradient.addColorStop(1, "magenta");
            return gradient;
        };

        // Interaction parameters
        const interactionRadius = 100;

        // Animation loop
        let lastTime = 0;
        const fps = 50;
        const nextframe = 1000 / fps;
        let timer = 0;

        const animate = (timeStamp) => {
            const deltaTime = timeStamp - lastTime;
            lastTime = timeStamp;

            if (timer > nextframe) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = partyMode ? createGradient() : "#0aff0a";

                symbolsRef.current.forEach((symbol) => {
                    symbol.draw(ctx);
                    symbol.update(mousePositionRef.current, interactionRadius);
                });

                timer = 0;
            } else {
                timer += deltaTime;
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Start the animation
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [characterSet, partyMode, createSymbol]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Track mouse position
        const trackMousePosition = (event) => {
            mousePositionRef.current = { 
                x: event.clientX, 
                y: event.clientY 
            };
        };

        // Resize canvas on window resize
        const resizeCanvas = () => {
            initializeCanvas();
        };

        // Add event listeners
        window.addEventListener("mousemove", trackMousePosition);
        window.addEventListener("resize", resizeCanvas);

        // Initial canvas setup
        const cleanup = initializeCanvas();

        // Cleanup listeners
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", trackMousePosition);
            cleanup();
        };
    }, [initializeCanvas]);

    // Toggle party mode
    const togglePartyMode = () => {
        setPartyMode(!partyMode);
    };

    return (
        <div>
            <canvas ref={canvasRef} style={{cursor: 'none'}} />
            <div style={{
                position: 'absolute', 
                top: '10px', 
                left: '10px', 
                zIndex: 100,
                display: 'flex',
                gap: '10px'
            }}>
                <select 
                    value={characterSet} 
                    onChange={(e) => setCharacterSet(e.target.value)}
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                        color: '#0aff0a',
                        border: '1px solid #0aff0a', 
                        borderRadius: '4px', 
                        padding: '5px', 
                        fontFamily: 'monospace'
                    }}
                >
                    {Object.keys(characterSets).map(set => (
                        <option key={set} value={set}>
                            {set.charAt(0).toUpperCase() + set.slice(1)} Style
                        </option>
                    ))}
                </select>
                <button onClick={togglePartyMode}>
                    {partyMode ? 'Normal Mode' : 'Party Mode'}
                </button>
            </div>
        </div>
    );
}

export default MatrixRainAnimation;