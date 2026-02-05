import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import './App.css';

// --- CONFIG & THEME ---
const THEMES = {
  light: {
    primary: '#006400',
    accent: '#32CD32',
    bg: '#F2F2F2',
    card: '#FFFFFF',
    text: '#333333',
    red: '#D32F2F',
    blue: '#1976D2',
    gray: '#757575',
    lightGreen: '#E8F5E9'
  },
  dark: {
    primary: '#66BB6A',
    accent: '#81C784',
    bg: '#121212',
    card: '#1E1E1E',
    text: '#E0E0E0',
    red: '#EF5350',
    blue: '#42A5F5',
    gray: '#BDBDBD',
    lightGreen: '#1B5E20'
  }
};

const TRANSLATIONS = {
  th: {
    appTitle: 'Badminton Manager',
    selectGroup: 'เลือกกลุ่มเพื่อนของคุณ',
    createGroup: 'สร้างกลุ่มใหม่',
    create: '+ สร้าง',
    setup: 'ตั้งค่าก่อนเริ่ม',
    courts: 'จำนวนคอร์ด:',
    target: 'เป้าหมายคะแนน:',
    playersList: 'รายชื่อผู้เล่น',
    addPlayerPlaceholder: 'ชื่อผู้เล่น...',
    add: '+ เพิ่ม',
    startGame: '🚀 เริ่มการจัดการ',
    gameTitle: 'สนามแข่ง',
    resetGame: 'ตั้งค่าใหม่',
    calcExpense: '💰 คิดเงิน',
    queue: 'คิว (เล่นน้อยไปมาก)',
    leaderboard: 'ตารางคะแนน (ชนะมากไปน้อย)',
    viewWinners: '⇄ ดูผู้ชนะ',
    viewQueue: '⇄ ดูคิวแข่ง',
    resetPlay: '↺ รีเซ็ตจำนวนเล่น (Play)',
    resetWin: '↺ รีเซ็ตจำนวนชนะ (Win)',
    resetAll: '↺ รีเซ็ตทั้งหมด (Play & Win)',
    confirmDelete: 'ลบผู้เล่นคนนี้?',
    confirmResetGame: 'ยกเลิกเกมปัจจุบัน? (สถิติการเล่นจะไม่ถูกลบ)',
    confirmResetStats: 'รีเซ็ตสถิติทั้งหมดในกลุ่มนี้?',
    confirmResetPlay: 'รีเซ็ตจำนวนเกมที่เล่น (Play Count) ของทุกคน?',
    confirmResetWin: 'รีเซ็ตจำนวนชนะ (Win Count) ของทุกคน?',
    notEnoughPlayers: 'คนไม่พอ: รอเพื่อนคอร์ดอื่นเล่นจบก่อน หรือเพิ่มคน',
    resting: '(มีคนพักอยู่)',
    courtFull: 'เต็มแล้ว: สนามนี้มีคนครบแล้ว',
    playerPlaying: 'คนนี้เล่นอยู่: ',
    resetScore: 'รีเซ็ตคะแนน?',
    finishGame: '🏁 จบเกม',
    team1Win: 'ทีม 1 ชนะ',
    team2Win: 'ทีม 2 ชนะ',
    draw: 'จบโดยไม่ระบุผู้ชนะ',
    cancel: 'ยกเลิก',
    save: 'บันทึก',
    editPlayer: 'แก้ไขชื่อผู้เล่น',
    changePhoto: 'เปลี่ยนรูป:',
    court: 'คอร์ด',
    playing: 'กำลังแข่ง ⚡️',
    free: 'ว่าง',
    manage: '⚙️ จัดคน',
    random: '🎲 สุ่มคน',
    manual: '⚙️ จัดคนเอง',
    emptyCourt: 'สนามว่าง - พร้อมเล่น',
    availablePlayers: 'ผู้เล่นที่พร้อม',
    finish: '✓ เสร็จสิ้น',
    expense: '💰 หารค่าใช้จ่าย',
    courtFee: 'ค่าคอร์ด (รวม)',
    shuttlePrice: 'ค่าลูก (ต่อลูก)',
    shuttleCount: 'จำนวนลูก',
    total: 'รวมทั้งหมด:',
    name: 'ชื่อ',
    payOwn: 'จ่ายเอง',
    amount: 'ยอดจ่าย',
    average: 'คนละ (เฉลี่ย):',
    onlyShared: '(เฉพาะคนที่ไม่ได้ระบุยอดจ่ายเอง)',
    gameMode: 'โหมดการเล่น:',
    modeDoubles: 'คู่ (2 vs 2)',
    modeSingles: 'เดี่ยว (1 vs 1)',
    theme: 'ธีม',
    language: 'ภาษา',
    nameEmpty: 'ชื่อว่างเปล่า: กรุณาใส่ชื่อผู้เล่น',
    addFailed: 'เพิ่มผู้เล่นไม่สำเร็จ',
    deleteFailed: 'ลบไม่สำเร็จ',
    updateFailed: 'อัปเดตไม่สำเร็จ',
    playerExists: 'มีผู้เล่นชื่อนี้แล้ว',
    resetSuccess: 'รีเซ็ตสำเร็จ',
    errorCreateGroup: 'สร้างกลุ่มไม่สำเร็จ',
    errorLoadGroup: 'โหลดข้อมูลกลุ่มไม่สำเร็จ',
    team1: 'ทีม 1',
    team2: 'ทีม 2',
    resetScoreBtn: '↺ รีเซ็ตคะแนน',
    emptySlot: 'ว่าง',
    finishGameCourt: '🏁 จบเกมคอร์ด',
    scoreDisplay: 'คะแนน:',
    noScore: 'ไม่ได้บันทึกคะแนน',
    currency: 'บาท',
    cancelAction: 'ยกเลิก',
    calendar: '📅 ปฏิทิน',
    addEvent: 'เพิ่มกิจกรรม',
    eventTitle: 'หัวข้อ',
    eventLocation: 'สถานที่',
    eventDesc: 'รายละเอียด',
    eventStart: 'เริ่ม (เวลา)',
    eventEnd: 'สิ้นสุด (เวลา)',
    addToCalendar: 'เพิ่มลงปฏิทินเครื่อง',
    googleCal: 'Google Calendar',
    outlookCal: 'Outlook',
    icsFile: 'ไฟล์ .ics (Apple/อื่น)',
    noEvents: 'ไม่มีกิจกรรมในวันนี้',
    confirmDeleteEvent: 'ลบกิจกรรมนี้?',
    shareGroup: '🔗 แชร์กลุ่ม',
    shareGroupDesc: 'ใส่ Email ของเพื่อนที่เคยใช้งานแอพนี้',
    share: 'แชร์',
    shareSuccess: 'แชร์กลุ่มสำเร็จ!',
    userNotFound: 'ไม่พบผู้ใช้ หรือผู้ใช้นี้เข้าถึงอยู่แล้ว',
    groupOwner: 'เจ้าของกลุ่ม:',
    sharedWith: 'แชร์กับ:'
  },
  en: {
    appTitle: 'Badminton Manager',
    selectGroup: 'Select Your Group',
    createGroup: 'Create New Group',
    create: '+ Create',
    setup: 'Setup',
    courts: 'Number of Courts:',
    target: 'Score Target:',
    playersList: 'Players List',
    addPlayerPlaceholder: 'Player Name...',
    add: '+ Add',
    startGame: '🚀 Start Game',
    gameTitle: 'Courts',
    resetGame: 'Reset Game',
    calcExpense: '💰 Expenses',
    queue: 'Queue (Least Played)',
    leaderboard: 'Leaderboard (Most Wins)',
    viewWinners: '⇄ View Winners',
    viewQueue: '⇄ View Queue',
    resetPlay: '↺ Reset Play Count',
    resetWin: '↺ Reset Win Count',
    resetAll: '↺ Reset All Stats',
    confirmDelete: 'Delete this player?',
    confirmResetGame: 'End current game? (Stats will be saved)',
    confirmResetStats: 'Reset all stats for this group?',
    confirmResetPlay: 'Reset Play Count for everyone?',
    confirmResetWin: 'Reset Win Count for everyone?',
    notEnoughPlayers: 'Not enough players: Wait for others or add more.',
    resting: '(Someone is resting)',
    courtFull: 'Full: This court already has enough players.',
    playerPlaying: 'Playing: ',
    resetScore: 'Reset score?',
    finishGame: '🏁 Finish Game',
    team1Win: 'Team 1 Wins',
    team2Win: 'Team 2 Wins',
    draw: 'End without winner',
    cancel: 'Cancel',
    save: 'Save',
    editPlayer: 'Edit Player',
    changePhoto: 'Change Photo:',
    court: 'Court',
    playing: 'Playing ⚡️',
    free: 'Free',
    manage: '⚙️ Manage',
    random: '🎲 Random',
    manual: '⚙️ Manual',
    emptyCourt: 'Court Free - Ready',
    availablePlayers: 'Available Players',
    finish: '✓ Done',
    expense: '💰 Expenses',
    courtFee: 'Court Fee (Total)',
    shuttlePrice: 'Shuttlecock Price',
    shuttleCount: 'Shuttlecock Count',
    total: 'Total:',
    name: 'Name',
    payOwn: 'Pay Own',
    amount: 'Amount',
    average: 'Per Person (Avg):',
    onlyShared: '(Excluding custom payments)',
    gameMode: 'Game Mode:',
    modeDoubles: 'Doubles (2 vs 2)',
    modeSingles: 'Singles (1 vs 1)',
    theme: 'Theme',
    language: 'Language',
    nameEmpty: 'Name Empty: Please enter player name',
    addFailed: 'Failed to add player',
    deleteFailed: 'Failed to delete',
    updateFailed: 'Failed to update',
    playerExists: 'Player with this name already exists',
    resetSuccess: 'Reset Successful',
    errorCreateGroup: 'Error creating group',
    errorLoadGroup: 'Error loading group details',
    team1: 'Team 1',
    team2: 'Team 2',
    resetScoreBtn: '↺ Reset Score',
    emptySlot: 'Empty',
    finishGameCourt: '🏁 Finish Match Court',
    scoreDisplay: 'Score:',
    noScore: 'No Score Recorded',
    currency: 'Baht',
    cancelAction: 'Cancel',
    calendar: '📅 Calendar',
    addEvent: 'Add Event',
    eventTitle: 'Title',
    eventLocation: 'Location',
    eventDesc: 'Description',
    eventStart: 'Start (Time)',
    eventEnd: 'End (Time)',
    addToCalendar: 'Add to System Calendar',
    googleCal: 'Google Calendar',
    outlookCal: 'Outlook',
    icsFile: '.ics File (Apple/Other)',
    noEvents: 'No events this day',
    confirmDeleteEvent: 'Delete this event?',
    shareGroup: '🔗 Share Group',
    shareGroupDesc: 'Enter email of a user who has used this app',
    share: 'Share',
    shareSuccess: 'Group shared successfully!',
    userNotFound: 'User not found or already access.',
    groupOwner: 'Owner:',
    sharedWith: 'Shared with:'
  },
};

