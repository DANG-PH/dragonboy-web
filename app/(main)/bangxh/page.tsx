"use client"
import React, { useState, useEffect } from 'react';

interface UserData {
  id?: string | number;
  auth_id?: number;
  gameName?: string;
  avatarUrl?: string;
  sucManh?: any;
  sucManhDeTu?: any;
  vang?: any;
  ngoc?: any;
  rank?: number;
  formattedSucManh?: string;
  formattedSucManhDeTu?: string;
  formattedVang?: string;
  formattedNgoc?: string;
}

type TabType = 'sucmanh' | 'vang';

const getNumericValue = (value: any): number => {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'low' in value) {
    const low = value.low || 0;
    const high = value.high || 0;
    return (high * Math.pow(2, 32)) + (low >>> 0);
  }
  return 0;
};

const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
};

const processUsers = (userData: UserData[]): UserData[] =>
  userData.map((user, index) => ({
    ...user,
    rank: index + 1,
    formattedSucManh: formatNumber(getNumericValue(user.sucManh)),
    formattedSucManhDeTu: formatNumber(getNumericValue(user.sucManhDeTu)),
    formattedVang: formatNumber(getNumericValue(user.vang)),
    formattedNgoc: formatNumber(getNumericValue(user.ngoc)),
  }));

// ── Avatar with fallback ──────────────────────────────────────────
function Avatar({ src, size, border }: { src?: string; size: number; border: string }) {
  const [imgSrc, setImgSrc] = useState(src || '/assets/524.png');
  return (
    <img
      src={imgSrc}
      alt="avatar"
      width={size}
      height={size}
      onError={() => setImgSrc('/assets/524.png')}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        border: `4px solid ${border}`,
        objectFit: 'cover',
        display: 'block',
      }}
    />
  );
}

// ── Rank medal ────────────────────────────────────────────────────
const MEDALS: Record<number, { bg: string; shadow: string }> = {
  1: { bg: 'linear-gradient(135deg,#FFD700,#FF8C00)', shadow: '0 0 20px rgba(255,215,0,0.7)' },
  2: { bg: 'linear-gradient(135deg,#E8E8E8,#A8A8A8)', shadow: '0 0 16px rgba(200,200,200,0.5)' },
  3: { bg: 'linear-gradient(135deg,#CD7F32,#B8860B)', shadow: '0 0 16px rgba(205,127,50,0.5)' },
};

function RankBadge({ rank }: { rank: number }) {
  const medal = MEDALS[rank];
  if (medal) return (
    <div style={{
      width: 52, height: 52, borderRadius: '50%',
      background: medal.bg,
      boxShadow: medal.shadow,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: 22, color: rank === 2 ? '#333' : '#fff',
      margin: '0 auto',
    }}>{rank}</div>
  );
  return (
    <div style={{ fontWeight: 700, color: '#9ca3af', fontSize: 18, textAlign: 'center' }}>
      {rank}
    </div>
  );
}

// ── Podium card ───────────────────────────────────────────────────
const PODIUM_COLORS: Record<number, { border: string; glow: string; avatarBorder: string; ring: string }> = {
  1: { border: 'rgba(255,215,0,0.6)', glow: '0 25px 60px rgba(255,215,0,0.25)', avatarBorder: '#FFD700', ring: 'rgba(255,215,0,0.35)' },
  2: { border: 'rgba(200,200,200,0.4)', glow: '0 25px 60px rgba(180,180,180,0.15)', avatarBorder: '#C0C0C0', ring: 'rgba(192,192,192,0.3)' },
  3: { border: 'rgba(205,127,50,0.4)', glow: '0 25px 60px rgba(205,127,50,0.15)', avatarBorder: '#CD7F32', ring: 'rgba(205,127,50,0.3)' },
};

