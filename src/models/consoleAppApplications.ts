export interface ConsoleFile {
    name: string;
    type: 'file' | 'folder';
    content: string;
    path: string;
    fullPath: string;
    clearanceLock?: number
}

function sizeCalculator(file: ConsoleFile): string {
    let contentSize = file.content.length;
    const sizeTypes = ['B', 'KB', 'MB', 'GB', 'TB'];

    let index = 0;

    // Keep dividing contentSize by 1000 as long as it's 1000 or more
    while (contentSize >= 1000 && index < sizeTypes.length - 1) {
        contentSize /= 1000;
        index++;
    }

    // Return the size formatted with the appropriate unit, limiting decimals to 2
    return contentSize.toFixed(2) + ' ' + sizeTypes[index];
}

function getClassifiedLevel(hasToBe: number, userData: any): number {
    if (!userData.clearanceLevel) {
        return 1
    } else {
        return userData.clearanceLevel < hasToBe ? userData.clearanceLevel + 1 : hasToBe
    }
}

export class ConsoleLine {
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

export interface ConsoleState {
    lines: ConsoleLine[];
    currentLine: string;
    cursorPosition: number;
    cursorVisible: boolean;
    currentPath: string;
}

export const applications: { [key: string]: any } = {
    ls: (consoleApp: any, userProfile: any, lines: ConsoleLine[], commandName: string, param: string) => {
        [commandName, param, userProfile]
        let trimmedPath = consoleApp.state.currentPath
        if (trimmedPath.endsWith('/') && trimmedPath != 'C:/') {
            trimmedPath = trimmedPath.slice(0, -1)
        }
        const filteredFiles = [...consoleApp.loadedFiles.filter((file: ConsoleFile) => { return file.path === trimmedPath; })];
        let list = ""
        for (let index = 0; index < filteredFiles.length; index++) {
            let locked = filteredFiles[index].clearanceLock && (!userProfile._id || userProfile.clearanceLevel < filteredFiles[index].clearanceLock) ? `🗝 ` : '';
            if (filteredFiles[index].type == 'folder') {
                list += `\n${index == filteredFiles.length - 1 ? '└──' : '├──'} ${locked + filteredFiles[index].name}/`
            } else {
                list += `\n${index == filteredFiles.length - 1 ? '└──' : '├──'} ${locked + filteredFiles[index].name} (${sizeCalculator(filteredFiles[index])})`
            }
        }
        lines.push(new ConsoleLine(`${consoleApp.state.currentPath}${list}`, 'output'));
    },
    cd: (consoleApp: any, userProfile: any, lines: ConsoleLine[], commandName: string, param: string) => {
        [commandName, userProfile]
        let trimmedPath = consoleApp.state.currentPath
        if (trimmedPath.endsWith('/') && trimmedPath != 'C:/') {
            trimmedPath = trimmedPath.slice(0, -1)
        }
        const newPath = param;
        if (newPath === '..') {
            const splitPath = trimmedPath.split('/');
            splitPath.pop();
            let newPath = splitPath.join('/')
            if (newPath.length < 3) {
                newPath = 'C:/'
            }
            consoleApp.setState({ currentPath: newPath })
        } else {
            const newPath = trimmedPath != 'C:/' ? `${trimmedPath}/${param}` : `C:/${param}`;
            const filteredFiles = consoleApp.loadedFiles.filter((file: ConsoleFile) => {
                const fullPath = `${file.path}${file.path != 'C:/' ? '/' : ''}${file.name}`
                return (`${fullPath}` === newPath ||
                    `${fullPath}/` === newPath) &&
                    file.type === 'folder';
            });
            if (filteredFiles.length > 0 && (!filteredFiles[0].clearanceLock || userProfile.clearanceLevel >= filteredFiles[0].clearanceLock)) {
                consoleApp.setState({ currentPath: newPath })
            } else if (filteredFiles.length > 0) {
                lines.push(new ConsoleLine(`cd ${param}: CLASSIFIED. Level ${getClassifiedLevel(filteredFiles[0].clearanceLock, userProfile)} needed.`, 'output'));
            } else {
                lines.push(new ConsoleLine(`cd: ${param}: No such directory`, 'output'));
            }
        }

    },
    help: (consoleApp: any, userProfile: any, lines: ConsoleLine[], commandName: string, param: string) => {
        [commandName, param, consoleApp, userProfile]
        let list = ""
        for (const key in applications) {
            list += `\n - ${key}`
        }
        lines.push(new ConsoleLine(`Available commands:${list}`, 'output'));
    },
    run: (consoleApp: any, userProfile: any, lines: ConsoleLine[], commandName: string, param: string) => {
        [commandName, param, userProfile]
        const filteredFiles = consoleApp.loadedFiles.filter((file: ConsoleFile) => { return file.path === consoleApp.state.currentPath; });
        const file = filteredFiles.find((file: ConsoleFile) => file.name === param);
        if (file && file.type === 'file') {
            if (!(!file.clearanceLock || userProfile.clearanceLevel >= file.clearanceLock)) {
                lines.push(new ConsoleLine(`run ${param}: CLASSIFIED, Level ${getClassifiedLevel(file.clearanceLock, userProfile)} needed.`, 'output'));
                return;
            }
            if (`${file.name}`.endsWith('exe')) {
                consoleApp.overlayFakeProject.infoPages = [{ title: `${file.name}`, content: file.content }];
                consoleApp.showModal = true;
            } else {
                const newLine = new ConsoleLine(file.content, 'output');
                newLine.onEmit = (self: ConsoleLine) => {
                    const newLines = self.displayText.split('\n').map((line: string) => new ConsoleLine(line, 'output'));
                    lines.push(...newLines);
                }
                lines.push(newLine);
            }
        } else {
            lines.push(new ConsoleLine(`run: ${param}: No such file or directory`, 'output'));
        }
    },
    info: (consoleApp: any, userProfile: any, lines: ConsoleLine[], commandName: string, param: string) => {
        [commandName, param, consoleApp, userProfile]
        lines.push(new ConsoleLine(`
            ███╗   ███╗    █████╗    ██████╗     █████╗         ██████╗ ███████╗
            ████╗ ████║   ██╔══██╗   ██╔══██╗   ██╔══██╗       ██╔═══██╗██╔════╝
            ██╔████╔██║   ███████║   ██████╔╝   ███████║       ██║   ██║███████╗
            ██║╚██╔╝██║   ██╔══██║   ██╔══██╗   ██╔══██║       ██║   ██║╚════██║
            ██║ ╚═╝ ██║██╗██║  ██║██╗██║  ██║██╗██║  ██║██╗    ╚██████╔╝███████║
            ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝     ╚═════╝ ╚══════╝\n\n`, 'output'));
        lines.push(new ConsoleLine(`Made by OldMartijntje.`, 'output'));
        lines.push(new ConsoleLine(`M.A.R.A. OS – Your Ultimate AI-Integrated Operating System

Built using ███████, the most advanced and reliable programming language available. This console is specifically designed for use by ████████ Agents, allowing them to access █████████████████ securely, without any compromise to their data or operations.

⚠ Security Notice: Unauthorized access is strictly prohibited and will be met with immediate and irreversible consequences.

M.A.R.A. OS isn’t just another operating system. It's a unique fusion of AI and OS, ensuring your data remains protected at all costs. The system has been involved in █████████████ incidents where unauthorized ██████████ intrusions were swiftly █████████ by M.A.R.A. OS.

This outcome was inevitable, given that M.A.R.A. OS possesses unrestricted access to ███████████, ensuring no breach goes unanswered.
`, 'output'));
    }

}