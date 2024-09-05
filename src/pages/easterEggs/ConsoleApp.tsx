import React from 'react';

const SETTINGS = {
    skipStartupAnimation: true,
    version: 'v1.0.0'
}

class ConsoleLine {
    displayText: string;
    originalText: string;
    type: 'input' | 'output';
    functionData: any;
    onEmit: Function = () => { };

    constructor(text: string, type: 'input' | 'output') {
        this.displayText = text;
        this.originalText = text;
        this.type = type;
        this.functionData = {};
    }

    onDraw(self: ConsoleLine) {
        self
    }

    duplicate() {
        const newLine = new ConsoleLine(this.originalText, this.type);
        newLine.functionData = this.functionData;
        newLine.onDraw = this.onDraw;
        return newLine;
    }
}

interface ConsoleState {
    lines: ConsoleLine[];
    currentLine: string;
    cursorPosition: number;
    cursorVisible: boolean;
    currentPath: string;
}

class ConsoleApp extends React.Component<{}, ConsoleState> {
    private canvasRef: React.RefObject<HTMLCanvasElement>;
    private ctx: CanvasRenderingContext2D | null = null;
    private animationFrameId: number | null = null;

    // Console settings
    private readonly lineHeight = 20;
    private readonly padding = 10;
    private readonly fontSize = 16;
    private readonly cursorBlinkInterval = 500; // milliseconds
    private readonly consoleLineStart = '~$ ';
    activeKeys: Set<string>;
    recentKeys: string[];
    allowInput: boolean;

    constructor(props: {}) {
        super(props);
        this.state = {
            lines: [],
            currentLine: '',
            cursorPosition: 0,
            cursorVisible: true,
            currentPath: 'C:/desktop'
        };
        this.activeKeys = new Set();
        this.recentKeys = [];
        this.allowInput = false; // Changed to true for immediate input

        this.canvasRef = React.createRef();
    }

    onInit() {
        const startupFunction = (() => {
            lines.length = 0
            this.allowInput = true;
            lines.push(new ConsoleLine(`Welcome to M.A.R.A.`, 'output'));
            lines.push(new ConsoleLine(`Type 'help' for a list of commands.`, 'output'));
            this.setState({ lines });
        })
        const { lines } = this.state;
        if (SETTINGS.skipStartupAnimation) {
            startupFunction();
            return;
        }
        lines.push(new ConsoleLine(`
███╗   ███╗    █████╗    ██████╗     █████╗         ██████╗ ███████╗
████╗ ████║   ██╔══██╗   ██╔══██╗   ██╔══██╗       ██╔═══██╗██╔════╝
██╔████╔██║   ███████║   ██████╔╝   ███████║       ██║   ██║███████╗
██║╚██╔╝██║   ██╔══██║   ██╔══██╗   ██╔══██║       ██║   ██║╚════██║
██║ ╚═╝ ██║██╗██║  ██║██╗██║  ██║██╗██║  ██║██╗    ╚██████╔╝███████║
╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝     ╚═════╝ ╚══════╝`, 'output'));

        lines.push(new ConsoleLine(`Console ${SETTINGS.version}`, 'output'));
        const now = new Date(Date.now())
        lines.push(new ConsoleLine(`Current Date: ${now.getDate()}/${now.getMonth()}/${now.getFullYear()}`, 'output'));
        lines.push(new ConsoleLine(`Loading Kernel...`, 'output'));
        const loadingBar = new ConsoleLine(`[=··········]`, 'output');
        loadingBar.functionData.progress = 0;
        loadingBar.functionData.progressNeeded = 50;

        loadingBar.onDraw = (self: ConsoleLine) => {
            let progress = self.functionData.progress / self.functionData.progressNeeded * 10
            if (progress > 10) progress = 10;
            progress = Math.floor(progress);
            const progressText = `[${'='.repeat(progress)}${'·'.repeat(10 - progress)}] ${Math.floor(self.functionData.progress / self.functionData.progressNeeded * 100)}%`;
            self.displayText = progressText;
            self.functionData.progress += 1;
            if (self.functionData.progress > self.functionData.progressNeeded) {
                self.displayText = '[==========] Complete!';
                self.onEmit()
                self.onDraw = () => {
                }
            }
        };
        const loadingBar2 = loadingBar.duplicate();
        loadingBar2.functionData.progress = 0;
        lines.push(loadingBar2);
        loadingBar2.onEmit = (() => {
            lines.push(new ConsoleLine(`Loading System Data...`, 'output'));
            const loadingBar3 = loadingBar.duplicate();
            loadingBar3.functionData.message = 'xxx';
            loadingBar3.functionData.progress = 0;
            loadingBar3.functionData.progressNeeded = 5;
            lines.push(loadingBar3);
            loadingBar3.onEmit = (() => {
                lines.push(new ConsoleLine(`Checking for Vulnerabilities...`, 'output'));
                const loadingBar4 = loadingBar.duplicate();
                loadingBar4.functionData.progress = 0;
                loadingBar4.functionData.progressNeeded = 12;
                lines.push(loadingBar4);
                loadingBar4.onEmit = (() => {
                    lines.push(new ConsoleLine(`Loading M.A.R.A. Files...`, 'output'));
                    const loadingBar5 = loadingBar.duplicate();
                    loadingBar5.functionData.progress = 0;
                    loadingBar5.functionData.progressNeeded = 200;
                    loadingBar5.onEmit = (() => {
                        lines.push(new ConsoleLine(`M.A.R.A. Files Loaded!`, 'output'));
                        lines.push(new ConsoleLine(`Rebooting...`, 'output'));
                        const loadingBar6 = loadingBar.duplicate();
                        loadingBar6.functionData.progress = 0;
                        loadingBar6.functionData.progressNeeded = 69;
                        loadingBar6.onEmit = startupFunction;
                        lines.push(loadingBar6);


                    });
                    lines.push(loadingBar5);

                });

            });
        });
    }

