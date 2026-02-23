/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
 
import React, { useState, useMemo } from 'react';
import {
  User,
  UserPlus,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
 
// --- Types ---
 
type Gender = 'M' | 'F';
 
interface Occupant {
  id: string;
  name: string;
  gender: Gender;
}
 
interface Room {
  id: string;
  floor: number;
  gender: Gender | null;
  occupants: Occupant[];
}
 
// --- Constants ---
 
const ROOM_CAPACITY = 2; // Default capacity, can be made dynamic if needed
 
const INITIAL_ROOM_IDS = [
  // 1st Floor: 101-115, excluding 103, 105
  ...Array.from({ length: 15 }, (_, i) => 101 + i).filter(id => id !== 103 && id !== 105),
  // 2nd Floor: 201-215
  ...Array.from({ length: 15 }, (_, i) => 201 + i)
].map(String);
 
// --- App Component ---
 
export default function App() {
  // State
  const [rooms, setRooms] = useState<Room[]>(() =>
    INITIAL_ROOM_IDS.map(id => ({
      id,
      floor: id.startsWith('1') ? 1 : 2,
      gender: null,
      occupants: []
    }))
  );
 
  const [inputName, setInputName] = useState('');
  const [inputGender, setInputGender] = useState<Gender>('M');
  const [lastAssigned, setLastAssigned] = useState<{ name: string, roomId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
 
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
 
  // Stats
  const stats = useMemo(() => {
    const totalOccupants = rooms.reduce((acc, r) => acc + r.occupants.length, 0);
    const maleCount = rooms.reduce((acc, r) => acc + r.occupants.filter(o => o.gender === 'M').length, 0);
    const femaleCount = rooms.reduce((acc, r) => acc + r.occupants.filter(o => o.gender === 'F').length, 0);
    const occupiedRooms = rooms.filter(r => r.occupants.length > 0).length;
   
    return { totalOccupants, maleCount, femaleCount, occupiedRooms, totalRooms: rooms.length };
  }, [rooms]);
 
  // Handlers
  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
 
    if (!inputName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
 
    // Find available rooms
    // 1. Room is empty
    // 2. Room gender matches input gender AND has space
    const availableRooms = rooms.filter(r => {
      const hasSpace = r.occupants.length < ROOM_CAPACITY;
      const isCorrectGender = r.gender === null || r.gender === inputGender;
      return hasSpace && isCorrectGender;
    });
 
    if (availableRooms.length === 0) {
      setError('배정 가능한 빈 방이 없습니다.');
      return;
    }
 
    // Pick random room
    const randomIndex = Math.floor(Math.random() * availableRooms.length);
    const targetRoom = availableRooms[randomIndex];
 
    const newOccupant: Occupant = {
      id: crypto.randomUUID(),
      name: inputName.trim(),
      gender: inputGender
    };
 
    setRooms(prev => prev.map(r => {
      if (r.id === targetRoom.id) {
        return {
          ...r,
          gender: inputGender, // Set room gender if it was null
          occupants: [...r.occupants, newOccupant]
        };
      }
      return r;
    }));
 
    setLastAssigned({ name: inputName.trim(), roomId: targetRoom.id });
    setInputName('');
  };
 
  const handleReset = () => {
    if (window.confirm('모든 배정 현황을 초기화하시겠습니까?')) {
      setRooms(INITIAL_ROOM_IDS.map(id => ({
        id,
        floor: id.startsWith('1') ? 1 : 2,
        gender: null,
        occupants: []
      })));
      setLastAssigned(null);
      setError(null);
    }
  };
 
  const removeOccupant = (roomId: string, occupantId: string) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const nextOccupants = r.occupants.filter(o => o.id !== occupantId);
        return {
          ...r,
          gender: nextOccupants.length === 0 ? null : r.gender,
          occupants: nextOccupants
        };
      }
      return r;
    }));
  };
 
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
       
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Building2 size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Dormitory Management</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              객실 추첨 시스템
            </h1>
            <p className="text-slate-500 mt-1">입소생 성별 맞춤형 자동 배정 및 실시간 현황</p>
          </div>
         
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                그리드 뷰
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                엑셀 뷰
              </button>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RotateCcw size={16} />
              전체 초기화
            </button>
          </div>
        </header>
 
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
          {/* Left Column: Controls & Stats */}
          <div className="lg:col-span-4 space-y-6">
           
            {/* Draw Form */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-emerald-500" />
                신규 배정
              </h2>
              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">이름</label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="입소생 이름을 입력하세요"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
               
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">성별</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInputGender('M')}
                      className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        inputGender === 'M'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      남성
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputGender('F')}
                      className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        inputGender === 'F'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                        : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      여성
                    </button>
                  </div>
                </div>
 
                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group"
                >
                  추첨 및 배정하기
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
 
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg flex items-center gap-2"
                  >
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}
              </form>
            </section>
 
            {/* Last Result */}
            <AnimatePresence mode="wait">
              {lastAssigned && (
                <motion.div
                  key={lastAssigned.name + lastAssigned.roomId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500 text-white rounded-2xl p-6 shadow-lg shadow-emerald-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={20} />
                    <span className="font-bold">배정 완료!</span>
                  </div>
                  <div className="text-3xl font-black">
                    {lastAssigned.name} <span className="text-emerald-100 text-xl font-medium">→</span> {lastAssigned.roomId}호
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
 
            {/* Stats Grid */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">전체 인원</div>
                <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                  {stats.totalOccupants} <span className="text-sm font-medium text-slate-400">명</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">사용 중인 방</div>
                <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                  {stats.occupiedRooms} <span className="text-sm font-medium text-slate-400">/ {stats.totalRooms}</span>
                </div>
              </div>
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">남성</div>
                <div className="text-2xl font-black text-blue-700">{stats.maleCount}명</div>
              </div>
              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                <div className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">여성</div>
                <div className="text-2xl font-black text-rose-700">{stats.femaleCount}명</div>
              </div>
            </section>
          </div>
 
          {/* Right Column: Room Grid or Table */}
          <div className="lg:col-span-8 space-y-8">
            {viewMode === 'grid' ? (
              <>
                {/* 1st Floor */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">1F</div>
                    <h3 className="text-xl font-bold text-slate-800">1층 객실 현황</h3>
                    <div className="flex-1 h-px bg-slate-200"></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {rooms.filter(r => r.floor === 1).map(room => (
                      <RoomCard key={room.id} room={room} onRemove={removeOccupant} />
                    ))}
                  </div>
                </section>
 
                {/* 2nd Floor */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">2F</div>
                    <h3 className="text-xl font-bold text-slate-800">2층 객실 현황</h3>
                    <div className="flex-1 h-px bg-slate-200"></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {rooms.filter(r => r.floor === 2).map(room => (
                      <RoomCard key={room.id} room={room} onRemove={removeOccupant} />
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">층</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">호수</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">성별</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">인원</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">배정 명단</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rooms.map((room) => (
                        <tr key={room.id} className={`hover:bg-slate-50/50 transition-colors ${room.occupants.length === 0 ? 'opacity-50' : ''}`}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-400">{room.floor}F</td>
                          <td className="px-6 py-4 text-sm font-black text-slate-900">{room.id}호</td>
                          <td className="px-6 py-4">
                            {room.gender ? (
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${room.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                                {room.gender === 'M' ? '남성' : '여성'}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm font-bold ${room.occupants.length === ROOM_CAPACITY ? 'text-emerald-600' : 'text-slate-600'}`}>
                                {room.occupants.length}
                              </span>
                              <span className="text-xs text-slate-300">/ {ROOM_CAPACITY}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {room.occupants.map(occ => (
                                <div key={occ.id} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-sm">
                                  <User size={10} className={occ.gender === 'M' ? 'text-blue-400' : 'text-rose-400'} />
                                  <span className="text-xs font-bold">{occ.name}</span>
                                </div>
                              ))}
                              {room.occupants.length === 0 && <span className="text-slate-300 text-xs italic">비어 있음</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              {room.occupants.map(occ => (
                                <button
                                  key={occ.id}
                                  onClick={() => removeOccupant(room.id, occ.id)}
                                  className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                  title={`${occ.name} 퇴실`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 
// --- Sub-components ---
 
function RoomCard({ room, onRemove }: { room: Room, onRemove: (rid: string, oid: string) => void, key?: React.Key }) {
  const isEmpty = room.occupants.length === 0;
 
  return (
    <motion.div
      layout
      className={`relative group bg-white rounded-xl border p-4 transition-all duration-300 ${
        isEmpty
          ? 'border-slate-100 opacity-60 hover:opacity-100'
          : room.gender === 'M'
            ? 'border-blue-200 bg-blue-50/30'
            : 'border-rose-200 bg-rose-50/30'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-sm font-black tracking-tighter ${isEmpty ? 'text-slate-400' : 'text-slate-900'}`}>
          {room.id}호
        </span>
        {!isEmpty && (
          <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
            room.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'
          }`}>
            {room.gender === 'M' ? 'Male' : 'Female'}
          </div>
        )}
      </div>
 
      <div className="space-y-1.5 min-h-[48px]">
        {room.occupants.map((occ) => (
          <div key={occ.id} className="flex items-center justify-between group/item bg-white/80 p-1.5 rounded-lg border border-black/5 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <User size={12} className={occ.gender === 'M' ? 'text-blue-400' : 'text-rose-400'} />
              <span className="text-xs font-bold truncate">{occ.name}</span>
            </div>
            <button
              onClick={() => onRemove(room.id, occ.id)}
              className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
       
        {/* Empty slots */}
        {Array.from({ length: ROOM_CAPACITY - room.occupants.length }).map((_, i) => (
          <div key={i} className="h-8 border border-dashed border-slate-200 rounded-lg flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
          </div>
        ))}
      </div>
 
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          {Array.from({ length: ROOM_CAPACITY }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < room.occupants.length
                  ? (room.gender === 'M' ? 'bg-blue-400' : 'bg-rose-400')
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] font-bold text-slate-400">
          {room.occupants.length}/{ROOM_CAPACITY}
        </span>
      </div>
    </motion.div>
  );
}
