import React, { useState } from 'react';
import { useApp, TAG_COLORS, TAG_BG_COLORS, AREA_COLORS, type VaultItem, type VaultItemType, type LifeArea } from '../context/AppContext';
import { Icons } from '../components/Icons';

const AREA_SHORT: Record<LifeArea, string> = {
  'Career & Skills': 'Career', 'Health & Body': 'Health', 'Mind & Learning': 'Mind',
  'Finance': 'Finance', 'Relationships': 'Relationships', 'Creative': 'Creative',
};
const ALL_AREAS: LifeArea[] = ['Career & Skills', 'Health & Body', 'Mind & Learning', 'Finance', 'Relationships', 'Creative'];
const VAULT_TAGS = ['Remember why I started', 'When I want to quit', 'When I feel lost', 'When I failed', 'When I feel weak', 'When I win'];
const VAULT_TYPES: VaultItemType[] = ['Quote', 'Video', 'Voice Note', 'Image', 'Note', 'Win'];

const typeIcon = (type: VaultItemType) => {
  switch (type) {
    case 'Quote': return Icons.quote();
    case 'Video': return Icons.video();
    case 'Voice Note': return Icons.voiceNote();
    case 'Image': return Icons.image();
    case 'Note': return Icons.note();
    case 'Win': return Icons.win();
  }
};

const BottomSheet = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', transition: 'opacity 250ms ease' }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--surface-2)',
        borderRadius: '20px 20px 0 0', padding: '12px 20px 32px', maxHeight: '80vh', overflowY: 'auto',
        animation: 'slideUp 250ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--surface-3)', margin: '0 auto 20px' }} />
        {children}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
};

