import { Client } from './structures';
export const client = new Client();

const callback = (err: Error) => {
    const errorMessages = [
        'Missing Acess',
        'Unknown Message',
        'Unknown interaction',
        'Missing Permissions',
    ];

    if (err?.stack === undefined || errorMessages.some((message) => err?.stack.includes(message))) return;
    if (err?.stack) console.error(err?.stack);
};

process
    .on('uncaughtExceptionMonitor', callback)
    .on('unhandledRejection', callback)
    .on('uncaughtException', callback);