const serverState = {
    useBot : true,
}

async function SetUseBot(value : boolean) {
    serverState.useBot = value;
}

async function GetUseBot() {
    return serverState.useBot;
}