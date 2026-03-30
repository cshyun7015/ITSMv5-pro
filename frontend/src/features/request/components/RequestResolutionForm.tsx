import React from 'react';
import { motion } from 'framer-motion';
import type { CommonCode } from '../../../api/apiCommonCode';

interface Props {
    isAdmin: boolean;
    status: string;
    resolutionCode: string;
    resolutionText: string;
    setResolutionCode: (val: string) => void;
    setResolutionText: (val: string) => void;
    codes: { [key: string]: CommonCode[] };
    isAttributeEditable: (segment: 'RESOLUTION') => boolean;
    getEditableStyle: (segment: 'RESOLUTION') => React.CSSProperties;
}

const RequestResolutionForm: React.FC<Props> = ({ 
    isAdmin, 
    status, 
    resolutionCode, 
    resolutionText, 
    setResolutionCode, 
    setResolutionText, 
    codes,
    isAttributeEditable,
    getEditableStyle
}) => {
    if (!isAdmin || !(['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status))) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card field-set" 
            style={{ border: '1px solid hsla(var(--status-resolved), 0.2)', background: 'hsla(var(--status-resolved), 0.02)', marginTop: '24px', padding: '32px' }}
        >
            <div className="hud-label" style={{ position: 'static', marginBottom: '16px', color: 'hsl(var(--status-resolved))' }}>RESOLUTION DETAILS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="form-group">
                    <label>해결 코드</label>
                    <select 
                        disabled={!isAttributeEditable('RESOLUTION')} 
                        value={resolutionCode} 
                        onChange={e => setResolutionCode(e.target.value)}
                        style={getEditableStyle('RESOLUTION')}
                    >
                        <option value="">-- 해결 코드 선택 --</option>
                        {codes.SR_RESOLUTION?.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>처리 내용</label>
                    <textarea 
                        disabled={!isAttributeEditable('RESOLUTION')} 
                        value={resolutionText} 
                        onChange={e => setResolutionText(e.target.value)} 
                        style={{ minHeight: '100px', ...getEditableStyle('RESOLUTION') }} 
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default RequestResolutionForm;
