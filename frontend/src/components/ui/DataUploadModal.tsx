'use client';

import { useState } from 'react';
import styles from './DataUploadModal.module.css';

interface DataUploadModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onUpload?: () => void; // UI용이므로 실제 구현은 안 함
}

export default function DataUploadModal({ title, isOpen, onClose, onUpload }: DataUploadModalProps) {
  const [uploadOption, setUploadOption] = useState('overwrite');
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>📥 {title} 데이터 업로드</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          {/* 드래그 앤 드롭 영역 UI Mock */}
          <div className={styles.dropzone}>
            <div className={styles.dropzoneIcon}>📎</div>
            <p>파일을 여기에 드래그하거나<br /><strong>클릭하여 선택하세요</strong></p>
            <span className={styles.dropzoneHint}>지원 형식: .xlsx, .xls</span>
            <input 
              type="file" 
              className={styles.fileInput} 
              accept=".xlsx, .xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {file && (
            <div className={styles.fileInfo}>
              <span>📄 {file.name}</span>
              <button className={styles.removeFileBtn} onClick={() => setFile(null)}>✕</button>
            </div>
          )}

          <div className={styles.templateSection}>
            <p className={styles.templateDesc}>업로드 전 템플릿 양식에 맞춰 데이터를 준비해 주세요.</p>
            <button className={styles.templateBtn}>📄 템플릿 다운로드</button>
          </div>

          <div className={styles.optionSection}>
            <label className={styles.optionLabel}>중복 처리 방식</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="uploadOption" 
                  value="skip" 
                  checked={uploadOption === 'skip'} 
                  onChange={(e) => setUploadOption(e.target.value)} 
                />
                건너뛰기 (기존 데이터 유지)
              </label>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="uploadOption" 
                  value="overwrite" 
                  checked={uploadOption === 'overwrite'} 
                  onChange={(e) => setUploadOption(e.target.value)} 
                />
                덮어쓰기 (새 데이터로 업데이트)
              </label>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
          <button 
            className={styles.uploadBtn} 
            disabled={!file}
            onClick={() => {
              if (onUpload) onUpload();
              alert('실무 데이터 연동 확장을 위해 준비된 데모 UI입니다.');
              onClose();
            }}
          >
            데이터 업로드
          </button>
        </div>
      </div>
    </div>
  );
}
