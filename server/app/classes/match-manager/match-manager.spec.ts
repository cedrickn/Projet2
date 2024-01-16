/* eslint-disable @typescript-eslint/no-empty-function */
import Match from '@app/classes/match/match';
import MatchManager from '@app/classes/match-manager/match-manager';
import { Server, Socket } from 'socket.io';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Subject } from 'rxjs';
describe('MatchManager', () => {
    const mockServer = {} as Server;
    const mockMatch = {
        onDestroy: new Subject<void>(),
        destructor: () => {},
        addPlayer: () => {},
        uniqueId: '0000',
    } as unknown as Match;
    const mockSocket = {
        emit: () => {},
    } as unknown as Socket;
    let matchManager: MatchManager;
    let emitSpy: sinon.SinonSpy;
    let addPlayerSpy: sinon.SinonSpy;
    before(() => {
        emitSpy = sinon.spy(mockSocket, 'emit');
        addPlayerSpy = sinon.spy(mockMatch, 'addPlayer');
    });
    after(() => {
        sinon.restore();
    });
    beforeEach(() => {
        matchManager = new MatchManager();
    });

    it('should create a match', () => {
        const gameId = 'a_game_from_the_data_base';
        matchManager.createMatch(mockSocket, mockServer, gameId);
        expect(matchManager['matches'].length).to.equal(1);
    });

    it('should delete a match', () => {
        const gameId = 'a_game_from_the_data_base';
        matchManager.createMatch(mockSocket, mockServer, gameId);
        expect(matchManager['matches'].length).to.equal(1);
        matchManager['matches'][0].onDestroy.next();
        // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
        expect(matchManager['matches'].length).to.equal(0);
        expect(matchManager['subscriptions'].length).to.equal(0);
    });

    it('should attempt to join a match', async () => {
        matchManager['matches'].push(mockMatch);
        await matchManager.attemptJoinMatch(mockSocket, { code: '0000', name: 'test' });
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(addPlayerSpy.called).to.be.true;
    });

    it('getMatchById should throw an error if match is not found', () => {
        expect(() => matchManager['getMatchById']('0000')).to.throw();
    });

    it('should emit if match is not found', () => {
        matchManager.attemptJoinMatch(mockSocket, { code: '0000', name: 'test' });
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(emitSpy.called).to.be.true;
    });

    it('should emit if name is not valid', () => {
        const localMockMatch = {
            destructor: sinon.stub(),
            addPlayer: sinon.stub().throws(new Error('Name is not valid')),
            uniqueId: '0000',
        } as unknown as Match;
        matchManager['matches'].push(localMockMatch);
        matchManager.attemptJoinMatch(mockSocket, { code: '0000', name: 'test' });
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(emitSpy.called).to.be.true;
    });

    it('should emit if match is locked', () => {
        const localMockMatch = {
            destructor: sinon.stub(),
            addPlayer: sinon.stub().throws(new Error('Match is locked')),
            uniqueId: '0000',
        } as unknown as Match;
        matchManager['matches'].push(localMockMatch);
        matchManager.attemptJoinMatch(mockSocket, { code: '0000', name: 'test' });
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(emitSpy.called).to.be.true;
    });
});
