const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
let dbPath = path.join(__dirname, "cricketMatchDetails.db");
let database = null;
const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: dbPath, driver: sqlite3.Database });
  } catch (error) {
    console.log(`Database is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();
//API-1
app.get("/players/", async (request, response) => {
  const query = `select player_id as playerId, player_name as playerName from player_details;`;
  const queryResponse = await database.all(query);
  response.send(queryResponse);
});
//API-2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `select player_id as playerId, player_name as playerName from player_details where player_id=${playerId};`;
  const queryResponse = await database.get(query);
  response.send(queryResponse);
});
//API-4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query = `select match_id as matchId, match,year from match_details where match_id=${matchId};`;
  const queryResponse = await database.get(query);
  response.send(queryResponse);
});
//API-5
const convertDbObject = (each) => {
  return {
    matchId: each.match_id,
    match: each.match,
    year: each.year,
  };
};
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const matchQuery = `select * from player_match_score natural join match_details where player_id=${playerId};`;
  const matchQueryResponse = await database.all(matchQuery);
  response.send(matchQueryResponse.map((item) => convertDbObject(item)));
});
//API-6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playerQuery = `select player_details.player_id as playerId, player_details.player_name as playerName 
                        from player_match_score NATURAL JOIN player_details where match_id=${matchId};`;
  const playerQueryResponse = await database.all(playerQuery);
  response.send(playerQueryResponse);
});
//API-7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `select player_details.player_id as playerId, player_details.player_name as playerName,
                        sum(player_match_score.score) as totalScore, sum(fours) as totalFours, 
                        sum(sixes) as totalSixes from player_details inner JOIN player_match_score 
                        ON player_details.player_id = player_match_score.player_id 
                        where player_details.player_id=${playerId};`;
  const playerQueryResponse = await database.get(playerQuery);
  response.send(playerQueryResponse);
});
//API-3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const playerQuery = `update player_details set player_name = '${playerName}'
                         where player_id=${playerId};`;
  const queryResponse = await database.run(playerQuery);
  response.send("Player Details Updated");
});
module.exports = app;