function PodiumCard({
  user, rank, activeTab, order, marginTop,
}: {
  user: UserData; rank: number; activeTab: TabType; order: number; marginTop?: number;
}) {
  const colors = PODIUM_COLORS[rank];
  const isFirst = rank === 1;
  const avatarSize = isFirst ? 114 : 100;

  const statLabel = activeTab === 'sucmanh' ? (isFirst ? 'Sức mạnh' : 'Sức mạnh') : 'Vàng';
  const statValue = activeTab === 'sucmanh' ? user.formattedSucManh : user.formattedVang;
  const stat2Label = activeTab === 'sucmanh' ? 'Đệ tử' : 'Ngọc';
  const stat2Value = activeTab === 'sucmanh' ? user.formattedSucManhDeTu : user.formattedNgoc;

  return (
    <div
      className="podium-card group"
      style={{
        position: 'relative',
        textAlign: 'center',
        background: 'linear-gradient(145deg,rgba(38,38,60,0.97),rgba(20,20,38,0.95))',
        backdropFilter: 'blur(18px)',
        borderRadius: 28,
        padding: isFirst ? '44px 36px 36px' : '40px 32px 32px',
        boxShadow: colors.glow,
        border: `2px solid ${colors.border}`,
        minWidth: 220,
        maxWidth: isFirst ? 300 : 270,
        width: '100%',
        order,
        marginTop: marginTop || 0,
        transition: 'transform 0.4s ease, box-shadow 0.4s ease',
        flex: '0 0 auto',
      }}
    >
      {/* Crown */}
      <div style={{
        position: 'absolute', top: isFirst ? -34 : -28,
        left: '50%', transform: 'translateX(-50%)',
        fontSize: isFirst ? 44 : 36,
        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
        animation: 'floatEmoji 2.5s ease-in-out infinite',
        animationDelay: `${rank * 0.2}s`,
      }}>👑</div>

      {/* Rank badge */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          width: isFirst ? 58 : 52, height: isFirst ? 58 : 52,
          borderRadius: '50%',
          background: MEDALS[rank].bg,
          boxShadow: MEDALS[rank].shadow,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: isFirst ? 26 : 22,
          color: rank === 2 ? '#333' : '#fff',
          margin: '0 auto',
        }}>{rank}</div>
      </div>

      {/* Avatar */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 18 }}>
        <div style={{
          position: 'absolute', inset: -10, borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.ring} 0%, transparent 70%)`,
          animation: 'pulseRing 2.5s ease-in-out infinite',
          animationDelay: `${rank * 0.3}s`,
        }} />
        <Avatar src={user.avatarUrl} size={avatarSize} border={colors.avatarBorder} />
      </div>

      {/* Name */}
      <div style={{
        fontWeight: 900,
        fontSize: isFirst ? 20 : 17,
        color: '#FFD700',
        textShadow: '0 3px 12px rgba(255,215,0,0.5)',
        marginBottom: 20,
        letterSpacing: '0.5px',
        wordBreak: 'break-word',
      }}>
        {user.gameName || 'Ẩn danh'}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: statLabel, value: statValue },
          { label: stat2Label, value: stat2Value },
        ].map(({ label, value }) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.06)',
            padding: '10px 16px', borderRadius: 14,
            border: '1px solid rgba(255,215,0,0.12)',
          }}>
            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 15, color: '#FFD700', fontWeight: 800, textShadow: '0 2px 8px rgba(255,215,0,0.4)' }}>
              {value || '0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
function Bangxh() {
  const [sucManhUsers, setSucManhUsers] = useState<UserData[]>([]);
  const [vangUsers, setVangUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('sucmanh');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/top10-suc-manh', { cache: 'no-store' }),
        fetch('/api/top10-vang', { cache: 'no-store' }),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      setSucManhUsers(processUsers(d1.users || []));
      setVangUsers(processUsers(d2.users || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-no-repeat bg-center bg-fixed bg-cover" style={{ backgroundImage: "url('/assets/br.jpg')" }}>
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-b-2 border-blue-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );

  const users = activeTab === 'sucmanh' ? sucManhUsers : vangUsers;

  const tabs: { key: TabType; icon: string; label: string }[] = [
    { key: 'sucmanh', icon: '⚔️', label: 'TOP SỨC MẠNH' },
    { key: 'vang', icon: '💰', label: 'TOP ĐẠI GIA' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Be Vietnam Pro', sans-serif; }

        @keyframes floatEmoji {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(-8px); }
        }
        @keyframes pulseRing {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.12); }
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .podium-card:hover {
          transform: translateY(-16px) scale(1.04) !important;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6) !important;
        }
        .tab-btn:hover {
          transform: translateY(-3px) scale(1.04);
        }
        .rank-row:hover {
          background: rgba(255,215,0,0.1) !important;
          transform: translateX(6px);
        }
        .rank-row:hover .row-avatar {
          transform: scale(1.12) rotate(5deg);
        }

        /* Custom scrollbar */
        .rank-scroll::-webkit-scrollbar { width: 6px; }
        .rank-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 6px; }
        .rank-scroll::-webkit-scrollbar-thumb { background: linear-gradient(#FFD700,#FF8C00); border-radius: 6px; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        fontFamily: "'Be Vietnam Pro', sans-serif",
        background: `url('/assets/br.jpg') center/cover fixed no-repeat`,
        paddingBottom: 100,
      }}>

        {/* ── Hero Logo ── */}
        <div style={{
          textAlign: 'center', paddingTop: 40, paddingBottom: 10,
          animation: 'fadeInUp 0.8s ease-out',
        }}>
          <img
            src="/assets/2.png"
            alt="Logo"
            style={{
              maxWidth: 280, height: 'auto', margin: '0 auto',
              display: 'block',
              filter: 'drop-shadow(0 12px 40px rgba(255,215,0,0.45))',
              transition: 'transform 0.4s',
            }}
          />
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 20,
          flexWrap: 'wrap', marginBottom: 60, padding: '0 20px',
          animation: 'fadeInUp 0.9s ease-out 0.1s both',
        }}>
          {tabs.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className="tab-btn"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 36px', borderRadius: 50,
                  border: `2px solid ${active ? '#FFD700' : 'rgba(255,215,0,0.25)'}`,
                  cursor: 'pointer', fontWeight: 800, fontSize: 14,
                  letterSpacing: 1,
                  background: active
                    ? 'linear-gradient(135deg,#FFD700,#FF8C00)'
                    : 'linear-gradient(135deg,rgba(40,40,62,0.95),rgba(22,22,42,0.9))',
                  color: active ? '#1a1a2e' : '#ccc',
                  boxShadow: active
                    ? '0 10px 35px rgba(255,215,0,0.55), 0 0 60px rgba(255,215,0,0.3)'
                    : '0 8px 24px rgba(0,0,0,0.4)',
                  transform: active ? 'translateY(-4px) scale(1.08)' : 'scale(1)',
                  transition: 'all 0.35s ease',
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                }}
              >
                <span style={{ fontSize: 22, transition: 'transform 0.3s', transform: active ? 'rotate(15deg) scale(1.2)' : 'none' }}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}

          {/* Coming soon */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '16px 36px', borderRadius: 50,
            border: '2px solid rgba(255,215,0,0.12)',
            background: 'linear-gradient(135deg,rgba(30,30,50,0.6),rgba(15,15,30,0.6))',
            color: '#555', fontSize: 14, fontWeight: 800,
            opacity: 0.45, cursor: 'not-allowed', letterSpacing: 1,
          }}>
            <span style={{ fontSize: 22 }}>🔒</span> SẮP RA MẮT
          </div>
        </div>

        {/* ── Podium ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', animation: 'fadeInUp 1s ease-out 0.2s both' }}>
          {users.length >= 3 ? (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
              gap: 24, marginBottom: 80, flexWrap: 'wrap',
            }}>
              {/* rank 2 */}
              <PodiumCard user={users[1]} rank={2} activeTab={activeTab} order={1} marginTop={40} />
              {/* rank 1 */}
              <PodiumCard user={users[0]} rank={1} activeTab={activeTab} order={2} marginTop={0} />
              {/* rank 3 */}
              <PodiumCard user={users[2]} rank={3} activeTab={activeTab} order={3} marginTop={40} />
            </div>
          ) : null}

          {/* ── Ranking Table ── */}
          <div style={{
            background: 'linear-gradient(145deg,rgba(36,36,56,0.97),rgba(18,18,36,0.95))',
            backdropFilter: 'blur(18px)',
            borderRadius: 24,
            border: '2px solid rgba(255,215,0,0.28)',
            boxShadow: '0 28px 70px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            animation: 'fadeInUp 1.1s ease-out 0.35s both',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '90px 1fr 160px 160px',
              padding: '20px 36px',
              background: 'linear-gradient(135deg,#FFD700,#FF8C00)',
              fontWeight: 900, fontSize: 13,
              letterSpacing: 1.5, color: '#1a1a2e',
              textTransform: 'uppercase',
            }}>
              {['Hạng', 'Nhân vật', activeTab === 'sucmanh' ? 'Sức mạnh' : 'Vàng', activeTab === 'sucmanh' ? 'Đệ tử' : 'Ngọc'].map(h => (
                <div key={h} style={{ textAlign: 'center' }}>{h}</div>
              ))}
            </div>

            {/* Table body */}
            <div className="rank-scroll" style={{ maxHeight: 560, overflowY: 'auto' }}>
              {users.length > 0 ? (
                users.map((user, i) => (
                  <div
                    key={user.id || i}
                    className="rank-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '90px 1fr 160px 160px',
                      padding: '16px 36px',
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                      alignItems: 'center',
                      transition: 'all 0.25s ease',
                      cursor: 'default',
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                      animation: `slideInLeft 0.5s ease-out ${i * 0.05}s both`,
                    }}
                  >
                    {/* Rank */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <RankBadge rank={user.rank!} />
                    </div>

                    {/* Player info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 12 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img
                          className="row-avatar"
                          src={user.avatarUrl || '/assets/524.png'}
                          alt="avatar"
                          width={52} height={52}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/524.png'; }}
                          style={{
                            width: 52, height: 52, borderRadius: '50%',
                            border: `3px solid ${user.rank! <= 3 ? '#FFD700' : 'rgba(255,215,0,0.3)'}`,
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            display: 'block',
                          }}
                        />
                        {user.rank! <= 3 && (
                          <div style={{
                            position: 'absolute', bottom: -4, right: -4,
                            fontSize: 14, lineHeight: 1,
                          }}>
                            {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                          </div>
                        )}
                      </div>
                      <span style={{
                        fontWeight: 700, fontSize: 16, color: '#eee',
                        letterSpacing: '0.3px',
                      }}>
                        {user.gameName || 'Ẩn danh'}
                      </span>
                    </div>

                    {/* Stat 1 */}
                    <div style={{
                      textAlign: 'center', fontWeight: 800,
                      fontSize: 17, color: '#FFD700',
                      textShadow: '0 2px 8px rgba(255,215,0,0.35)',
                    }}>
                      {activeTab === 'sucmanh' ? user.formattedSucManh : user.formattedVang}
                    </div>

                    {/* Stat 2 */}
                    <div style={{
                      textAlign: 'center', fontWeight: 800,
                      fontSize: 17, color: '#FFD700',
                      textShadow: '0 2px 8px rgba(255,215,0,0.35)',
                    }}>
                      {activeTab === 'sucmanh' ? user.formattedSucManhDeTu : user.formattedNgoc || '0'}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: 'center', padding: '80px 20px',
                  color: '#6b7280', fontSize: 18, fontWeight: 600,
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                  Chưa có dữ liệu xếp hạng
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Bangxh;