    componentDidMount() {
        this.onInit();
        if (this.canvasRef.current) {
            this.ctx = this.canvasRef.current.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
            window.addEventListener('resize', this.handleResize); // Listen for window resize
            this.startCursorBlink();
            this.animationFrameId = requestAnimationFrame(() => this.updateCanvas());
        }
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('resize', this.handleResize); // Remove resize listener
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    handleResize = () => {
        this.resizeCanvas();
    };

    resizeCanvas = () => {
        if (this.canvasRef.current) {
            this.canvasRef.current.width = window.innerWidth;
            this.canvasRef.current.height = window.innerHeight;
        }
    };

    onEnter = (command: string) => {
        let { lines } = this.state;
        lines.push(new ConsoleLine(command, 'input'));
        lines.push(new ConsoleLine(`Command entered: ${command}`, 'output'));
        this.setState({ lines, currentLine: '' });
    }

    startCursorBlink = () => {
        setInterval(() => {
            this.setState(prevState => ({ cursorVisible: !prevState.cursorVisible }));
        }, this.cursorBlinkInterval);
    }

    private wrapText(text: string, maxWidth: number): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = this.ctx!.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        return lines;
    }

    updateCanvas = () => {
        if (this.ctx && this.canvasRef.current) {
            const { width, height } = this.canvasRef.current;

            // Clear the canvas
            this.ctx.fillStyle = 'rgba(0, 20, 0, 0.1)';
            this.ctx.fillRect(0, 0, width, height);

            // Apply CRT effect
            this.applyCRTEffect();

            this.ctx.font = `${this.fontSize}px monospace`;
            this.ctx.fillStyle = '#00ff00'; // Green text color

            const maxWidth = width - this.padding * 2;
            let y = height - this.lineHeight * 2 - this.padding;

            // Draw previous lines
            for (let i = this.state.lines.length - 1; i >= 0 && y > 0; i--) {
                const line = this.state.lines[i];
                if (!line) continue;
                const onDraw = line.onDraw || (() => { });
                onDraw(line);
                const prefix = line.type === 'input' ? this.consoleLineStart : '';
                const fullText = prefix + line.displayText;
                const wrappedLines = fullText.split('\n').flatMap(textLine => this.wrapText(textLine, maxWidth));

                for (let j = wrappedLines.length - 1; j >= 0 && y > 0; j--) {
                    this.ctx.fillText(wrappedLines[j], this.padding, y);
                    y -= this.lineHeight;
                }
            }

            if (this.allowInput) {
                // Draw current line
                let currentLineText = this.consoleLineStart + this.state.currentLine;
                const maxCharactersOnLine = Math.floor(maxWidth / (this.fontSize * 0.55));
                currentLineText = currentLineText.slice(-maxCharactersOnLine);
                this.ctx.fillText(currentLineText, this.padding, height - this.lineHeight - this.padding);


                // Draw cursor
                if (this.state.cursorVisible) {
                    const cursorX = (this.state.cursorPosition + this.consoleLineStart.length) * (this.fontSize * 0.55) + this.padding + 2;
                    const cursorY = height - this.lineHeight * 1.8 - this.padding + 2;
                    this.ctx.fillRect(cursorX, cursorY, 2, this.fontSize);
                }
            }
        }
        this.animationFrameId = requestAnimationFrame(this.updateCanvas);
    }

