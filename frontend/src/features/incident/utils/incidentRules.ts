export const DEFAULT_INCIDENT_TRANSITIONS: Record<string, string[]> = {
  NEW: ['ASSIGNED', 'ON_HOLD', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS', 'ON_HOLD', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'ON_HOLD', 'ASSIGNED'],
  ON_HOLD: ['IN_PROGRESS', 'ASSIGNED', 'CLOSED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: []
};

export const EDITABLE_FIELDS_BY_STATUS: Record<string, string[]> = {
  NEW: ['title', 'description', 'impact', 'urgency', 'isMajorIncident', 'channel', 'affectedUserId', 'categoryId', 'subCategoryId', 'serviceId', 'ciId', 'requesterId'],
  ASSIGNED: ['title', 'description', 'impact', 'urgency', 'isMajorIncident', 'categoryId', 'subCategoryId', 'serviceId', 'ciId', 'assignmentGroupId', 'assigneeId'],
  IN_PROGRESS: ['title', 'description', 'impact', 'urgency', 'isMajorIncident', 'categoryId', 'subCategoryId', 'serviceId', 'ciId', 'assignmentGroupId', 'assigneeId', 'workaround', 'resolutionCode'],
  ON_HOLD: ['onHoldReason', 'impact', 'urgency', 'isMajorIncident'],
  RESOLVED: ['resolutionCode', 'workaround'],
  CLOSED: []
};

export const canEditField = (status: string, field: string): boolean => {
  if (field === 'status') return true; // Status can ALWAYS be changed if transition is permitted
  const editableFields = EDITABLE_FIELDS_BY_STATUS[status] || [];
  return editableFields.includes(field);
};

export const canTransition = (current: string, next: string, transitions?: Record<string, string[]>): boolean => {
  const rules = transitions || DEFAULT_INCIDENT_TRANSITIONS;
  const allowed = rules[current] || [current];
  return allowed.includes(next);
};
