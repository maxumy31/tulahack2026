// In-memory state for bot toggle (no database imports)
let useBot = false;

export function GetUseBot() {
    return useBot;
}

export function SetUseBot(value: boolean) {
    useBot = value;
}
