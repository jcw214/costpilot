'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { HELP_CONTENT } from '@/lib/help-content';
import type { HelpSection } from '@/lib/help-content';
import styles from './HelpPanel.module.css';

/**
 * 마크다운 경량 파서 — 외부 라이브러리 없이 기본 문법만 지원
 */
function renderMarkdown(text: string): string {
  let html = text
    // 테이블 처리
    .replace(/\n\|(.+)\|\n\|[-| :]+\|\n((\|.+\|\n?)+)/g, (_match, header: string, body: string) => {
      const ths = header.split('|').filter(Boolean).map((h: string) => `<th>${h.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map((row: string) => {
        const tds = row.split('|').filter(Boolean).map((d: string) => `<td>${d.trim()}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<table class="${styles.mdTable}"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    // 볼드
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 리스트
    .replace(/^- (.+)$/gm, `<li>$1</li>`)
    // 연속된 li를 ul로 감싸기
    .replace(/((<li>.+<\/li>\n?)+)/g, `<ul class="${styles.mdList}">$1</ul>`)
    // 빈 줄 → 단락 구분
    .replace(/\n\n/g, '</p><p>')
    // 줄바꿈
    .replace(/\n/g, '<br/>');

  return `<p>${html}</p>`;
}

export default function HelpPanel() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const content = HELP_CONTENT[pathname];

  // 키보드 단축키: ? 키로 토글
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 페이지 이동 시 패널 닫기 및 아코디언 초기화
  useEffect(() => {
    setIsOpen(false);
    setExpandedIdx(0);
  }, [pathname]);

  if (!content) return null;

  return (
    <>
      {/* 도움말 아이콘 버튼 (우측 하단 FAB) */}
      <button
        className={styles.fab}
        onClick={() => setIsOpen((prev) => !prev)}
        title="도움말 열기 (?)"
        aria-label="도움말"
      >
        <span className={styles.fabIcon}>{isOpen ? '✕' : '?'}</span>
      </button>

      {/* 오버레이 */}
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

      {/* 슬라이드 패널 */}
      <aside className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitleGroup}>
            <span className={styles.panelBadge}>📖 가이드</span>
            <h2 className={styles.panelTitle}>{content.title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className={styles.panelBody}>
          {content.sections.map((section: HelpSection, idx: number) => (
            <div key={idx} className={styles.accordion}>
              <button
                className={`${styles.accordionTrigger} ${expandedIdx === idx ? styles.accordionActive : ''}`}
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              >
                <span className={styles.accordionTitle}>{section.heading}</span>
                <span className={styles.accordionChevron}>
                  {expandedIdx === idx ? '▾' : '▸'}
                </span>
              </button>
              <div
                className={`${styles.accordionContent} ${expandedIdx === idx ? styles.accordionExpanded : ''}`}
              >
                <div
                  className={styles.mdContent}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(section.body) }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.panelFooter}>
          <span className={styles.shortcutHint}>💡 <kbd>?</kbd> 키를 눌러 도움말을 열고 닫을 수 있습니다.</span>
        </div>
      </aside>
    </>
  );
}