const VaultDeliveryOverlay = ({ items, open, onClose }: { items: VaultItem[]; open: boolean; onClose: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!open || items.length === 0) return null;
  const item = items[currentIndex % items.length];

  const showAnother = () => {
    setCurrentIndex(i => (i + 1) % items.length);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'linear-gradient(to bottom, #1A1560, #08080F)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'vaultOverlayIn 300ms ease',
      padding: 24,
    }}>
      <style>{`
        @keyframes vaultOverlayIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vaultContentFade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div style={{ position: 'absolute', top: 48, left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-muted)' }}>
          Your past self saved this for you {item.daysAgo} days ago
        </span>
      </div>

      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.5)', padding: 8, display: 'flex',
      }}>{Icons.close()}</button>

      <div key={currentIndex} style={{ textAlign: 'center', maxWidth: 280, animation: 'vaultContentFade 150ms ease' }}>
        {(item.type === 'Quote' || item.type === 'Note' || item.type === 'Win') && (
          <>
            {item.type === 'Quote' && <div style={{ marginBottom: 16 }}>{Icons.quoteOpen()}</div>}
            <p style={{ fontSize: 18, fontWeight: 400, fontStyle: 'italic', color: '#EEEDF8', lineHeight: 1.7, margin: 0 }}>
              {item.content}
            </p>
          </>
        )}
        {item.type === 'Video' && (
          <>
            <p style={{ fontSize: 18, fontWeight: 400, fontStyle: 'italic', color: '#EEEDF8', lineHeight: 1.7, margin: 0 }}>
              {item.content}
            </p>
            <button style={{
              marginTop: 16, background: 'none', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8, padding: '8px 16px', color: 'var(--primary)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter',
            }}>Open video →</button>
          </>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: 32, left: 24, right: 24, display: 'flex', gap: 12 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: 'var(--teal)', color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: 'Inter',
        }}>This helped</button>
        <button onClick={showAnother} style={{
          flex: 1, padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: 'var(--surface-2)', color: '#EEEDF8', fontSize: 14, fontWeight: 500, fontFamily: 'Inter',
        }}>Show another</button>
      </div>
    </div>
  );
};

const Vault = () => {
  const { vaultItems, addVaultItem, theme } = useApp();
  const [showDelivery, setShowDelivery] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showItemDetail, setShowItemDetail] = useState<VaultItem | null>(null);
  const [newType, setNewType] = useState<VaultItemType>('Quote');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newArea, setNewArea] = useState<LifeArea | ''>('');

  const handleAddSubmit = () => {
    if (!newContent.trim() || !newTag) return;
    addVaultItem({ type: newType, tag: newTag, tagColor: TAG_COLORS[newTag] || 'var(--text-muted)', content: newContent.trim(), daysAgo: 0 });
    setNewContent(''); setNewTag(''); setNewType('Quote'); setNewArea('');
    setShowAddSheet(false);
  };

  const autoTriggerLog = [
    { text: '3 days ago — Relationships score dropped below 40', daysAgo: 3 },
    { text: '11 days ago — Missed workout 3 days in a row', daysAgo: 11 },
    { text: '28 days ago — Day rated 1 out of 5', daysAgo: 28 },
  ];

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: -1,
        background: theme === 'dark'
          ? 'linear-gradient(to bottom, #1A1560, #08080F)'
          : '#EEEAFF',
        transition: 'background 300ms ease',
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>Your armoury.</h1>
          <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: 8 }}>
            Everything your best self saved for your hardest days.
          </p>
        </div>

        {/* Emergency button */}
        <button
          onClick={() => setShowDelivery(true)}
          className="interactive"
          style={{
            width: '100%', height: 56, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'var(--primary)', color: '#fff', fontSize: 16, fontWeight: 500, fontFamily: 'Inter',
          }}
        >
          I need this right now →
        </button>

        {/* Vault items */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 500 }}>Your saved fuel</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{vaultItems.length} items</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {vaultItems.map(item => (
              <div
                key={item.id}
                onClick={() => setShowItemDetail(item)}
                className="interactive"
                style={{
                  background: theme === 'dark' ? 'rgba(17,17,25,0.85)' : 'var(--surface-1)',
                  border: '0.5px solid var(--border-strong)', borderRadius: 14, padding: 16, cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{typeIcon(item.type)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.type}</span>
                </div>
                <span style={{
                  display: 'inline-block', fontSize: 11, padding: '3px 8px', borderRadius: 20, marginBottom: 8,
                  background: TAG_BG_COLORS[item.tag] || 'var(--surface-3)',
                  color: TAG_COLORS[item.tag] || 'var(--text-muted)',
                }}>{item.tag}</span>
                <p style={{
                  fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{item.content}</p>
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.daysAgo === 0 ? 'Today' : `${item.daysAgo}d ago`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-trigger log */}
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>When your vault was surfaced</span>
          {autoTriggerLog.map((log, i) => (
            <div key={i} style={{
              fontSize: 12, color: 'var(--text-muted)', padding: 12,
              borderBottom: i < autoTriggerLog.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}>{log.text}</div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="interactive"
        style={{
          position: 'fixed', bottom: 80, right: 20, width: 56, height: 56, borderRadius: '50%',
          background: 'var(--primary)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 40,
        }}
      >{Icons.plus()}</button>

      {/* Vault Delivery */}
      <VaultDeliveryOverlay items={vaultItems} open={showDelivery} onClose={() => setShowDelivery(false)} />

      {/* Item detail */}
      <BottomSheet open={!!showItemDetail} onClose={() => setShowItemDetail(null)}>
        {showItemDetail && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{typeIcon(showItemDetail.type)}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{showItemDetail.type}</span>
              <span style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 20,
                background: TAG_BG_COLORS[showItemDetail.tag] || 'var(--surface-3)',
                color: TAG_COLORS[showItemDetail.tag] || 'var(--text-muted)',
              }}>{showItemDetail.tag}</span>
            </div>
            <p style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.7, margin: '16px 0' }}>{showItemDetail.content}</p>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {showItemDetail.daysAgo === 0 ? 'Saved today' : `Saved ${showItemDetail.daysAgo} days ago`}
            </span>
          </div>
        )}
      </BottomSheet>

      {/* Add vault sheet */}
      <BottomSheet open={showAddSheet} onClose={() => setShowAddSheet(false)}>
        <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 20 }}>Add to Vault</h3>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Type</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {VAULT_TYPES.map(t => (
            <button key={t} onClick={() => setNewType(t)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px',
              borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter', fontSize: 11,
              border: newType === t ? '1px solid var(--primary)' : '0.5px solid var(--border)',
              background: newType === t ? 'var(--primary-muted-bg)' : 'var(--surface-3)',
              color: newType === t ? 'var(--primary)' : 'var(--text-muted)',
            }}>
              <span style={{ display: 'flex' }}>{typeIcon(t)}</span>
              {t}
            </button>
          ))}
        </div>

        <textarea
          value={newContent} onChange={e => setNewContent(e.target.value)}
          placeholder="What do you want to save?" rows={4}
          style={{
            width: '100%', fontSize: 14, background: 'var(--surface-3)', border: '0.5px solid var(--border)',
            borderRadius: 10, padding: 12, color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
            resize: 'none',
          }}
        />

        <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '16px 0 8px' }}>Emotional tag</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {VAULT_TAGS.map(tag => (
            <button key={tag} onClick={() => setNewTag(tag)} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer', fontFamily: 'Inter',
              border: newTag === tag ? `1px solid ${TAG_COLORS[tag]}` : '0.5px solid var(--border)',
              background: newTag === tag ? (TAG_BG_COLORS[tag] || 'var(--surface-3)') : 'var(--surface-3)',
              color: newTag === tag ? (TAG_COLORS[tag] || 'var(--text-muted)') : 'var(--text-muted)',
            }}>{tag}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Life area (optional)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {ALL_AREAS.map(a => (
            <button key={a} onClick={() => setNewArea(newArea === a ? '' : a)} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20,
              fontSize: 11, cursor: 'pointer', fontFamily: 'Inter',
              border: newArea === a ? `1px solid ${AREA_COLORS[a]}` : '0.5px solid var(--border)',
              background: newArea === a ? `color-mix(in srgb, ${AREA_COLORS[a]} 15%, transparent)` : 'var(--surface-3)',
              color: newArea === a ? AREA_COLORS[a] : 'var(--text-muted)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: AREA_COLORS[a] }} />
              {AREA_SHORT[a]}
            </button>
          ))}
        </div>

        <button onClick={handleAddSubmit} className="interactive" style={{
          width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: 'Inter',
        }}>Save for my future self →</button>
      </BottomSheet>
    </>
  );
};

export default Vault;