const API_BASE = 'http://localhost:5000';

// --- ELO / WEIGHT LOGIC ---
function normBase(base, min=0, max=100) {
  const x = (base - min) / (max - min);
  return Math.max(0, Math.min(1, x));
}

function normElo(elo, min=1100, max=1900) {
  const x = (elo - min) / (max - min);
  return Math.max(0, Math.min(1, x));
}

function weights(gamesPlayed) {
  // 0 games: elo 10%
  // ~30 games: elo 100% (capped at 0.9 in user logic, so 90%)
  const wElo = Math.min(0.9, 0.1 + gamesPlayed / 30); 
  const wBase = 1 - wElo;
  return { wBase, wElo };
}

function compositeSkill(p) {
  const b = normBase(p.baseSkill !== undefined ? p.baseSkill : 50, 0, 100);
  const e = normElo(p.elo !== undefined ? p.elo : 1500, 1100, 1900);
  const { wBase, wElo } = weights(p.gamesPlayed || 0);
  return wBase * b + wElo * e; // 0..1
}

function expected(eloA, eloB) {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

function updateElo(elo, score, exp, K=24) {
  return elo + K * (score - exp);
}

function updateMatch(allPlayers, teamAIds, teamBIds, teamAWon) {
  const playersMap = {}; // Helper to find player by ID quickly
  allPlayers.forEach(p => playersMap[p.id] = p);

  const A = Array.from(teamAIds).map(id => playersMap[id]).filter(Boolean);
  const B = Array.from(teamBIds).map(id => playersMap[id]).filter(Boolean);
  
  if (A.length === 0 || B.length === 0) return {};

  const eloA = A.reduce((sum, p) => sum + (p.elo !== undefined ? p.elo : 1500), 0) / A.length;
  const eloB = B.reduce((sum, p) => sum + (p.elo !== undefined ? p.elo : 1500), 0) / B.length;

  const expA = expected(eloA, eloB);
  const expB = 1 - expA;

  const scoreA = teamAWon ? 1 : 0;
  const scoreB = 1 - scoreA;

  const KA = (p) => ((p.gamesPlayed || 0) < 10) ? 32 : 24;
  const KB = (p) => ((p.gamesPlayed || 0) < 10) ? 32 : 24;

  const updatedMap = {};
  for (const p of A) {
    updatedMap[p.id] = {
      ...p,
      elo: updateElo(p.elo !== undefined ? p.elo : 1500, scoreA, expA, KA(p)),
      gamesPlayed: (p.gamesPlayed || 0) + 1,
    };
  }
  for (const p of B) {
    updatedMap[p.id] = {
      ...p,
      elo: updateElo(p.elo !== undefined ? p.elo : 1500, scoreB, expB, KB(p)),
      gamesPlayed: (p.gamesPlayed || 0) + 1,
    };
  }
  return updatedMap;
}

export default function AppWithBackend() {
  // --- STATE: GLOBAL ---
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('th');
  const [gameMode, setGameMode] = useState('doubles'); // 'doubles' | 'singles'
  const [user, setUser] = useState(null); // Auth State

  const COLORS = THEMES[theme];
  const t = (key) => TRANSLATIONS[language][key] || key;
  
  // Handle Login
  const handleLoginSuccess = async (credentialResponse) => {
    try {
        const res = await fetch(`${API_BASE}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: credentialResponse.credential }),
        });
        const data = await res.json();
        if (data.user && data.token) {
            setUser(data.user);
            localStorage.setItem('bm_user', JSON.stringify(data.user));
            localStorage.setItem('bm_token', data.token);
        }
    } catch (err) {
        console.error('Login Failed', err);
    }
  };

  const handleLogout = () => {
      googleLogout();
      setUser(null);
      localStorage.removeItem('bm_user');
      localStorage.removeItem('bm_token');
      setSelectedGroup(null);
  };

  useEffect(() => {
    const root = document.documentElement;
    Object.keys(COLORS).forEach(key => {
      root.style.setProperty(`--${key}`, COLORS[key]);
    });
    
    // Check for existing session
    const storedUser = localStorage.getItem('bm_user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, [theme]);

  // --- STATE: GROUPS ---
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(true);

  // --- STATE: APP ---
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false); // Toggle Calendar View
  const [schedules, setSchedules] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [isEventModalVisible, setEventModalVisible] = useState(false);
  
  // Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEventStartTime, setNewEventStartTime] = useState('18:00');
  const [newEventEndTime, setNewEventEndTime] = useState('20:00');

  const [playerInput, setPlayerInput] = useState('');
  const [playerBaseSkill, setPlayerBaseSkill] = useState(50); // New state for Base Skill
  const [playerPhoto, setPlayerPhoto] = useState(null);
  const [numberOfCourts, setNumberOfCourts] = useState(2);
  
  // Players structure: { id, name, photo, playCount, isPlaying }
  const [players, setPlayers] = useState([]);
  const [courts, setCourts] = useState([]);

  // --- STATE: EDIT MODAL ---
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  // --- STATE: SHARE MODAL ---
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [tempName, setTempName] = useState('');
  const [tempBaseSkill, setTempBaseSkill] = useState(50);
  const [tempPhoto, setTempPhoto] = useState(null);

  // --- STATE: COURT MODAL ---
  const [isCourtModalVisible, setCourtModalVisible] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState(null);

  // --- STATE: FINISH MODAL & SETTINGS ---
  const [isFinishModalVisible, setFinishModalVisible] = useState(false);
  const [finishingCourtId, setFinishingCourtId] = useState(null);
  const [gameTarget, setGameTarget] = useState(21);
  const [sortMode, setSortMode] = useState('queue'); // 'queue' | 'leaderboard'

  // --- STATE: EXPENSE MODAL ---
  const [isExpenseModalVisible, setExpenseModalVisible] = useState(false);
  const [courtFee, setCourtFee] = useState('');
  const [shuttlecockPrice, setShuttlecockPrice] = useState('');
  const [shuttlecockCount, setShuttlecockCount] = useState('');
  const [fixedPlayerFees, setFixedPlayerFees] = useState({}); // { [playerId]: value }

  // --- EFFECTS ---
  useEffect(() => {
    if (user) {
        fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/groups?userId=${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareGroup = async () => {
      if (!shareEmail.trim()) return;
      try {
          const res = await fetch(`${API_BASE}/groups/${selectedGroup._id}/share`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: shareEmail })
          });
          const data = await res.json();
          if (res.ok) {
              alert(t('shareSuccess'));
              setShareEmail('');
              setShareModalVisible(false);
          } else {
              alert(data.error || t('userNotFound'));
          }
      } catch (err) {
          alert('Error sharing group');
      }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName, userId: user._id }),
      });
      if (res.ok) {
        const group = await res.json();
        setGroups([...groups, group]);
        setNewGroupName('');
      }
    } catch (error) {
      alert(t('errorCreateGroup'));
    }
  };

  const handleSelectGroup = async (group) => {
    try {
      const res = await fetch(`${API_BASE}/groups/${group._id}`);
      if (res.ok) {
        const data = await res.json();
        // Transform backend players to frontend state
        const loadedPlayers = data.players.map(p => ({
          id: p._id,
          name: p.name,
          photo: p.photo,
          playCount: p.playCount || 0,
          winCount: p.winCount || 0,
          baseSkill: p.baseSkill,
          elo: p.elo,
          gamesPlayed: p.gamesPlayed,
          isPlaying: false,
          isResting: false
        }));
        setPlayers(loadedPlayers);
        setSelectedGroup(data);
        fetchSchedules(data._id);
      }
    } catch (error) {
      alert(t('errorLoadGroup'));
    }
  };

  // --- ACTIONS: PLAYERS ---
  const addPlayer = async () => {
    if (!playerInput.trim()) return;
    if (!selectedGroup) return;

    try {
      const formData = new FormData();
      formData.append('name', playerInput);
      formData.append('baseSkill', playerBaseSkill); // Add baseSkill
      if (playerPhoto) {
        formData.append('photo', playerPhoto);
      }

      const res = await fetch(`${API_BASE}/groups/${selectedGroup._id}/players`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const newP = await res.json();
        const pObj = {
          id: newP._id,
          name: newP.name,
          photo: newP.photo,
          playCount: 0,
          winCount: 0,
          isPlaying: false,
          isResting: false,
          baseSkill: newP.baseSkill,
          elo: newP.elo,
          gamesPlayed: 0
        };
        setPlayers([...players, pObj]);
        setPlayerInput('');
        setPlayerPhoto(null);
        setPlayerBaseSkill(50); // Reset baseSkill
        // Reset file input manually if possible, or just let state handle it
        document.getElementById('photo-upload').value = '';
      }
    } catch (error) {
      console.error(error);
      alert(t('addFailed'));
    }
  };

  const removePlayer = async (id) => {
    if (window.confirm(t('confirmDelete'))) {
        try {
            const res = await fetch(`${API_BASE}/players/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPlayers(players.filter(p => p.id !== id));
            }
        } catch (error) {
            alert(t('deleteFailed'));
        }
    }
  };

  const openEditModal = (player) => {
    setEditingPlayer(player);
    setTempName(player.name);
    setTempBaseSkill(player.baseSkill !== undefined ? player.baseSkill : 50);
    setTempPhoto(null);
    setEditModalVisible(true);
  };

  const savePlayerName = async () => {
    if (tempName.trim() === '') {
      alert(t('nameEmpty'));
      return;
    }
    
    try {
        const formData = new FormData();
        formData.append('name', tempName);
        formData.append('baseSkill', tempBaseSkill);
        if (tempPhoto) {
            formData.append('photo', tempPhoto);
        }

        const res = await fetch(`${API_BASE}/players/${editingPlayer.id}`, {
            method: 'PUT',
            body: formData
        });

        if (res.ok) {
            const updatedP = await res.json();
            const newPhotoUrl = updatedP.photo;

            // Updated local state
            const updatedPlayers = players.map(p => {
              if (p.id === editingPlayer.id) {
                return { 
                    ...p, 
                    name: tempName, 
                    photo: newPhotoUrl || p.photo,
                    baseSkill: updatedP.baseSkill 
                };
              }
              return p;
            });

            // Update courts
            const updatedCourts = courts.map(c => {
              const updatedCourtPlayers = c.players.map(p => {
                if (p.id === editingPlayer.id) {
                  return { 
                      ...p, 
                      name: tempName, 
                      photo: newPhotoUrl || p.photo,
                      baseSkill: updatedP.baseSkill
                  };
                }
                return p;
              });
              return { ...c, players: updatedCourtPlayers };
            });

            setPlayers(updatedPlayers);
            setCourts(updatedCourts);
            setEditModalVisible(false);
            setEditingPlayer(null);
        }
    } catch (error) {
        alert(t('updateFailed'));
    }
  };

  // --- ACTIONS: GAME SETUP ---
  const startGame = () => {
    const minPlayers = gameMode === 'doubles' ? 4 : 2;
    if (players.length < minPlayers) {
      alert(`${t('notEnoughPlayers')}`);
      return;
    }
    const initCourts = Array.from({ length: numberOfCourts }, (_, i) => ({
      id: i + 1,
      players: [],
      score: { team1: 0, team2: 0 },
      serving: 'team1',
      servingPlayerIndex: { team1: 0, team2: gameMode === 'doubles' ? 1 : 0 },
      mode: gameMode
    }));
    setCourts(initCourts);
    setIsGameStarted(true);
  };

  const resetGame = () => {
    if (window.confirm(t('confirmResetGame'))) {
        setIsGameStarted(false);
        setPlayers(players.map(p => ({ ...p, isPlaying: false })));
        setCourts([]);
    }
  };
  
  const resetStats = async () => {
      if (window.confirm(t('confirmResetStats'))) {
          // In a real app, I'd have a batch update endpoint
          // For now, I'll just update local state and maybe reload
          // Or iterate (not efficient but checking requirements)
          // Let's just reset local state for simplicity as requested "save every things... no need to refill".
          // But stats should probably persist? I'll assume stats persist.
          // I will implement a loop to reset all for now.
          const promises = players.map(p => fetch(`${API_BASE}/players/${p.id}/reset`, { method: 'PUT' }));
          await Promise.all(promises);
          
          setPlayers(players.map(p => ({ ...p, playCount: 0, winCount: 0, isPlaying: false, isResting: false })));
      }
  }

  const resetPlayCounts = async () => {
      if (window.confirm(t('confirmResetPlay'))) {
          const promises = players.map(p => fetch(`${API_BASE}/players/${p.id}/stats`, { 
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ playCount: 0 })
          }));
          await Promise.all(promises);
          
          setPlayers(players.map(p => ({ ...p, playCount: 0 })));
      }
  }

  const resetWinCounts = async () => {
      if (window.confirm(t('confirmResetWin'))) {
          const promises = players.map(p => fetch(`${API_BASE}/players/${p.id}/stats`, { 
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ winCount: 0 })
          }));
          await Promise.all(promises);
          
          setPlayers(players.map(p => ({ ...p, winCount: 0 })));
      }
  }

  // --- ACTIONS: SCHEDULES & CALENDAR ---
  const fetchSchedules = async (groupId) => {
      try {
          const query = groupId ? `?groupId=${groupId}` : '';
          const res = await fetch(`${API_BASE}/schedules${query}`);
          if (res.ok) {
              const data = await res.json();
              setSchedules(data);
          }
      } catch (err) {
          console.error("Fetch schedules error", err);
      }
  };

  const handleAddSchedule = async () => {
    if (!selectedGroup) return;
    const startDateTime = new Date(`${newEventDate}T${newEventStartTime}`);
    const endDateTime = new Date(`${newEventDate}T${newEventEndTime}`);

    try {
        const res = await fetch(`${API_BASE}/schedules`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                groupId: selectedGroup._id,
                title: newEventTitle,
                start: startDateTime,
                end: endDateTime,
                location: newEventLocation,
                description: newEventDesc
            })
        });
        if (res.ok) {
            const newItem = await res.json();
            setSchedules([...schedules, newItem]);
            setEventModalVisible(false);
            // Reset form
            setNewEventTitle('');
            setNewEventLocation('');
            setNewEventDesc('');
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleDeleteSchedule = async (id) => {
      if(!window.confirm(t('confirmDeleteEvent'))) return;
      try {
          const res = await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });
          if (res.ok) {
              setSchedules(schedules.filter(s => s._id !== id));
          }
      } catch (err) {
          console.error(err);
      }
  };

  // Calendar Integration Helpers
  const generateGoogleCalendarLink = (event) => {
      const start = new Date(event.start).toISOString().replace(/-|:|\.\d\d\d/g, "");
      const end = new Date(event.end).toISOString().replace(/-|:|\.\d\d\d/g, "");
      const details = encodeURIComponent(event.description || "");
      const location = encodeURIComponent(event.location || "");
      const title = encodeURIComponent(event.title);
      return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };
  
  const generateOutlookCalendarLink = (event) => {
    const start = new Date(event.start).toISOString();
    const end = new Date(event.end).toISOString();
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || "");
    const location = encodeURIComponent(event.location || "");
    return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${start}&enddt=${end}&subject=${title}&body=${details}&location=${location}`;
  };

  const downloadICSFile = (event) => {
    const start = new Date(event.start).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(event.end).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const now = new Date().toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BadmintonManager//EN
BEGIN:VEVENT
UID:${event._id}@badmintonmanager.com
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ACTIONS: GAMEPLAY ---
  const assignMatchToCourt = (courtId) => {
    const availablePlayers = players.filter(p => !p.isPlaying && !p.isResting);
    const requiredPlayers = gameMode === 'doubles' ? 4 : 2;

    if (availablePlayers.length < requiredPlayers) {
      alert(t('notEnoughPlayers') + (players.some(p => p.isResting && !p.isPlaying) ? ' ' + t('resting') : ''));
      return;
    }
    // Randomization logic with weights
    const sortedPlayers = [...availablePlayers].sort((a, b) => {
      if (a.playCount === b.playCount) return Math.random() - 0.5;
      return a.playCount - b.playCount; 
    });
    const selectedPlayers = sortedPlayers.slice(0, requiredPlayers);
    
    let finalSelection = selectedPlayers;
    
    // Smart Pairing for Doubles
    if (gameMode === 'doubles' && selectedPlayers.length === 4) {
        const combinations = [
            [[0, 1], [2, 3]], // (0,1) vs (2,3)
            [[0, 2], [1, 3]], // (0,2) vs (1,3)
            [[0, 3], [1, 2]]  // (0,3) vs (1,2)
        ];
        
        let bestDiff = Infinity;
        let bestCombo = combinations[0];
        
        combinations.forEach(combo => {
            const p1 = selectedPlayers[combo[0][0]];
            const p2 = selectedPlayers[combo[0][1]];
            const p3 = selectedPlayers[combo[1][0]];
            const p4 = selectedPlayers[combo[1][1]];
            
            const skillA = compositeSkill(p1) + compositeSkill(p2);
            const skillB = compositeSkill(p3) + compositeSkill(p4);
            
            const diff = Math.abs(skillA - skillB);
            
            if (diff < bestDiff) {
                bestDiff = diff;
                bestCombo = combo;
            }
        });
        
         finalSelection = [
            selectedPlayers[bestCombo[0][0]], 
            selectedPlayers[bestCombo[0][1]], 
            selectedPlayers[bestCombo[1][0]], 
            selectedPlayers[bestCombo[1][1]]
        ];
    } else {
         finalSelection = [...selectedPlayers].sort(() => Math.random() - 0.5);
    }

    const updatedCourts = courts.map(c => {
      if (c.id === courtId) return { ...c, players: finalSelection };
      return c;
    });

    const selectedIds = new Set(finalSelection.map(p => p.id));
    const updatedPlayers = players.map(p => {
      if (selectedIds.has(p.id)) return { ...p, isPlaying: true, playCount: p.playCount + 1 };
      return p;
    });

    // Sync play count
    finalSelection.forEach(p => {
        fetch(`${API_BASE}/players/${p.id}/stats`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                playCount: p.playCount + 1
            })
        });
    });

    setCourts(updatedCourts);
    setPlayers(updatedPlayers);
  };

  const finishMatch = (courtId) => {
      setFinishingCourtId(courtId);
      setFinishModalVisible(true);
  };

  const handleConfirmFinish = async (winnerTeam) => {
    // winnerTeam: 'team1', 'team2', or null
    const court = courts.find(c => c.id === finishingCourtId);
    if (!court) return;

    // Determine teams based on mode
    let team1Ids, team2Ids;
    if (gameMode === 'singles') {
        // Safe access in case players array is messed up, though it shouldn't be
        team1Ids = new Set([court.players[0]?.id].filter(Boolean));
        team2Ids = new Set([court.players[1]?.id].filter(Boolean));
    } else {
        team1Ids = new Set(court.players.slice(0, 2).map(p => p.id));
        team2Ids = new Set(court.players.slice(2, 4).map(p => p.id));
    }

    // Calculate ELO updates if there is a winner
    let eloUpdates = {};
    if (winnerTeam) {
        eloUpdates = updateMatch(
            players, 
            team1Ids, 
            team2Ids, 
            winnerTeam === 'team1'
        );
    }
    
    // Update players
    const updatedPlayers = players.map(p => {
        let newP = { ...p };
        let changed = false;

        // Apply ELO updates locally
        if (eloUpdates[p.id]) {
            newP.elo = eloUpdates[p.id].elo;
            newP.gamesPlayed = eloUpdates[p.id].gamesPlayed;
            changed = true;
        }

        if (team1Ids.has(p.id) || team2Ids.has(p.id)) {
             let newWinCount = p.winCount || 0;
             if (winnerTeam === 'team1' && team1Ids.has(p.id)) newWinCount++;
             if (winnerTeam === 'team2' && team2Ids.has(p.id)) newWinCount++;
             
             newP.winCount = newWinCount;
             newP.isPlaying = false;
             changed = true;

             // Sync Stats
            const statsBody = { winCount: newWinCount };
            if (eloUpdates[p.id]) {
                statsBody.elo = newP.elo;
                statsBody.gamesPlayed = newP.gamesPlayed;
            }

            if (winnerTeam) {
                 fetch(`${API_BASE}/players/${p.id}/stats`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(statsBody)
                });
            }
        }
        return newP;
    });

    const updatedCourts = courts.map(c => {
        if (c.id === finishingCourtId) return { ...c, players: [], score: { team1: 0, team2: 0 }, serving: 'team1', servingPlayerIndex: { team1: 0, team2: gameMode === 'doubles' ? 1 : 0 } };
        return c;
    });
    
    setPlayers(updatedPlayers);
    setCourts(updatedCourts);
    setFinishModalVisible(false);
    setFinishingCourtId(null);
  };

  // --- ACTIONS: CUSTOM COURT MANAGEMENT ---
  const openCourtModal = (courtId) => {
    setSelectedCourtId(courtId);
    setCourtModalVisible(true);
  };

  const addPlayerToCourt = (playerId) => {
    const court = courts.find(c => c.id === selectedCourtId);
    const maxPlayers = gameMode === 'doubles' ? 4 : 2;
    if (court.players.length >= maxPlayers) {
      alert(t('courtFull'));
      return;
    }

    const player = players.find(p => p.id === playerId);
    if (player.isPlaying) {
      alert(t('playerPlaying') + player.name);
      return;
    }

    const updatedCourts = courts.map(c => {
      if (c.id === selectedCourtId) {
        return { ...c, players: [...c.players, player] };
      }
      return c;
    });

    const updatedPlayers = players.map(p => {
      if (p.id === playerId) {
        // Sync playCount
        fetch(`${API_BASE}/players/${p.id}/stats`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ playCount: p.playCount + 1 })
        });
        return { ...p, isPlaying: true, playCount: p.playCount + 1 };
      }
      return p;
    });

    setCourts(updatedCourts);
    setPlayers(updatedPlayers);
  };

  const removePlayerFromCourt = (playerId) => {
    const updatedCourts = courts.map(c => {
      if (c.id === selectedCourtId) {
        return { ...c, players: c.players.filter(p => p.id !== playerId) };
      }
      return c;
    });

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
        const requiredPlayers = gameMode === 'doubles' ? 4 : 2;
        const isDoubles = gameMode === 'doubles';
        
        const isEvenScore = newScore[team] % 2 === 0;
        let correctServerIndex = 0;
        if (isDoubles) {
            if (team === 'team1') correctServerIndex = isEvenScore ? 0 : 1;
            else correctServerIndex = isEvenScore ? 1 : 0;
        }
        
        const teamStartIdx = team === 'team1' ? 0 : 2;
        
        if (isDoubles && c.serving === team && c.players.length === requiredPlayers) {
          const temp = newPlayers[teamStartIdx];
          newPlayers[teamStartIdx] = newPlayers[teamStartIdx + 1];
          newPlayers[teamStartIdx + 1] = temp;
          newServingPlayerIndex[team] = correctServerIndex;
        } else if (c.players.length === requiredPlayers) {
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
        
        let serving = 'team1';
        if (newScore.team1 === 0 && newScore.team2 === 0) {
          serving = 'team1';
        } else if (newScore.team1 >= newScore.team2) {
          serving = 'team1';
        } else {
          serving = 'team2';
        }
        
        const newServingPlayerIndex = { ...c.servingPlayerIndex };
        const isDoubles = gameMode === 'doubles';
        
        const isEvenScore = newScore[serving] % 2 === 0;
        let correctServerIndex = 0;
        if (isDoubles) {
            if (serving === 'team1') correctServerIndex = isEvenScore ? 0 : 1;
            else correctServerIndex = isEvenScore ? 1 : 0;
        }
        newServingPlayerIndex[serving] = correctServerIndex;
        
        return { ...c, score: newScore, serving: serving, servingPlayerIndex: newServingPlayerIndex, players: c.players };
      }
      return c;
    });
    setCourts(updatedCourts);
  };

  const resetScore = () => {
    if (window.confirm(t('resetScore'))) {
      const updatedCourts = courts.map(c => {
        if (c.id === selectedCourtId) {
          return { ...c, score: { team1: 0, team2: 0 }, serving: 'team1', servingPlayerIndex: { team1: 0, team2: gameMode === 'doubles' ? 1 : 0 } };
        }
        return c;
      });
      setCourts(updatedCourts);
    }
  };

  const setServingPlayer = (courtId, team, playerIdx) => {
    const updatedCourts = courts.map(c => {
      if (c.id === courtId) {
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
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-US', { month: 'long', year: 'numeric' }).format(currentDate);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} style={{ height: 80, backgroundColor: '#f9f9f9', border: '1px solid #eee' }}></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dayStr = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${dayStr}`;

        const daysEvents = schedules.filter(s => {
             const sDate = s.start ? new Date(s.start).toISOString().slice(0, 10) : '';
             return sDate === dateStr;
        });

        days.push(
            <div 
                key={d} 
                onClick={() => {
                    if (selectedGroup) {
                        setNewEventDate(dateStr);
                        setEventModalVisible(true);
                    }
                }}
                style={{ height: 80, border: '1px solid #eee', padding: 4, cursor: selectedGroup ? 'pointer' : 'default', backgroundColor: 'white', overflow: 'hidden', position: 'relative' }}
            >
                <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 2, color: '#333' }}>{d}</div>
                {daysEvents.map((ev, idx) => (
                    <div key={idx} style={{ fontSize: 9, backgroundColor: COLORS.lightGreen, color: COLORS.primary, padding: '1px 2px', borderRadius: 2, marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ev.title}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="container" style={{ minHeight: '100vh', paddingBottom: 80 }}>
            <div className="courtHeader">
                <button onClick={() => setShowCalendar(false)} className="resetBtn">{t('cancelAction')}</button>
                <h2 style={{ fontSize: 18, margin: 0, color: COLORS.primary }}>{t('calendar')}</h2>
                <div style={{ width: 50 }}></div> 
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, backgroundColor: COLORS.card, padding: 10, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: COLORS.text }}>◀</button>
                <span style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}>{monthName}</span>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: COLORS.text }}>▶</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, backgroundColor: '#ddd', border: '1px solid #ddd' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{ textAlign: 'center', fontSize: 12, fontWeight: 'bold', padding: 5, backgroundColor: '#f0f0f0', color: '#555' }}>{day}</div>
                ))}
                {days}
            </div>

            <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                     <h3 style={{ fontSize: 16, margin: 0, color: COLORS.text }}>{t('calendar')} List</h3>
                     {selectedGroup && (
                        <button onClick={() => setEventModalVisible(true)} className="addBtn" style={{ padding: '8px 12px', fontSize: 14 }}>{t('addEvent')}</button>
                     )}
                </div>
                
                {schedules.map(ev => {
                    const evDate = new Date(ev.start);
                    // Show all events or just for this month? showing this month logic
                   if (evDate.getMonth() !== month || evDate.getFullYear() !== year) return null;

                    return (
                        <div key={ev._id} style={{ backgroundColor: COLORS.card, padding: 10, borderRadius: 8, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 5, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${COLORS.primary}` }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontWeight: 'bold', color: COLORS.primary, fontSize: 16 }}>{ev.title}</span>
                                 <button onClick={() => handleDeleteSchedule(ev._id)} style={{ border: 'none', background: 'none', color: COLORS.red, cursor: 'pointer' }}>✕</button>
                             </div>
                             <div style={{ fontSize: 14, color: COLORS.text }}>📅 {evDate.toLocaleDateString()} • {evDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(ev.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                             {ev.location && <div style={{ fontSize: 14, color: COLORS.gray }}>📍 {ev.location}</div>}
                             {ev.description && <div style={{ fontSize: 12, color: COLORS.gray, fontStyle: 'italic' }}>"{ev.description}"</div>}
                             
                             <div style={{ display: 'flex', gap: 10, marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }}>
                                 <span style={{ fontSize: 12, color: '#888', alignSelf: 'center' }}>Add to:</span>
                                 <a href={generateGoogleCalendarLink(ev)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: COLORS.blue, textDecoration: 'none', fontWeight: 'bold' }}>Google</a>
                                 <a href={generateOutlookCalendarLink(ev)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: COLORS.blue, textDecoration: 'none', fontWeight: 'bold' }}>Outlook</a>
                                 <span onClick={() => downloadICSFile(ev)} style={{ fontSize: 12, color: COLORS.blue, textDecoration: 'none', cursor: 'pointer', fontWeight: 'bold' }}>ICS (Apple)</span>
                             </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderGroupSelection = () => (
      <div className="container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 10 }}>
            <button 
                onClick={() => {
                    fetchSchedules(); // Fetch all schedules
                    setShowCalendar(true);
                }}
                style={{ padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: COLORS.blue, color: 'white' }}
            >
                📅
            </button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ padding: '8px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', backgroundColor: COLORS.bg, color: COLORS.text }}>
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={() => setLanguage(language === 'th' ? 'en' : 'th')} style={{ padding: '8px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', backgroundColor: COLORS.bg, color: COLORS.text }}>
                {language === 'th' ? 'EN' : 'TH'}
            </button>
            <button onClick={handleLogout} style={{ padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: COLORS.red, color: 'white', fontWeight: 'bold' }}>
                Logout
            </button>
          </div>

          <div className="header">
            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                {user.picture && <img src={user.picture} alt="" style={{ width: 40, height: 40, borderRadius: 20 }} />}
                <span style={{ fontSize: 14, color: COLORS.text }}>{user.name}</span>
            </div>
            <h1 className="headerText">🏸 {t('appTitle')}</h1>
            <div className="subHeader">{t('selectGroup')}</div>
          </div>

          <div style={{ width: '100%', maxWidth: 400 }}>
             {/* List Groups */}
             {groups.map(group => (
                 <button 
                    key={group._id} 
                    className="mainBtn" 
                    style={{ backgroundColor: COLORS.card, border: '1px solid #ddd', marginBottom: 10, color: COLORS.text }}
                    onClick={() => handleSelectGroup(group)}
                >
                    <span className="mainBtnText" style={{ color: COLORS.primary }}>{group.name}</span>
                 </button>
             ))}

             <div className="section" style={{ marginTop: 20 }}>
                <label className="label">{t('createGroup')}</label>
                <div className="inputRow">
                    <input 
                        className="input" 
                        placeholder={t('createGroup')}
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <button className="addBtn" onClick={handleCreateGroup}>
                        <span className="addBtnText">{t('create')}</span>
                    </button>
                </div>
             </div>
          </div>
      </div>
  );

  const renderSetup = () => (
    <div className="container">
      <div className="header">
        <button onClick={() => setSelectedGroup(null)} style={{ position: 'absolute', left: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: COLORS.text }}>
            ← 
        </button>
        <h1 className="headerText">🏸 {selectedGroup.name}</h1>
        <div className="subHeader">{t('setup')}</div>
      </div>

      <div className="section">
         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', backgroundColor: COLORS.bg, color: COLORS.text, marginRight: 8 }}>
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <button onClick={() => setLanguage(language === 'th' ? 'en' : 'th')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', backgroundColor: COLORS.bg, color: COLORS.text }}>
                    {language === 'th' ? 'EN' : 'TH'}
                </button>
            </div>
            <button onClick={() => setShowCalendar(true)} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: COLORS.blue, color: 'white', fontWeight: 'bold' }}>
                {t('calendar')} 📅
            </button>
            <button onClick={() => setShareModalVisible(true)} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: COLORS.accent, color: 'white', marginLeft: 8, fontWeight: 'bold' }}>
                {t('share')} 🔗
            </button>
        </div>

        <label className="label">{t('gameMode')}</label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button 
                onClick={() => setGameMode('doubles')}
                style={{ 
                    flex: 1, padding: 10, borderRadius: 8, cursor: 'pointer', border: 'none',
                    backgroundColor: gameMode === 'doubles' ? COLORS.primary : '#eee',
                    color: gameMode === 'doubles' ? 'white' : '#666', fontWeight: 'bold'
                }}
            >
                {t('modeDoubles')}
            </button>
            <button 
                onClick={() => setGameMode('singles')}
                style={{ 
                    flex: 1, padding: 10, borderRadius: 8, cursor: 'pointer', border: 'none',
                    backgroundColor: gameMode === 'singles' ? COLORS.primary : '#eee',
                    color: gameMode === 'singles' ? 'white' : '#666', fontWeight: 'bold'
                }}
            >
                {t('modeSingles')}
            </button>
        </div>

        <label className="label">{t('courts')}</label>
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
        
        <label className="label" style={{ marginTop: 20 }}>{t('target')}</label>
        <div className="courtSelector">
             {[11, 21].map(num => (
                <button 
                  key={num} 
                  className={`courtBtn ${gameTarget === num ? 'active' : ''}`}
                  onClick={() => setGameTarget(num)}
                  style={{ width: 80, borderRadius: 10 }}
                >
                  <span className={`courtBtnText ${gameTarget === num ? 'active' : ''}`}>{num}</span>
                </button>
             ))}
        </div>
      </div>

      <div className="section">
        <label className="label">{t('playersList')} ({players.length}):</label>
        <div className="inputRow">
          <input 
            className="input" 
            placeholder={t('addPlayerPlaceholder')}
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
          />
           <input 
            className="input" 
            type="number"
            min="0" max="100"
            placeholder="Skill"
            title="Base Skill (0-100)"
            value={playerBaseSkill}
            onChange={(e) => setPlayerBaseSkill(e.target.value)}
            style={{ width: 60, flex: 'none', marginRight: 10 }}
          />
          <input 
            type="file" 
            id="photo-upload"
            onChange={(e) => setPlayerPhoto(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <label htmlFor="photo-upload" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              padding: '0 10px', backgroundColor: '#e0e0e0', borderRadius: 8, marginRight: 10, cursor: 'pointer',
              border: playerPhoto ? '2px solid #32CD32' : '1px solid #ddd'
            }}>
            {playerPhoto ? '📷' : '📷'}
          </label>

          <button className="addBtn" onClick={addPlayer}>
            <span className="addBtnText">{t('add')}</span>
          </button>
        </div>

        {players.map((p, index) => (
          <div key={p.id} className="playerRow">
            <span className="playerRowText" style={{ display: 'flex', alignItems: 'center' }}>
                {p.photo && <img src={p.photo} alt="" style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8, objectFit: 'cover' }} />}
                {index + 1}. {p.name}
            </span>
            <div className="rowActions">
              <button onClick={() => openEditModal(p)} className="iconBtn">
                <span className="editText">✏️ {t('editPlayer').split(' ')[0]}</span>
              </button>
              <button onClick={() => removePlayer(p.id)} className="iconBtn">
                <span className="removeText">🗑</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ height: 100 }}>
         <button className="mainBtn" onClick={startGame}>
          <span className="mainBtnText">{t('startGame')}</span>
        </button>
      </div>
    </div>
  );

  const renderGame = () => {
    return (
      <div className="container">
        <div className="headerCompact">
          <h2 className="headerTextCompact">{selectedGroup.name}</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setExpenseModalVisible(true)} className="resetBtn" style={{ borderColor: COLORS.primary, backgroundColor: COLORS.lightGreen }}>
               <span className="resetBtnText" style={{ color: COLORS.primary }}>{t('calcExpense')}</span>
            </button>
            <button onClick={resetGame} className="resetBtn" style={{ borderColor: COLORS.red }}>
               <span className="resetBtnText" style={{ color: COLORS.red }}>{t('resetGame')}</span>
            </button>
          </div>
        </div>

        <div className="gameContent">
          {/* Courts Section */}
          <h3 className="sectionHeader">🏸 {t('gameTitle')} ({numberOfCourts}) — {t('target').replace(':', '')} {gameTarget}</h3>
          {courts.map((court) => {
            let team1Players, team2Players;
            if (gameMode === 'singles') {
                team1Players = [court.players[0]].filter(Boolean);
                team2Players = [court.players[1]].filter(Boolean);
            } else {
                team1Players = court.players.slice(0, 2);
                team2Players = court.players.slice(2, 4);
            }
            
            const hasPlayers = court.players.length > 0;
            const requiredPlayers = gameMode === 'doubles' ? 4 : 2;
            const isFull = court.players.length === requiredPlayers;

            return (
              <div key={court.id} className="courtCard">
                <div className="courtHeader">
                  <span className="courtTitle">{t('court')} {court.id}</span>
                  {hasPlayers ? (
                    <div className="playingBadge">
                       <span className="playingText">{t('playing')}</span>
                    </div>
                  ) : (
                    <div className="freeBadge">
                       <span className="freeText">{t('free')}</span>
                    </div>
                  )}
                </div>

                {hasPlayers ? (
                  <div>
                    {/* Scoreboard */}
                    <div className="scoreboardMain" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)` }}>
                       {/* ... Same as before ... */}
                       <div 
                        className={`scoreTeamMain ${court.score.team1 === 0 && court.score.team2 === 0 && isFull ? 'selectableTeam' : ''} ${court.serving === 'team1' && court.score.team1 === 0 && court.score.team2 === 0 ? 'selectedTeam' : ''}`}
                        onClick={() => {
                          if (court.score.team1 === 0 && court.score.team2 === 0 && isFull) {
                            setServingPlayer(court.id, 'team1', 0);
                          }
                        }}
                      >
                        <div className="teamLabelMain">Team 1 {court.score.team1 === 0 && court.score.team2 === 0 && isFull && court.serving === 'team1' && <span>🏸</span>}</div>
                        <div className="scoreControlsMain">
                          <button className="scoreBtnMain" onClick={(e) => {
                            e.stopPropagation();
                            decrementScore(court.id, 'team1');
                          }}>−</button>
                          <div className="scoreDisplayMain" style={{ color: COLORS.primary }}>
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
                        className={`scoreTeamMain ${court.score.team1 === 0 && court.score.team2 === 0 && isFull ? 'selectableTeam' : ''} ${court.serving === 'team2' && court.score.team1 === 0 && court.score.team2 === 0 ? 'selectedTeam' : ''}`}
                        onClick={() => {
                          if (court.score.team1 === 0 && court.score.team2 === 0 && isFull) {
                            setServingPlayer(court.id, 'team2', gameMode === 'doubles' ? 1 : 0);
                          }
                        }}
                      >
                        <div className="teamLabelMain">Team 2 {court.score.team1 === 0 && court.score.team2 === 0 && isFull && court.serving === 'team2' && <span>🏸</span>}</div>
                        <div className="scoreControlsMain">
                          <button className="scoreBtnMain" onClick={(e) => {
                            e.stopPropagation();
                            decrementScore(court.id, 'team2');
                          }}>−</button>
                          <div className="scoreDisplayMain" style={{ color: COLORS.primary }}>
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
                        <div className="playerPositionsMain" style={{ gridTemplateColumns: gameMode === 'singles' ? '1fr' : '1fr 1fr' }}>
                          {(gameMode === 'doubles' ? [0, 1] : [0]).map((idx) => {
                            const player = team1Players[idx];
                            const isServing = court.serving === 'team1' && idx === court.servingPlayerIndex?.team1;
                            
                            return (
                              <div key={idx} className="playerSlotMain">
                                {player ? (
                                  <div className={`playerCardMain ${isServing ? 'serving' : ''} ${player.photo ? 'hasPhoto' : ''}`}>
                                     {player.photo && <img src={player.photo} className="playerPhotoMain" alt="" />}
                                    <div className="playerIconMain">
                                      {isServing && <span className="serveIconOnPlayer">🏸</span>}
                                      {!player.photo && '👤'}
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
                         <div className="playerPositionsMain" style={{ gridTemplateColumns: gameMode === 'singles' ? '1fr' : '1fr 1fr' }}>
                          {(gameMode === 'doubles' ? [0, 1] : [0]).map((idx) => {
                            const player = team2Players[idx];
                            const isServing = court.serving === 'team2' && idx === court.servingPlayerIndex?.team2;
                            
                            return (
                              <div key={idx} className="playerSlotMain">
                                {player ? (
                                  <div className={`playerCardMain ${isServing ? 'serving' : ''} ${player.photo ? 'hasPhoto' : ''}`}>
                                     {player.photo && <img src={player.photo} className="playerPhotoMain" alt="" />}
                                    <div className="playerIconMain">
                                      {isServing && <span className="serveIconOnPlayer">🏸</span>}
                                      {!player.photo && '👤'}
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
                        {t('manage')}
                      </button>
                      <button 
                        className="finishBtnMain" 
                        onClick={() => finishMatch(court.id)}
                      >
                        {t('finishGame')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="emptyCourtMessage">
                      <span className="emptyCourtIcon">🏸</span>
                      <span className="emptyCourtText">{t('emptyCourt')}</span>
                    </div>
                    <div className="courtButtonsRow">
                      <button 
                        className="startMatchBtn" 
                        onClick={() => assignMatchToCourt(court.id)}
                      >
                        <span className="startMatchBtnText">{t('random')}</span>
                      </button>
                      <button 
                        className="customBtn" 
                        onClick={() => openCourtModal(court.id)}
                      >
                        <span className="customBtnText">{t('manual')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Player Stats Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <h3 className="sectionHeader" style={{ margin: 0 }}>📊 {sortMode === 'queue' ? t('queue') : t('leaderboard')}</h3>
            <button 
                onClick={() => setSortMode(prev => prev === 'queue' ? 'leaderboard' : 'queue')}
                style={{ background: 'none', border: 'none', fontSize: 13, color: COLORS.blue, cursor: 'pointer', fontWeight: 'bold' }}
            >
                {sortMode === 'queue' ? t('viewWinners') : t('viewQueue')} 
            </button>
          </div>
          
          <div className="statsCard">
            {players.sort((a,b) => {
                 if (a.isResting !== b.isResting) return a.isResting ? 1 : -1;
                 
                 if (sortMode === 'leaderboard') {
                     // Leaderboard: Wins DESC, then Play Count ASC
                     if (b.winCount !== a.winCount) return b.winCount - a.winCount;
                     return a.playCount - b.playCount;
                 } else {
                     // Queue logic: Play Count ASC, then Wins DESC (to show good players first in same tier?) or ASC? 
                     // Let's stick to simple queue: Play Count ASC. Tie break by Wins DESC (usually better players stay on court longer? doesn't matter much)
                     if (a.playCount !== b.playCount) return a.playCount - b.playCount;
                     return b.winCount - a.winCount; 
                 }
            }).map((p) => {
              const maxWins = Math.max(...players.map(pl => pl.winCount));
              const isMVP = maxWins > 0 && p.winCount === maxWins;
              
              return (
              <div key={p.id} className={`statRow ${p.isPlaying ? 'active' : ''}`} style={{ opacity: p.isResting ? 0.6 : 1 }}>
                <button 
                    onClick={() => {
                        setPlayers(players.map(pl => pl.id === p.id ? { ...pl, isResting: !pl.isResting } : pl));
                    }}
                    title={p.isResting ? "กลับมาเล่น" : "พัก"}
                    style={{ 
                        marginRight: 12, border: 'none', background: 'none', cursor: 'pointer', fontSize: 18,
                        filter: p.isResting ? 'grayscale(100%)' : 'none', padding: 0
                    }}
                >
                    {p.isResting ? '💤' : '⚡'}
                </button>

                <div 
                  className="statNameContainer"
                  onClick={() => openEditModal(p)}
                >
                   <div className="statusDot" style={{backgroundColor: p.isPlaying ? COLORS.accent : '#ddd'}} />
                   {p.photo && <img src={p.photo} alt="" style={{ width: 30, height: 30, borderRadius: 15, marginRight: 8, objectFit: 'cover' }} />}
                   <span className={`statName ${p.isPlaying ? 'playing' : ''}`}>
                     {p.name} 
                     {p.isPlaying ? '(เล่น)' : ''}
                     {isMVP && <span style={{ marginLeft: 5 }}>🏆</span>}
                     {p.isResting && <span style={{ fontSize: 12, color: '#888' }}> (พัก)</span>}
                   </span>
                   <span className="tinyEdit"> ✎</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="statCount">{p.playCount} เกม</div>
                    <div style={{ fontSize: 11, color: COLORS.primary, fontWeight: 'bold' }}>Win {p.winCount}</div>
                </div>
              </div>
            )})}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0 40px 0', padding: '0 5px' }}>
            <div style={{ display: 'flex', gap: 15 }}>
                <button onClick={resetPlayCounts} style={{ background: 'none', border: 'none', color: '#f57c00', cursor: 'pointer', textDecoration: 'underline', fontSize: 13, flex: 1, textAlign: 'left' }}>
                    {t('resetPlay')}
                </button>
                <button onClick={resetWinCounts} style={{ background: 'none', border: 'none', color: COLORS.blue, cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>
                    {t('resetWin')}
                </button>
            </div>
            <button onClick={resetStats} style={{ background: 'none', border: 'none', color: COLORS.red, cursor: 'pointer', textDecoration: 'underline', textAlign: 'left', fontSize: 13 }}>
                {t('resetAll')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showCalendar) return (
     <div className="app-root">
         {renderCalendar()}
        {isEventModalVisible && (
            <div className="modalOverlay">
            <div className="modalView">
                <h3 className="modalTitle">{t('addEvent')}</h3>
                <input className="modalInput" placeholder={t('eventTitle')} value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} />
                <input className="modalInput" type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} />
                <div style={{display: 'flex', gap: 10, width: '100%', marginBottom: 20}}>
                    <input className="modalInput" type="time" value={newEventStartTime} onChange={e => setNewEventStartTime(e.target.value)} style={{marginBottom: 0}} />
                    <input className="modalInput" type="time" value={newEventEndTime} onChange={e => setNewEventEndTime(e.target.value)} style={{marginBottom: 0}} />
                </div>
                <input className="modalInput" placeholder={t('eventLocation')} value={newEventLocation} onChange={e => setNewEventLocation(e.target.value)} />
                <textarea className="modalInput" placeholder={t('eventDesc')} value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} rows={3} style={{height: 'auto'}} />
                
                <div className="modalActions">
                <button className="modalBtn modalBtnCancel" onClick={() => setEventModalVisible(false)}>
                    <span className="modalBtnTextCancel">{t('cancelAction')}</span>
                </button>
                <button className="modalBtn modalBtnSave" onClick={handleAddSchedule}>
                    <span className="modalBtnTextSave">{t('save')}</span>
                </button>
                </div>
            </div>
            </div>
        )}
     </div>
  );

  if (!user) {
    return (
        <div className="app-root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <h1 style={{ color: COLORS.primary }}>Badminton Manager</h1>
            <div style={{ marginTop: 20 }}>
                <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log('Login Failed')}
                />
            </div>
        </div>
    );
  }

  if (!selectedGroup) return renderGroupSelection();

  return (
    <div className="app-root">
      {isGameStarted ? renderGame() : renderSetup()}

      {/* --- SHARE MODAL --- */}
      {isShareModalVisible && (
        <div className="modalOverlay">
          <div className="modalView">
             <h3 className="modalTitle">{t('shareGroup')}</h3>
             <p style={{ fontSize: 13, color: COLORS.gray, marginBottom: 15 }}>{t('shareGroupDesc')}</p>
             <input 
                 className="modalInput" 
                 placeholder="Example@gmail.com" 
                 value={shareEmail}
                 onChange={(e) => setShareEmail(e.target.value)}
             />
             <div className="modalActions">
                 <button className="modalBtn modalBtnCancel" onClick={() => setShareModalVisible(false)}>
                     <span className="modalBtnTextCancel">{t('cancel')}</span>
                 </button>
                 <button className="modalBtn modalBtnSave" onClick={handleShareGroup}>
                     <span className="modalBtnTextSave">{t('share')}</span>
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalVisible && (
        <div className="modalOverlay">
          <div className="modalView">
            <h3 className="modalTitle">{t('editPlayer')}</h3>
             <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 15 }}>
                {editingPlayer.photo && !tempPhoto && (
                    <img src={editingPlayer.photo} alt="" style={{ width: 80, height: 80, borderRadius: 40, objectFit: 'cover' }} />
                )}
             </div>
            <input
              className="modalInput"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              autoFocus={true}
              placeholder="ใส่ชื่อใหม่..."
            />

            <label style={{ display: 'block', marginBottom: 5, fontSize: 14, color: '#666' }}>Base Skill (0-100)</label>
            <input
              className="modalInput"
              type="number"
              min="0" max="100"
              value={tempBaseSkill}
              onChange={(e) => setTempBaseSkill(e.target.value)}
              placeholder="Skill"
            />
             <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 14, color: '#666' }}>{t('changePhoto')}</label>
                <input 
                    type="file" 
                    onChange={(e) => setTempPhoto(e.target.files[0])}
                />
            </div>

            <div className="modalActions">
              <button 
                className="modalBtn modalBtnCancel"
                onClick={() => setEditModalVisible(false)}
              >
                <span className="modalBtnTextCancel">{t('cancelAction')}</span>
              </button>
              <button 
                className="modalBtn modalBtnSave"
                onClick={savePlayerName}
              >
                <span className="modalBtnTextSave">{t('save')}</span>
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
                <h3 className="modalTitle">🏸 {t('court')} {selectedCourtId}</h3>
                <button className="closeModalBtn" onClick={closeCourtModal}>✕</button>
              </div>

              {/* Scoreboard */}
              <div className="scoreboard">
                <div className="scoreTeam">
                  <div className="teamLabel">{t('team1')}</div>
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
                  <div className="teamLabel">{t('team2')}</div>
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
                  {t('resetScoreBtn')}
                </button>
              </div>

              {/* Badminton Court Visualization */}
              <div className="badmintonCourt">
                {/* Team 1 Side (Top) */}
                <div className="courtSide team1Side">
                  <div className="courtSideLabel">{t('team1')}</div>
                  <div className="playerPositions">
                    {[0, 1].map((idx) => (
                      <div key={idx} className="playerSlot">
                        {team1Players[idx] ? (
                          <div className={`playerCard ${team1Players[idx].photo ? 'hasPhoto' : ''}`}>
                             {team1Players[idx].photo && <img src={team1Players[idx].photo} className="playerPhotoMain" alt="" />}
                            <button 
                              className="removePlayerBtnSmall"
                              onClick={() => removePlayerFromCourt(team1Players[idx].id)}
                              style={{ zIndex: 2 }}
                            >
                              ×
                            </button>
                            <div className="playerIcon" style={{ zIndex: 1, position: 'relative' }}>
                                 {team1Players[idx].photo ? '' : '👤'}
                            </div>
                            <div className="playerLabel" style={{ zIndex: 1, position: 'relative' }}>{team1Players[idx].name}</div>
                          </div>
                        ) : (
                          <div className="emptySlot">
                            <div className="emptyIcon">+</div>
                            <div className="emptyLabel">{t('emptySlot')}</div>
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
                  <div className="courtSideLabel">{t('team2')}</div>
                  <div className="playerPositions">
                    {[0, 1].map((idx) => (
                      <div key={idx} className="playerSlot">
                        {team2Players[idx] ? (
                          <div className={`playerCard ${team2Players[idx].photo ? 'hasPhoto' : ''}`}>
                             {team2Players[idx].photo && <img src={team2Players[idx].photo} className="playerPhotoMain" alt="" />}
                            <button 
                              className="removePlayerBtnSmall"
                              onClick={() => removePlayerFromCourt(team2Players[idx].id)}
                              style={{ zIndex: 2 }}
                            >
                              ×
                            </button>
                           <div className="playerIcon" style={{ zIndex: 1, position: 'relative' }}>
                                 {team2Players[idx].photo ? '' : '👤'}
                            </div>
                            <div className="playerLabel" style={{ zIndex: 1, position: 'relative' }}>{team2Players[idx].name}</div>
                          </div>
                        ) : (
                          <div className="emptySlot">
                            <div className="emptyIcon">+</div>
                            <div className="emptyLabel">{t('emptySlot')}</div>
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
                  <h4 className="availableTitle">{t('availablePlayers')} ({availablePlayers.length})</h4>
                  <div className="availablePlayersList">
                    {availablePlayers.map((p) => (
                      <div key={p.id} className="availablePlayerItem">
                        <div className="availablePlayerInfo">
                          <span className="availablePlayerName">
                              {p.photo && <img src={p.photo} alt="" style={{ width: 16, height: 16, borderRadius: 8, marginRight: 4, objectFit: 'cover' }} />}
                              {p.name}
                          </span>
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
                <span className="modalBtnTextSave">{t('finish')}</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* --- FINISH MATCH MODAL --- */}
      {isFinishModalVisible && finishingCourtId && (() => {
        const currentCourt = courts.find(c => c.id === finishingCourtId);
        const t1Score = currentCourt.score.team1;
        const t2Score = currentCourt.score.team2;
        
        let suggestedWinner = null;
        if (t1Score > t2Score) suggestedWinner = 'team1';
        if (t2Score > t1Score) suggestedWinner = 'team2';
        
        return (
          <div className="modalOverlay">
            <div className="modalView" style={{ width: '90%', maxWidth: 350 }}>
              <h3 className="modalTitle">{t('finishGameCourt')} {finishingCourtId}</h3>
              
              <div style={{ marginBottom: 20, textAlign: 'center', fontSize: 18 }}>
                 {t1Score > 0 || t2Score > 0 ? (
                     <div>
                         {t('scoreDisplay')} <b>{t1Score}</b> - <b>{t2Score}</b>
                     </div>
                 ) : (
                     <div style={{ color: '#888' }}>{t('noScore')}</div>
                 )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                  <button 
                    className="modalBtn" 
                    style={{ width: '100%', backgroundColor: suggestedWinner === 'team1' ? '#006400' : '#f0f0f0', color: suggestedWinner === 'team1' ? 'white' : '#333' }}
                    onClick={() => handleConfirmFinish('team1')}
                  >
                     {t('team1Win')} {suggestedWinner === 'team1' && '🏆'}
                  </button>
                  <button 
                    className="modalBtn" 
                    style={{ width: '100%', backgroundColor: suggestedWinner === 'team2' ? '#006400' : '#f0f0f0', color: suggestedWinner === 'team2' ? 'white' : '#333' }}
                    onClick={() => handleConfirmFinish('team2')}
                  >
                     {t('team2Win')} {suggestedWinner === 'team2' && '🏆'}
                  </button>
                  <button 
                    className="modalBtn" 
                    style={{ width: '100%', border: '1px solid #ddd', backgroundColor: 'white' }}
                    onClick={() => handleConfirmFinish(null)}
                  >
                     {t('draw')}
                  </button>
              </div>

               <div style={{ marginTop: 20, width: '100%' }}>
                   <button 
                    className="modalBtn modalBtnCancel"
                    style={{ width: '100%' }}
                    onClick={() => {
                        setFinishModalVisible(false);
                        setFinishingCourtId(null);
                    }}
                   >
                     {t('cancelAction')}
                   </button>
               </div>
            </div>
          </div>
        );
      })()}

      {/* --- EXPENSE MODAL --- */}
      {isExpenseModalVisible && (() => {
        const cFee = parseFloat(courtFee) || 0;
        const sPrice = parseFloat(shuttlecockPrice) || 0;
        const sCount = parseFloat(shuttlecockCount) || 0;
        const totalExpense = cFee + (sPrice * sCount);
        
        const fixedIds = Object.keys(fixedPlayerFees).filter(id => fixedPlayerFees[id] !== '' && fixedPlayerFees[id] !== undefined);
        const totalFixed = fixedIds.reduce((sum, id) => sum + (parseFloat(fixedPlayerFees[id]) || 0), 0);
        
        const remainingExpense = Math.max(0, totalExpense - totalFixed);
        const remainingPlayersCount = players.length - fixedIds.length;
        const splitShare = remainingPlayersCount > 0 ? remainingExpense / remainingPlayersCount : 0;

        return (
          <div className="modalOverlay">
            <div className="courtModalView" style={{ width: '90%', maxWidth: 500 }}>
              <div className="courtModalHeader">
                <h3 className="modalTitle">{t('expense')}</h3>
                <button className="closeModalBtn" onClick={() => setExpenseModalVisible(false)}>✕</button>
              </div>

              <div style={{ marginBottom: 20, backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10 }}>
                  {/* Row 1: Court Fee */}
                  <div className="inputRow" style={{ marginBottom: 15 }}>
                      <div style={{ flex: 1 }}>
                        <label className="label" style={{ fontSize: 12 }}>{t('courtFee')}</label>
                        <input 
                            className="input" 
                            type="number" 
                            value={courtFee} 
                            onChange={e => setCourtFee(e.target.value)} 
                            placeholder="0"
                            style={{ width: '100%' }}
                        />
                      </div>
                  </div>

                  {/* Row 2: Shuttlecock */}
                  <div className="inputRow">
                      <div style={{ flex: 1, marginRight: 10 }}>
                        <label className="label" style={{ fontSize: 12 }}>{t('shuttlePrice')}</label>
                         <input 
                            className="input" 
                            type="number" 
                            value={shuttlecockPrice} 
                            onChange={e => setShuttlecockPrice(e.target.value)} 
                            placeholder="0"
                            style={{ width: '100%' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                         <label className="label" style={{ fontSize: 12 }}>{t('shuttleCount')}</label>
                         <input 
                            className="input" 
                            type="number" 
                            value={shuttlecockCount} 
                            onChange={e => setShuttlecockCount(e.target.value)} 
                            placeholder="0"
                            style={{ width: '100%' }}
                        />
                      </div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#006400', marginTop: 10 }}>
                      {t('total')} {totalExpense.toLocaleString()} {t('currency')}
                  </div>
              </div>

              <div style={{ overflowY: 'auto', maxHeight: '50vh', marginBottom: 20 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                          <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                              <th style={{ padding: 8 }}>{t('name')}</th>
                              <th style={{ padding: 8, width: 80 }}>{t('payOwn')}</th>
                              <th style={{ padding: 8, textAlign: 'right' }}>{t('amount')}</th>
                          </tr>
                      </thead>
                      <tbody>
                          {players.map(p => {
                              const isFixed = fixedPlayerFees[p.id] !== undefined && fixedPlayerFees[p.id] !== '';
                              const amount = isFixed ? parseFloat(fixedPlayerFees[p.id]) : splitShare;
                              
                              return (
                                  <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                      <td style={{ padding: 8, display: 'flex', alignItems: 'center' }}>
                                          {p.photo && <img src={p.photo} style={{ width: 20, height: 20, borderRadius: 10, marginRight: 5, objectFit: 'cover' }} alt="" />}
                                          {p.name}
                                      </td>
                                      <td style={{ padding: 8 }}>
                                          <input 
                                              type="number" 
                                              placeholder="-"
                                              style={{ width: '100%', padding: 4, borderRadius: 4, border: '1px solid #ddd' }}
                                              value={fixedPlayerFees[p.id] || ''}
                                              onChange={(e) => {
                                                  setFixedPlayerFees({ ...fixedPlayerFees, [p.id]: e.target.value });
                                              }}
                                          />
                                      </td>
                                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 'bold', color: isFixed ? '#D32F2F' : '#333' }}>
                                          {Math.ceil(amount).toLocaleString()}
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
              
              <div style={{ borderTop: '1px solid #ddd', paddingTop: 15 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 18 }}>
                       <span>{t('average')}</span>
                       <span style={{ color: '#006400' }}>{Math.ceil(splitShare).toLocaleString()} {t('currency')}</span>
                   </div>
                   <div style={{ fontSize: 12, color: '#888', textAlign: 'right' }}>
                       {t('onlyShared')}
                   </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
