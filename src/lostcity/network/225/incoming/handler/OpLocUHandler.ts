import MessageHandler from '#lostcity/network/incoming/handler/MessageHandler.js';
import World from '#lostcity/engine/World.js';
import { NetworkPlayer } from '#lostcity/entity/NetworkPlayer.js';
import OpLocU from '#lostcity/network/incoming/model/OpLocU.js';
import Component from '#lostcity/cache/Component.js';
import ObjType from '#lostcity/cache/ObjType.js';
import Interaction from '#lostcity/entity/Interaction.js';
import ServerTriggerType from '#lostcity/engine/script/ServerTriggerType.js';

export default class OpLocUHandler extends MessageHandler<OpLocU> {
    handle(message: OpLocU, player: NetworkPlayer): boolean {
        const { x, z, loc: locId, useObj: item, useSlot: slot, useComponent: comId } = message;

        const com = Component.get(comId);
        if (typeof com === 'undefined' || !player.isComponentVisible(com)) {
            return false;
        }

        const absLeftX = player.loadedX - 52;
        const absRightX = player.loadedX + 52;
        const absTopZ = player.loadedZ + 52;
        const absBottomZ = player.loadedZ - 52;
        if (x < absLeftX || x > absRightX || z < absBottomZ || z > absTopZ) {
            return false;
        }

        const listener = player.invListeners.find(l => l.com === comId);
        if (!listener) {
            return false;
        }

        const inv = player.getInventoryFromListener(listener);
        if (!inv || !inv.validSlot(slot) || !inv.hasAt(slot, item)) {
            return false;
        }

        const loc = World.getLoc(x, z, player.level, locId);
        if (!loc) {
            return false;
        }

        if (player.delayed()) {
            return false;
        }

        if (ObjType.get(item).members && !World.members) {
            player.messageGame("To use player item please login to a members' server.");
            return false;
        }

        player.lastUseItem = item;
        player.lastUseSlot = slot;

        player.clearInteraction();
        player.closeModal();
        player.setInteraction(Interaction.ENGINE, loc, ServerTriggerType.APLOCU);
        player.opcalled = true;
        return true;
    }
}