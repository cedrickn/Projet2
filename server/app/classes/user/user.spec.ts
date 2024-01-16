/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Socket } from 'socket.io';
import Match from '@app/classes/match/match';
import User from '@app/classes/user/user';

describe('User', () => {
    let socket: Socket;
    let match: Match;
    let user: User;
    let joinSpy: sinon.SinonSpy;
    let toAllSpy: sinon.SinonSpy;
    let emitSpy: sinon.SinonSpy;
    let leaveSpy: sinon.SinonSpy;

    beforeEach(() => {
        socket = {
            on: sinon.stub(),
            join: () => {},
            leave: () => {},
            emit: () => {},
            broadcast: {
                to: () => {
                    return {
                        emit: () => {},
                    };
                },
            },
            removeAllListeners: () => {},
        } as unknown as Socket;
        emitSpy = sinon.spy(socket, 'emit');
        leaveSpy = sinon.spy(socket, 'leave');
        joinSpy = sinon.spy(socket, 'join');

        match = {
            getPlayersNameList: sinon.stub().returns(['player1', 'player2', 'player3']),
            toAll: () => {},
        } as unknown as Match;
        toAllSpy = sinon.spy(match, 'toAll');

        user = new User(socket, '0000', 'name', match);
    });

    it('should initialize', async () => {
        await user.init();
        expect(joinSpy.calledWith('0000')).to.be.true;
        expect(toAllSpy.calledWith('updatedPlayersList', ['player1', 'player2', 'player3'])).to.be.true;
    });

    it('should leave room', async () => {
        await user.leaveRoom();
        expect(emitSpy.calledWith('backToHomePage')).to.be.true;
        expect(leaveSpy.calledWith('0000')).to.be.true;
    });

    it('should emit updatedWaitRoomPlayersList when waitRoomPageInitialized is emitted', () => {
        const callback = (socket.on as sinon.SinonStub).getCall(0).args[1];
        callback();
        expect(emitSpy.calledWith('updatedWaitRoomPlayersList', ['player1', 'player2', 'player3'])).to.be.true;
    });

    it('should emit messageText when messageText is emitted', () => {
        const callback = (socket.on as sinon.SinonStub).getCall(1).args[1];
        callback({ text: 'message', code: '0000' });
        expect(emitSpy.calledWith('messageText', { author: 'name', text: 'message', color: 'black', time: sinon.match.string })).to.be.true;
    });

    it('should send MESSAGE TROP LONG when messageText is emitted with a too long message', () => {
        const callback = (socket.on as sinon.SinonStub).getCall(1).args[1];
        callback({ text: 'a'.repeat(1000), code: '0000' });
        expect(emitSpy.calledWith('messageText', { author: 'Système', text: 'MESSAGE TROP LONG', color: 'red', time: sinon.match.string })).to.be
            .true;
    });

    it('should not do anything on empty messageText', () => {
        const callback = (socket.on as sinon.SinonStub).getCall(1).args[1];
        callback({ text: '', code: '0000' });
        expect(emitSpy.called).to.be.false;
    });

    it('should send data back with the on event', () => {
        user.on('test', () => {}, 'data');
        expect(emitSpy.called).to.be.true;
    });
});
