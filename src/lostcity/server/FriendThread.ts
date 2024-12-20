import { parentPort } from 'worker_threads';

import Environment from '#lostcity/util/Environment.js';
import { FriendClient } from './FriendServer.js';

const client = new FriendClient(Environment.NODE_ID);

if (Environment.STANDALONE_BUNDLE) {
    self.onmessage = async msg => {
        try {
            await handleRequests(self, msg.data);
        } catch (err) {
            console.error(err);
        }
    };
    
    client.onMessage((opcode, data) => {
        self.postMessage({ opcode, data });
    });
} else {
    if (!parentPort) throw new Error('This file must be run as a worker thread.');

    parentPort.on('message', async msg => {
        try {
            if (!parentPort) throw new Error('This file must be run as a worker thread.');
            await handleRequests(parentPort, msg);
        } catch (err) {
            console.error(err);
        }
    });

    client.onMessage((opcode, data) => {
        parentPort!.postMessage({ opcode, data });
    });
}

type ParentPort = {
    postMessage: (msg: any) => void;
};

async function handleRequests(parentPort: ParentPort, msg: any) {
    switch (msg.type) {
        case 'connect': {
            await client.worldConnect();
            break;
        }
        case 'player_login': {
            const { username, chatModePrivate } = msg;
            await client.playerLogin(username, chatModePrivate);
            break;
        }
        case 'player_logout': {
            const { username } = msg;
            await client.playerLogout(username);
            break;
        }
        case 'player_friendslist_add': {
            const { username, target } = msg;
            await client.playerFriendslistAdd(username, target);
            break;
        }
        case 'player_friendslist_remove': {
            const { username, target } = msg;
            await client.playerFriendslistRemove(username, target);
            break;
        }
        case 'player_ignorelist_add': {
            const { username, target } = msg;
            await client.playerIgnorelistAdd(username, target);
            break;
        }
        case 'player_ignorelist_remove': {
            const { username, target } = msg;
            await client.playerIgnorelistRemove(username, target);
            break;
        }
        case 'player_chat_setmode': {
            const { username, chatModePrivate } = msg;
            await client.playerChatSetMode(username, chatModePrivate);
            break;
        }
        case 'private_message': {
            const { username, staffLvl, pmId, target, message } = msg;
            await client.privateMessage(username, staffLvl, pmId, target, message);
            break;
        }
        default:
            console.error('Unknown message type: ' + msg.type);
            break;
    }
}
