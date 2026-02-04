import React, { useState } from 'react';
import './App.css';

// --- CONFIG & THEME ---
const COLORS = {
  primary: '#006400',
  accent: '#32CD32',
  bg: '#F2F2F2',
  card: '#FFFFFF',
  text: '#333333',
  red: '#D32F2F',
  blue: '#1976D2',
  gray: '#757575',
  lightGreen: '#E8F5E9'
};

export default function App() {
  // --- STATE: SETUP ---
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerInput, setPlayerInput] = useState('');
  const [numberOfCourts, setNumberOfCourts] = useState(2);
  
  // Players structure: { id, name, playCount, isPlaying }
  const [players, setPlayers] = useState([
    { id: '1', name: 'Player 1', playCount: 0, isPlaying: false },
    { id: '2', name: 'Player 2', playCount: 0, isPlaying: false },
    { id: '3', name: 'Player 3', playCount: 0, isPlaying: false },
    { id: '4', name: 'Player 4', playCount: 0, isPlaying: false },
    { id: '5', name: 'Player 5', playCount: 0, isPlaying: false },
    { id: '6', name: 'Player 6', playCount: 0, isPlaying: false },
    { id: '7', name: 'Player 7', playCount: 0, isPlaying: false },
    { id: '8', name: 'Player 8', playCount: 0, isPlaying: false },
  ]);

  const [courts, setCourts] = useState([]);

  // --- STATE: EDIT MODAL ---
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null); // เก็บ Object คนที่กำลังแก้
  const [tempName, setTempName] = useState(''); // เก็บชื่อชั่วคราวตอนพิมพ์แก้

  // --- STATE: COURT MODAL ---
  const [isCourtModalVisible, setCourtModalVisible] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState(null);

  // --- ACTIONS: SETUP ---
  const addPlayer = () => {
    if (!playerInput.trim()) return;
    const newPlayer = {
      id: Date.now().toString(),
      name: playerInput,
      playCount: 0,
      isPlaying: false
    };
    setPlayers([...players, newPlayer]);
    setPlayerInput('');
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // เปิด Modal แก้ไขชื่อ
  const openEditModal = (player) => {
    setEditingPlayer(player);
    setTempName(player.name);
    setEditModalVisible(true);
  };

  // บันทึกชื่อใหม่
  const savePlayerName = () => {
    if (tempName.trim() === '') {
      alert('ชื่อว่างเปล่า: กรุณาใส่ชื่อผู้เล่น');
      return;
    }
    
    // อัปเดตชื่อใน State Players
    const updatedPlayers = players.map(p => {
      if (p.id === editingPlayer.id) {
        return { ...p, name: tempName };
      }
      return p;
    });

    // อัปเดตชื่อใน Courts ด้วย (ถ้ากำลังเล่นอยู่)
    const updatedCourts = courts.map(c => {
      const updatedCourtPlayers = c.players.map(p => {
        if (p.id === editingPlayer.id) {
          return { ...p, name: tempName };
        }
        return p;
      });
      return { ...c, players: updatedCourtPlayers };
    });

    setPlayers(updatedPlayers);
    setCourts(updatedCourts);
    setEditModalVisible(false);
    setEditingPlayer(null);
  };

  const startGame = () => {
    if (players.length < 4) {
      alert('ผู้เล่นไม่พอ: ต้องมีอย่างน้อย 4 คนเพื่อเริ่มเกม');
      return;
    }
    const initCourts = Array.from({ length: numberOfCourts }, (_, i) => ({
      id: i + 1,
      players: [],
      score: { team1: 0, team2: 0 },
      serving: 'team1',
      servingPlayerIndex: { team1: 0, team2: 1 } // Team 1 (Top): Even->0, Team 2 (Bottom): Even->1
    }));
    setCourts(initCourts);
    setIsGameStarted(true);
  };

  const resetGame = () => {
    if (window.confirm('รีเซ็ตเกม? ข้อมูลจำนวนการเล่นจะหายไปทั้งหมด')) {
        setIsGameStarted(false);
        setPlayers(players.map(p => ({ ...p, playCount: 0, isPlaying: false })));
        setCourts([]);
    }
  };

  // --- ACTIONS: GAMEPLAY ---
  const assignMatchToCourt = (courtId) => {
    const availablePlayers = players.filter(p => !p.isPlaying);
    if (availablePlayers.length < 4) {
      alert('คนไม่พอ: รอเพื่อนคอร์ดอื่นเล่นจบก่อน หรือเพิ่มคน');
      return;
    }
    const sortedPlayers = [...availablePlayers].sort((a, b) => {
      if (a.playCount === b.playCount) return Math.random() - 0.5;
      return a.playCount - b.playCount; 
    });
    const selectedPlayers = sortedPlayers.slice(0, 4);
    const shuffledSelection = [...selectedPlayers].sort(() => Math.random() - 0.5);

    const updatedCourts = courts.map(c => {
      if (c.id === courtId) return { ...c, players: shuffledSelection };
      return c;
    });

    const selectedIds = new Set(selectedPlayers.map(p => p.id));
    const updatedPlayers = players.map(p => {
      if (selectedIds.has(p.id)) return { ...p, isPlaying: true, playCount: p.playCount + 1 };
      return p;
    });

    setCourts(updatedCourts);
    setPlayers(updatedPlayers);
  };

  const finishMatch = (courtId) => {
    if (window.confirm('จบเกม? ยืนยันเพื่อปล่อยคอร์ดว่างสำหรับคู่ต่อไป')) {
        const court = courts.find(c => c.id === courtId);
        const playerIdsInCourt = new Set(court.players.map(p => p.id));
        const updatedPlayers = players.map(p => {
          if (playerIdsInCourt.has(p.id)) return { ...p, isPlaying: false };
          return p;
        });
        const updatedCourts = courts.map(c => {
          if (c.id === courtId) return { ...c, players: [], score: { team1: 0, team2: 0 }, serving: 'team1', servingPlayerIndex: { team1: 0, team2: 1 } };
          return c;
        });
        setPlayers(updatedPlayers);
        setCourts(updatedCourts);
    }
  };

  // --- ACTIONS: CUSTOM COURT MANAGEMENT ---
  const openCourtModal = (courtId) => {
    setSelectedCourtId(courtId);
    setCourtModalVisible(true);
  };

  const addPlayerToCourt = (playerId) => {
    const court = courts.find(c => c.id === selectedCourtId);
    if (court.players.length >= 4) {
      alert('เต็มแล้ว: สนามนี้มีคนครบ 4 คนแล้ว');
      return;
    }

    const player = players.find(p => p.id === playerId);
    if (player.isPlaying) {
      alert('คนนี้เล่นอยู่: ' + player.name + ' กำลังเล่นในสนามอื่นอยู่');
      return;
    }

    // Add player to court
    const updatedCourts = courts.map(c => {
      if (c.id === selectedCourtId) {
        return { ...c, players: [...c.players, player] };
      }
      return c;
    });

    // Update player status
    const updatedPlayers = players.map(p => {
      if (p.id === playerId) {
        return { ...p, isPlaying: true, playCount: p.playCount + 1 };
      }
      return p;
    });

    setCourts(updatedCourts);
    setPlayers(updatedPlayers);
  };

  const removePlayerFromCourt = (playerId) => {
    const court = courts.find(c => c.id === selectedCourtId);
    
    // Remove player from court
    const updatedCourts = courts.map(c => {
      if (c.id === selectedCourtId) {
        return { ...c, players: c.players.filter(p => p.id !== playerId) };
      }
      return c;
    });

    // Update player status and reduce play count
    const updatedPlayers = players.map(p => {
      if (p.id === playerId) {
        return { ...p, isPlaying: false, playCount: Math.max(0, p.playCount - 1) };
      }
      return p;
    });

    setCourts(updatedCourts);
    setPlayers(updatedPlayers);
  };

  const closeCourtModal = () => {
    setCourtModalVisible(false);
    setSelectedCourtId(null);
  };

  const incrementScore = (courtId, team) => {
    const updatedCourts = courts.map(c => {
      if (c.id === courtId) {
        const newScore = { ...c.score };
        newScore[team] = newScore[team] + 1;
        
        let newPlayers = [...c.players];
        const newServingPlayerIndex = { ...c.servingPlayerIndex };
        
        // Determine correct serve position based on NEW score
        // Team 1 (Top): Even => Right (Viewer Left, Index 0), Odd => Left (Viewer Right, Index 1)
        // Team 2 (Bottom): Even => Right (Viewer Right, Index 1), Odd => Left (Viewer Left, Index 0)
        const isEvenScore = newScore[team] % 2 === 0;
        let correctServerIndex;
        if (team === 'team1') {
          correctServerIndex = isEvenScore ? 0 : 1;
        } else {
          correctServerIndex = isEvenScore ? 1 : 0;
        }
        
        const teamStartIdx = team === 'team1' ? 0 : 2;
        
        if (c.serving === team && c.players.length === 4) {
          // Same team scores consecutively
          // The SAME PLAYER continues serving but from OPPOSITE SIDE
          // So we always swap the two players
          const temp = newPlayers[teamStartIdx];
          newPlayers[teamStartIdx] = newPlayers[teamStartIdx + 1];
          newPlayers[teamStartIdx + 1] = temp;
          
          // After swap, the serving player is now at the opposite index
          // Update to match the score-based position
          newServingPlayerIndex[team] = correctServerIndex;
        } else if (c.players.length === 4) {
          // Serve changes to the scoring team
          // Set the serving player index based on score
          newServingPlayerIndex[team] = correctServerIndex;
        }
        
        return { ...c, score: newScore, serving: team, servingPlayerIndex: newServingPlayerIndex, players: newPlayers };
      }
      return c;
    });
    setCourts(updatedCourts);
  };

  const decrementScore = (courtId, team) => {
    const updatedCourts = courts.map(c => {
      if (c.id === courtId) {
        const newScore = { ...c.score };
        newScore[team] = Math.max(0, newScore[team] - 1);
        
        // Determine serve based on who would have scored last
        let serving = 'team1';
        if (newScore.team1 === 0 && newScore.team2 === 0) {
          serving = 'team1';
        } else if (newScore.team1 >= newScore.team2) {
          serving = 'team1';
        } else {
          serving = 'team2';
        }
        
        // Reset serving player index when going back
        const newServingPlayerIndex = { ...c.servingPlayerIndex };
        
        // Recalculate correct position for the serving team
        const isEvenScore = newScore[serving] % 2 === 0;
        let correctServerIndex;
        if (serving === 'team1') {
          correctServerIndex = isEvenScore ? 0 : 1;
        } else {
          correctServerIndex = isEvenScore ? 1 : 0;
        }
        newServingPlayerIndex[serving] = correctServerIndex;
        
        return { ...c, score: newScore, serving: serving, servingPlayerIndex: newServingPlayerIndex };
      }
      return c;
    });
    setCourts(updatedCourts);
  };

  const resetScore = () => {
    if (window.confirm('รีเซ็ตคะแนน?')) {
      const updatedCourts = courts.map(c => {
        if (c.id === selectedCourtId) {
          return { ...c, score: { team1: 0, team2: 0 }, serving: 'team1', servingPlayerIndex: { team1: 0, team2: 1 } };
        }
        return c;
      });
      setCourts(updatedCourts);
    }
  };

  const setServingPlayer = (courtId, team, playerIdx) => {
    const updatedCourts = courts.map(c => {
      if (c.id === courtId) {
        // Only allow changing serve at 0-0
        if (c.score.team1 === 0 && c.score.team2 === 0) {
          const newServingPlayerIndex = { ...c.servingPlayerIndex };
          newServingPlayerIndex[team] = playerIdx;
          return { ...c, serving: team, servingPlayerIndex: newServingPlayerIndex };
        }
      }
      return c;
    });
    setCourts(updatedCourts);
  };

  // --- RENDER HELPERS ---
  const renderSetup = () => (
    <div className="container">
      <div className="header">
        <h1 className="headerText">🏸 Badminton Manager</h1>
        <div className="subHeader">ตั้งค่าก่อนเริ่ม</div>
      </div>

      <div className="section">
        <label className="label">จำนวนคอร์ด:</label>
        <div className="courtSelector">
          {[1, 2, 3, 4].map(num => (
            <button 
              key={num} 
              className={`courtBtn ${numberOfCourts === num ? 'active' : ''}`}
              onClick={() => setNumberOfCourts(num)}
            >
              <span className={`courtBtnText ${numberOfCourts === num ? 'active' : ''}`}>{num}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <label className="label">รายชื่อผู้เล่น ({players.length} คน):</label>
        <div className="inputRow">
          <input 
            className="input" 
            placeholder="ชื่อผู้เล่น..." 
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
          />
          <button className="addBtn" onClick={addPlayer}>
            <span className="addBtnText">+ เพิ่ม</span>
          </button>
        </div>

        {players.map((p, index) => (
          <div key={p.id} className="playerRow">
            <span className="playerRowText">{index + 1}. {p.name}</span>
            <div className="rowActions">
              <button onClick={() => openEditModal(p)} className="iconBtn">
                <span className="editText">✏️ แก้ไข</span>
              </button>
              <button onClick={() => removePlayer(p.id)} className="iconBtn">
                <span className="removeText">🗑 ลบ</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 100 }}>
         <button className="mainBtn" onClick={startGame}>
          <span className="mainBtnText">🚀 เริ่มการจัดการ</span>
        </button>
      </div>
    </div>
  );

  const renderGame = () => {
    return (
      <div className="container">
        <div className="headerCompact">
          <h2 className="headerTextCompact">Badminton Manager</h2>
          <button onClick={resetGame} className="resetBtn">
            <span className="resetBtnText">ตั้งค่าใหม่</span>
          </button>
        </div>

        <div className="gameContent">
          {/* Courts Section */}
          <h3 className="sectionHeader">🏸 สนามแข่ง ({numberOfCourts})</h3>
          {courts.map((court) => {
            const team1Players = court.players.slice(0, 2);
            const team2Players = court.players.slice(2, 4);
            const hasPlayers = court.players.length > 0;

            return (
              <div key={court.id} className="courtCard">
                <div className="courtHeader">
                  <span className="courtTitle">คอร์ด {court.id}</span>
                  {hasPlayers ? (
                    <div className="playingBadge">
                       <span className="playingText">กำลังแข่ง ⚡️</span>
                    </div>
                  ) : (
                    <div className="freeBadge">
                       <span className="freeText">ว่าง</span>
                    </div>
                  )}
                </div>

                {hasPlayers ? (
                  <div>
                    {/* Scoreboard */}
                    <div className="scoreboardMain">
                      <div 
                        className={`scoreTeamMain ${court.score.team1 === 0 && court.score.team2 === 0 && court.players.length === 4 ? 'selectableTeam' : ''} ${court.serving === 'team1' && court.score.team1 === 0 && court.score.team2 === 0 ? 'selectedTeam' : ''}`}
                        onClick={() => {
                          if (court.score.team1 === 0 && court.score.team2 === 0 && court.players.length === 4) {
                            setServingPlayer(court.id, 'team1', 0);
                          }
                        }}
                      >
                        <div className="teamLabelMain">ทีม 1 {court.score.team1 === 0 && court.score.team2 === 0 && court.players.length === 4 && court.serving === 'team1' && <span>🏸</span>}</div>
                        <div className="scoreControlsMain">
                          <button className="scoreBtnMain" onClick={(e) => {
                            e.stopPropagation();
                            decrementScore(court.id, 'team1');
                          }}>−</button>
                          <div className="scoreDisplayMain">
                            {court.score.team1}
                          </div>
                          <button className="scoreBtnMain" onClick={(e) => {
                            e.stopPropagation();
                            incrementScore(court.id, 'team1');
                          }}>+</button>
                        </div>
                      </div>
                      <div className="scoreDividerMain">:</div>
                      <div 
                        className={`scoreTeamMain ${court.score.team1 === 0 && court.score.team2 === 0 && court.players.length === 4 ? 'selectableTeam' : ''} ${court.serving === 'team2' && court.score.team1 === 0 && court.score.team2 === 0 ? 'selectedTeam' : ''}`}
                        onClick={() => {
                          if (court.score.team1 === 0 && court.score.team2 === 0 && court.players.length === 4) {
                            setServingPlayer(court.id, 'team2', 1);
                          }
                        }}
                      >
                        <div className="teamLabelMain">ทีม 2 {court.score.team1 === 0 && court.score.team2 === 0 && court.players.length === 4 && court.serving === 'team2' && <span>🏸</span>}</div>
                        <div className="scoreControlsMain">
                          <button className="scoreBtnMain" onClick={(e) => {
                            e.stopPropagation();
                            decrementScore(court.id, 'team2');
                          }}>−</button>
                          <div className="scoreDisplayMain">
                            {court.score.team2}
                          </div>
                          <button className="scoreBtnMain" onClick={(e) => {
                            e.stopPropagation();
                            incrementScore(court.id, 'team2');
                          }}>+</button>
                        </div>
                      </div>
                    </div>

                    {/* Visual Court */}
                    <div className="badmintonCourtMain">
                      {/* Team 1 Side */}
                      <div className="courtSideMain team1Side">
                        <div className="playerPositionsMain">
                          {[0, 1].map((idx) => {
                            const player = team1Players[idx];
                            const isServing = court.serving === 'team1' && idx === court.servingPlayerIndex?.team1;
                            
                            return (
                              <div key={idx} className="playerSlotMain">
                                {player ? (
                                  <div className={`playerCardMain ${isServing ? 'serving' : ''}`}>
                                    <div className="playerIconMain">
                                      {isServing && <span className="serveIconOnPlayer">🏸</span>}
                                      👤
                                    </div>
                                    <div className="playerLabelMain">{player.name}</div>
                                  </div>
                                ) : (
                                  <div className="emptySlotMain">
                                    <div className="emptyIconMain">+</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Net */}
                      <div className="courtNetMain">
                        <div className="netLineMain"></div>
                        <div className="netLabelMain">NET</div>
                      </div>

                      {/* Team 2 Side */}
                      <div className="courtSideMain team2Side">
                        <div className="playerPositionsMain">
                          {[0, 1].map((idx) => {
                            const player = team2Players[idx];
                            const isServing = court.serving === 'team2' && idx === court.servingPlayerIndex?.team2;
                            
                            return (
                              <div key={idx} className="playerSlotMain">
                                {player ? (
                                  <div className={`playerCardMain ${isServing ? 'serving' : ''}`}>
                                    <div className="playerIconMain">
                                      {isServing && <span className="serveIconOnPlayer">🏸</span>}
                                      👤
                                    </div>
                                    <div className="playerLabelMain">{player.name}</div>
                                  </div>
                                ) : (
                                  <div className="emptySlotMain">
                                    <div className="emptyIconMain">+</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="courtActionsMain">
                      <button 
                        className="customBtnMain" 
                        onClick={() => openCourtModal(court.id)}
                      >
                        ⚙️ จัดคน
                      </button>
                      <button 
                        className="finishBtnMain" 
                        onClick={() => finishMatch(court.id)}
                      >
                        🏁 จบเกม
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="emptyCourtMessage">
                      <span className="emptyCourtIcon">🏸</span>
                      <span className="emptyCourtText">สนามว่าง - พร้อมเล่น</span>
                    </div>
                    <div className="courtButtonsRow">
                      <button 
                        className="startMatchBtn" 
                        onClick={() => assignMatchToCourt(court.id)}
                      >
                        <span className="startMatchBtnText">🎲 สุ่มคน</span>
                      </button>
                      <button 
                        className="customBtn" 
                        onClick={() => openCourtModal(court.id)}
                      >
                        <span className="customBtnText">⚙️ จัดคนเอง</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Player Stats Section */}
          <h3 className="sectionHeader">📊 สถิติ & คิว (กดที่ชื่อเพื่อแก้)</h3>
          <div className="statsCard">
            {players.sort((a,b) => a.playCount - b.playCount).map((p) => (
              <div key={p.id} className={`statRow ${p.isPlaying ? 'active' : ''}`}>
                <div 
                  className="statNameContainer"
                  onClick={() => openEditModal(p)}
                >
                   <div className="statusDot" style={{backgroundColor: p.isPlaying ? COLORS.accent : '#ddd'}} />
                   <span className={`statName ${p.isPlaying ? 'playing' : ''}`}>
                     {p.name} {p.isPlaying ? '(เล่นอยู่)' : ''}
                   </span>
                   <span className="tinyEdit"> ✎</span>
                </div>
                <span className="statCount">{p.playCount} เกม</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-root">
      {isGameStarted ? renderGame() : renderSetup()}

      {/* --- EDIT MODAL --- */}
      {isEditModalVisible && (
        <div className="modalOverlay">
          <div className="modalView">
            <h3 className="modalTitle">แก้ไขชื่อผู้เล่น</h3>
            <input
              className="modalInput"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              autoFocus={true}
              placeholder="ใส่ชื่อใหม่..."
            />
            <div className="modalActions">
              <button 
                className="modalBtn modalBtnCancel"
                onClick={() => setEditModalVisible(false)}
              >
                <span className="modalBtnTextCancel">ยกเลิก</span>
              </button>
              <button 
                className="modalBtn modalBtnSave"
                onClick={savePlayerName}
              >
                <span className="modalBtnTextSave">บันทึก</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- COURT MODAL --- */}
      {isCourtModalVisible && selectedCourtId && (() => {
        const currentCourt = courts.find(c => c.id === selectedCourtId);
        const courtPlayers = currentCourt?.players || [];
        const team1Players = courtPlayers.slice(0, 2);
        const team2Players = courtPlayers.slice(2, 4);
        const availablePlayers = players.filter(p => !p.isPlaying).sort((a, b) => a.playCount - b.playCount);

        return (
          <div className="modalOverlay" onClick={closeCourtModal}>
            <div className="courtModalView" onClick={(e) => e.stopPropagation()}>
              <div className="courtModalHeader">
                <h3 className="modalTitle">🏸 คอร์ด {selectedCourtId}</h3>
                <button className="closeModalBtn" onClick={closeCourtModal}>✕</button>
              </div>

              {/* Scoreboard */}
              <div className="scoreboard">
                <div className="scoreTeam">
                  <div className="teamLabel">ทีม 1</div>
                  <div className="scoreControls">
                    <button className="scoreBtn" onClick={() => decrementScore(selectedCourtId, 'team1')}>−</button>
                    <div className="scoreDisplay">
                      {currentCourt.score.team1}
                    </div>
                    <button className="scoreBtn" onClick={() => incrementScore(selectedCourtId, 'team1')}>+</button>
                  </div>
                </div>
                <div className="scoreDivider">:</div>
                <div className="scoreTeam">
                  <div className="teamLabel">ทีม 2</div>
                  <div className="scoreControls">
                    <button className="scoreBtn" onClick={() => decrementScore(selectedCourtId, 'team2')}>−</button>
                    <div className="scoreDisplay">
                      {currentCourt.score.team2}
                    </div>
                    <button className="scoreBtn" onClick={() => incrementScore(selectedCourtId, 'team2')}>+</button>
                  </div>
                </div>
              </div>

              {/* Score Reset Control */}
              <div className="gameControls">
                <button className="resetScoreBtn" onClick={resetScore} style={{ width: '100%' }}>
                  ↺ รีเซ็ตคะแนน
                </button>
              </div>

              {/* Badminton Court Visualization */}
              <div className="badmintonCourt">
                {/* Team 1 Side (Top) */}
                <div className="courtSide team1Side">
                  <div className="courtSideLabel">ทีม 1</div>
                  <div className="playerPositions">
                    {[0, 1].map((idx) => (
                      <div key={idx} className="playerSlot">
                        {team1Players[idx] ? (
                          <div className="playerCard">
                            <button 
                              className="removePlayerBtnSmall"
                              onClick={() => removePlayerFromCourt(team1Players[idx].id)}
                            >
                              ×
                            </button>
                            <div className="playerIcon">👤</div>
                            <div className="playerLabel">{team1Players[idx].name}</div>
                          </div>
                        ) : (
                          <div className="emptySlot">
                            <div className="emptyIcon">+</div>
                            <div className="emptyLabel">ว่าง</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Net */}
                <div className="courtNet">
                  <div className="netLine"></div>
                  <div className="netLabel">NET</div>
                </div>

                {/* Team 2 Side (Bottom) */}
                <div className="courtSide team2Side">
                  <div className="courtSideLabel">ทีม 2</div>
                  <div className="playerPositions">
                    {[0, 1].map((idx) => (
                      <div key={idx} className="playerSlot">
                        {team2Players[idx] ? (
                          <div className="playerCard">
                            <button 
                              className="removePlayerBtnSmall"
                              onClick={() => removePlayerFromCourt(team2Players[idx].id)}
                            >
                              ×
                            </button>
                            <div className="playerIcon">👤</div>
                            <div className="playerLabel">{team2Players[idx].name}</div>
                          </div>
                        ) : (
                          <div className="emptySlot">
                            <div className="emptyIcon">+</div>
                            <div className="emptyLabel">ว่าง</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Available Players Section */}
              {availablePlayers.length > 0 && (
                <div className="availableSection">
                  <h4 className="availableTitle">ผู้เล่นที่พร้อม ({availablePlayers.length})</h4>
                  <div className="availablePlayersList">
                    {availablePlayers.map((p) => (
                      <div key={p.id} className="availablePlayerItem">
                        <div className="availablePlayerInfo">
                          <span className="availablePlayerName">{p.name}</span>
                          <span className="availablePlayerCount">{p.playCount} เกม</span>
                        </div>
                        <button 
                          className="addPlayerBtn"
                          onClick={() => addPlayerToCourt(p.id)}
                          disabled={courtPlayers.length >= 4}
                        >
                          <span className="addPlayerText">+</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                className="modalBtn modalBtnSave"
                onClick={closeCourtModal}
                style={{ width: '100%', marginTop: '15px' }}
              >
                <span className="modalBtnTextSave">✓ เสร็จสิ้น</span>
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
