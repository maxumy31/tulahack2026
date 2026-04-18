interface TicketStats {
    openedHuman: number;
    openedBot: number;
    closedHuman: number;
    closedBot: number;
}

const serverState = {
    useBot : false,
    ticketStats: {
        openedHuman: 5,
        openedBot: 3,
        closedHuman: 12,
        closedBot: 8,
    } as TicketStats
}

async function SetUseBot(value : boolean) {
    serverState.useBot = value;
}

async function GetUseBot() {
    return serverState.useBot;
}

async function GetTicketStats(): Promise<TicketStats> {
    return serverState.ticketStats;
}

async function UpdateTicketStats(stats: Partial<TicketStats>) {
    serverState.ticketStats = { ...serverState.ticketStats, ...stats };
}

export { SetUseBot, GetUseBot, GetTicketStats, UpdateTicketStats, type TicketStats }