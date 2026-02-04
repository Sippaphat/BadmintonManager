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
      players: [] 
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
          if (c.id === courtId) return { ...c, players: [] };
          return c;
        });
        setPlayers(updatedPlayers);
        setCourts(updatedCourts);
    }
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
          {courts.map((court) => (
            <div key={court.id} className="courtCard">
              <div className="courtHeader">
                <span className="courtTitle">คอร์ด {court.id}</span>
                {court.players.length > 0 ? (
                  <div className="playingBadge">
                     <span className="playingText">กำลังแข่ง ⚡️</span>
                  </div>
                ) : (
                  <div className="freeBadge">
                     <span className="freeText">ว่าง</span>
                  </div>
                )}
              </div>

              {court.players.length === 4 ? (
                <div>
                  <div className="matchup">
                    <div className="team">
                      <span className="pName">{court.players[0].name}</span>
                      <span className="pName">{court.players[1].name}</span>
                    </div>
                    <span className="vs">VS</span>
                    <div className="team">
                      <span className="pName">{court.players[2].name}</span>
                      <span className="pName">{court.players[3].name}</span>
                    </div>
                  </div>
                  <button 
                    className="finishBtn" 
                    onClick={() => finishMatch(court.id)}
                  >
                    <span className="finishBtnText">🏁 จบเกม (เคลียร์สนาม)</span>
                  </button>
                </div>
              ) : (
                <button 
                  className="startMatchBtn" 
                  onClick={() => assignMatchToCourt(court.id)}
                >
                  <span className="startMatchBtnText">จัดตัวลงสนาม +</span>
                </button>
              )}
            </div>
          ))}

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
    </div>
  );
}
