import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    status: string;
}

const flowStatesMapping = {
    'OPEN': 0,
    'ASSIGNED': 1,
    'IN_PROGRESS': 1,
    'ON_HOLD': 1,
    'RESOLVED': 2,
    'CLOSED': 3,
    'CANCELLED': 3
};

const flowStates = ['접수됨', '처리중', '해결됨', '완료됨'];

const RequestStatusStepper: React.FC<Props> = ({ status }) => {
    const currentFlowIndex = flowStatesMapping[status as keyof typeof flowStatesMapping] ?? 0;

    return (
        <div className="premium-stepper-container">
            <div className="stepper-track">
                {flowStates.map((state, idx) => (
                    <React.Fragment key={state}>
                        <div className={`stepper-node ${idx <= currentFlowIndex ? 'active' : ''} ${idx === currentFlowIndex ? 'current' : ''}`}>
                            <div className="node-circle">
                                {idx === currentFlowIndex && (
                                    <motion.div 
                                        layoutId="active-glow"
                                        className="node-inner"
                                        initial={false}
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        style={{ background: 'radial-gradient(circle, hsl(var(--brand-primary)), transparent)' }}
                                    />
                                )}
                                <span className="node-idx">{idx + 1}</span>
                            </div>
                            <span className="node-label">
                                {state}
                            </span>
                        </div>
                        {idx < flowStates.length - 1 && (
                            <div className={`stepper-connector ${idx < currentFlowIndex ? 'active' : ''}`}>
                                {idx < currentFlowIndex && <div className="connector-glow" />}
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default RequestStatusStepper;
