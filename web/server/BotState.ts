'use server'
let useBot = true;

export async function GetUseBot() {
    return useBot;
}

export async function SetUseBot(value: boolean) {
    useBot = value;
}
