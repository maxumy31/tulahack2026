const serverState = {
    useBot : false,
}

async function SetUseBot(value : boolean) {
    serverState.useBot = value;
}

async function GetUseBot() {
    return serverState.useBot;
}