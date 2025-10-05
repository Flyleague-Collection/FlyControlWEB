type TicketModel = {
    id: number;
    creator: number;
    type: number;
    title: string;
    content: string;
    reply: number;
    closer: number;
    open_at: Date;
    close_at: Date;
}