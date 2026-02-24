import { Match, Group, MatchParticipant, PairingHistory } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Record a new match outcome
 * @route   POST /api/groups/:groupId/matches
 * @access  Private (Group members)
 */
export const recordMatch = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { team1, team2, score, winnerTeam, participants } = req.body;

    if (!team1 || !team2 || !score || winnerTeam === undefined) {
        throw new AppError('Missing required match fields', 400);
    }

    // Check group access
    const group = await Group.findById(groupId);

    if (!group) {
        throw new AppError('Group not found', 404);
    }

    if (!group.hasAccess(req.userId)) {
        throw new AppError('Access denied', 403);
    }

    const match = await Match.create({
        groupId,
        team1,
        team2,
        score,
        winnerTeam
    });

    // 2. Insert Match Participants for stats tracking
    if (participants && participants.length > 0) {
        const participantDocs = participants.map(p => ({
            matchId: match._id,
            groupId,
            playerId: p.playerId,
            team: p.team,
            eloBefore: p.eloBefore,
            eloAfter: p.eloAfter,
            pointDifferential: p.pointDifferential || 0,
            isWinner: p.isWinner
        }));
        await MatchParticipant.insertMany(participantDocs);
    }

    // 3. Update Pairing History for relationships
    // Team 1 Pair
    if (team1.length === 2) {
        await updatePairingHistory(groupId, team1[0], team1[1], winnerTeam === 1, false);
    }
    // Team 2 Pair
    if (team2.length === 2) {
        await updatePairingHistory(groupId, team2[0], team2[1], winnerTeam === 2, false);
    }

    // Opponents (every player in team 1 versus every player in team 2)
    for (const p1 of team1) {
        for (const p2 of team2) {
            // Did p1 lose to p2?
            const p1Lost = winnerTeam === 2;
            const p2Lost = winnerTeam === 1;

            // We update the bidirectional relationship.
            await updatePairingHistoryOpponents(groupId, p1, p2, p1Lost, p2Lost);
        }
    }

    res.status(201).json({
        success: true,
        data: match
    });
});

/**
 * Helper to update teammate history
 */
async function updatePairingHistory(groupId, player1Id, player2Id, isWin) {
    const ids = [player1Id.toString(), player2Id.toString()].sort();

    await PairingHistory.findOneAndUpdate(
        { groupId, player1Id: ids[0], player2Id: ids[1] },
        {
            $inc: {
                timesPartnered: 1,
                winsTogether: isWin ? 1 : 0
            }
        },
        { upsert: true, new: true }
    );
}

/**
 * Helper to update opponent history
 */
async function updatePairingHistoryOpponents(groupId, player1Id, player2Id, p1Lost, p2Lost) {
    const ids = [player1Id.toString(), player2Id.toString()].sort();

    // If ids[0] is player1, then did ids[0] lose against ids[1]? That's p1Lost.
    // If ids[0] is player2, then did ids[0] lose against ids[1]? That's p2Lost.
    const isP1First = ids[0] === player1Id.toString();
    const lossesAgainstAcc = isP1First ? (p1Lost ? 1 : 0) : (p2Lost ? 1 : 0);
    // Actually, Toughest Opponent requires knowing WHO you lost to. 
    // Wait, the schema I made: timesOpposed, lossesAgainst. But wait!
    // A single PairingHistory document represents the relationship between P_A and P_B.
    // If P_A and P_B play against each other, one wins and one loses.
    // So "lossesAgainst" isn't symmetrical. If P_A loses to P_B, P_A has 1 loss against P_B. But P_B has 0 losses against P_A.
    // I should save this as p1LossesAgainstP2 and p2LossesAgainstP1.
    // Let me update the schema logic here:

    await PairingHistory.findOneAndUpdate(
        { groupId, player1Id: ids[0], player2Id: ids[1] },
        {
            $inc: {
                timesOpposed: 1,
                // We'll track symmetric directional stats if we need to, but actually
                // it is easier to just find the pairing and see overall wins/losses.
                // If ids[0] won, p1Wins = 1.
                [isP1First && !p1Lost || !isP1First && !p2Lost ? 'p1Wins' : 'p2Wins']: 1
            }
        },
        { upsert: true, new: true }
    );
}
