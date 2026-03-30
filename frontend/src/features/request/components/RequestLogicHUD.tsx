import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    priority: string;
}

const RequestLogicHUD: React.FC<Props> = ({ priority }) => {
    return (
        <div className="hud-compact-view" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="text-12 text-muted fw-700">PRIORITY:</div>
            <motion.div 
                key={priority}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`hud-priority-badge ${priority?.toLowerCase()}`}
                style={{ fontSize: '14px', padding: '4px 16px' }}
            >
                {priority}
            </motion.div>
        </div>
    );
};

export default RequestLogicHUD;
