import React from 'react';
import { motion } from 'framer-motion';
import type { CommonCode } from '../../../api/apiCommonCode';

interface Props {
    impactCode: string;
    urgencyCode: string;
    priority: string;
    codes: { [key: string]: CommonCode[] };
}

const RequestLogicHUD: React.FC<Props> = ({ impactCode, urgencyCode, priority, codes }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="logic-hud-panel"
            style={{ margin: '24px 0 48px' }}
        >
            <div className="hud-content">
                <div className="hud-item">
                    <label>IMPACT</label>
                    <div className="hud-value">{codes.SR_IMPACT?.find(c => c.codeId === impactCode)?.codeName || '-'}</div>
                </div>
                <div className="hud-operator">×</div>
                <div className="hud-item">
                    <label>URGENCY</label>
                    <div className="hud-value">{codes.SR_URGENCY?.find(c => c.codeId === urgencyCode)?.codeName || '-'}</div>
                </div>
                <div className="hud-operator">=</div>
                <div className="hud-item">
                    <label>PRIORITY</label>
                    <motion.div 
                        key={priority}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`hud-priority-badge ${priority?.toLowerCase()}`}
                    >
                        {priority}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default RequestLogicHUD;