    applyCRTEffect = () => {
        if (this.ctx && this.canvasRef.current) {
            const { width, height } = this.canvasRef.current;

            // Add scanlines
            for (let y = 0; y < height; y += 4) {
                this.ctx.fillStyle = 'rgba(0, 20, 0, 0.1)';
                this.ctx.fillRect(0, y, width, 2);
            }

            // Add slight blur
            this.ctx.filter = 'blur(0.5px)';

            // Add vignette effect
            const gradient = this.ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
            gradient.addColorStop(0, 'rgba(0, 30, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 30, 0, 0.4)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, width, height);

            // Reset filter
            this.ctx.filter = 'none';
        }
    }

    handleKeyUp = (e: KeyboardEvent) => {
        e.preventDefault();
        this.activeKeys.delete(e.key);
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if (!this.allowInput) return;
        let runProgram = null;
        e.preventDefault();
        let { currentLine, cursorPosition, lines, currentPath } = this.state;

        this.activeKeys.add(e.key);
        this.recentKeys.push(e.key);

        switch (e.key) {
            case 'Enter':
                if (this.activeKeys.has('Shift')) {
                    currentLine += '\n';
                    cursorPosition++;
                    break;
                } else {
                    runProgram = currentLine;
                    currentLine = '';
                    cursorPosition = 0;
                    break;
                }
            case 'Backspace':
                if (cursorPosition > 0) {
                    currentLine = currentLine.slice(0, cursorPosition - 1) + currentLine.slice(cursorPosition);
                    cursorPosition--;
                }
                break;
            case 'ArrowLeft':
                if (cursorPosition > 0) cursorPosition--;
                break;
            case 'ArrowRight':
                if (cursorPosition < currentLine.length) cursorPosition++;
                break;
            case 'Delete':
                if (cursorPosition < currentLine.length) {
                    currentLine = currentLine.slice(0, cursorPosition) + currentLine.slice(cursorPosition + 1);
                }
                break;
            default:
                if (this.activeKeys.has('Control')) {
                    switch (e.key) {
                        case 'c':
                            lines.push(new ConsoleLine(currentLine, 'input'));
                            navigator.clipboard.writeText(currentLine);
                            currentLine = '';
                            cursorPosition = 0;
                            break;
                        case 'v':
                            navigator.clipboard.readText().then(text => {
                                currentLine = currentLine.slice(0, cursorPosition) + text + currentLine.slice(cursorPosition);
                                cursorPosition += text.length;
                                this.setState({ currentLine, cursorPosition, lines });
                            });
                            return;
                        case 's':
                            localStorage.setItem('console', JSON.stringify({ currentLine, cursorPosition, lines, currentPath }));
                            break;
                        case 'r':
                            const savedData = JSON.parse(localStorage.getItem('console') || '{}');
                            currentLine = savedData.currentLine || '';
                            cursorPosition = savedData.cursorPosition || 0;
                            lines = []
                            for (let index = 0; index < savedData.lines.length; index++) {
                                lines.push(new ConsoleLine(savedData.lines[index].originalText, savedData.lines[index].type));
                                lines[index].functionData = savedData.lines[index].functionData;
                                lines[index].displayText = savedData.lines[index].displayText;
                            }
                            currentPath = savedData.currentPath || 'C:/desktop';
                            console.log(lines)
                            break;
                        default:
                            break;
                    }
                } else {
                    if (e.key.length === 1) {
                        currentLine = currentLine.slice(0, cursorPosition) + e.key + currentLine.slice(cursorPosition);
                        cursorPosition++;
                    }
                }
        }

        this.setState({ currentLine, cursorPosition, lines, currentPath });
        if (runProgram) {
            this.onEnter(runProgram);
        }
    }

    render() {
        return (
            <div className="crt-container">
                <canvas ref={this.canvasRef} style={{ display: 'block' }} />
                <style>{`
                    .crt-container {
                        position: relative;
                        overflow: hidden;
                    }
                    .crt-container::before {
                        content: " ";
                        display: block;
                        position: absolute;
                        top: 0;
                        left: 0;
                        bottom: 0;
                        right: 0;
                        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                        z-index: 2;
                        background-size: 100% 2px, 3px 100%;
                        pointer-events: none;
                    }
                `}</style>
            </div>
        );
    }
}

export default ConsoleApp;
