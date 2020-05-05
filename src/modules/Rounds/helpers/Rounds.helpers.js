// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

module.exports = {

  /**
   * get all the winner players of a round by winning order
   * @param {object} round
   * @param {boolean} winnerorderdescending
   */
  getWinnerplayersids(round, winnerorderdescending) {
    // get the match winners
    let winnerplayersids = [];
    let actualbestplayerssum = 0;
    if (round?.players != null) {
      let haspoints = false;
      round.players.forEach((player) => {
        if (!haspoints && round.points != null && round.points.length > 0) { haspoints = true; }
        const currentplayerpointsum = (round.points != null
          ? round.points
            .filter((point) => point.player?.id === player.id)
            .reduce((sum, current) => sum + current.point, 0)
          : 0);
        if (currentplayerpointsum === actualbestplayerssum) {
          winnerplayersids.push(player.id);
        } else if (winnerorderdescending && currentplayerpointsum > actualbestplayerssum) {
          actualbestplayerssum = currentplayerpointsum;
          winnerplayersids = [player.id];
        } else if (!winnerorderdescending && currentplayerpointsum < actualbestplayerssum) {
          actualbestplayerssum = currentplayerpointsum;
          winnerplayersids = [player.id];
        }
      });
      if (!haspoints) { winnerplayersids = []; }
    }
    return winnerplayersids;
  },

  /**
   * get the points for a specific player on a round
   * @param {object} round
   * @param {string} playerid
   */
  getPointsbyplayerid(round, playerid) {
    return (round.points != null
      ? round.points
        .filter((point) => point.player?.id === playerid)
        .reduce((sum, current) => sum + current.point, 0)
      : 0);
  }
};
