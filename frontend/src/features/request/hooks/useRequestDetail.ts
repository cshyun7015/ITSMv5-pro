import { useState, useEffect, useCallback } from 'react';
import { apiRequest, type RequestItem, type RequestComment } from '../api/apiRequest';
import apiUser, { type UserDTO } from '../../../api/apiUser';
import { apiCommonCode, type CommonCode } from '../../../api/apiCommonCode';

export const useRequestDetail = (requestId: number) => {
    const [request, setRequest] = useState<RequestItem | null>(null);
    const [comments, setComments] = useState<RequestComment[]>([]);
    const [agents, setAgents] = useState<UserDTO[]>([]);
    const [userMap, setUserMap] = useState<{[key: string]: string}>({});
    const [codes, setCodes] = useState<{ [key: string]: CommonCode[] }>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const loadDetail = useCallback(async () => {
        try {
            setLoading(true);
            const [reqRes, comRes, userRes] = await Promise.all([
                apiRequest.getRequest(requestId),
                apiRequest.getComments(requestId),
                apiUser.list({ size: 1000 })
            ]);
            
            setRequest(reqRes.data);
            setComments(comRes.data);

            const map: {[key: string]: string} = {};
            userRes.content.forEach((u: UserDTO) => { map[u.userId] = u.name; });
            setUserMap(map);

            const codesToFetch = ['SR_STATUS', 'SR_TYPE', 'SR_CATEGORY', 'SR_IMPACT', 'SR_URGENCY', 'SR_RESOLUTION'];
            const codeResponses = await Promise.all(
                codesToFetch.map(group => apiCommonCode.getCodesByGroup(group))
            );
            
            const newCodes: { [key: string]: CommonCode[] } = {};
            codesToFetch.forEach((group, idx) => {
                newCodes[group] = codeResponses[idx].data;
            });
            setCodes(newCodes);

            const filteredAgents = userRes.content.filter((u: UserDTO) => 
                u.companyId === 'MSP' && (u.role === 'ROLE_ADMIN' || u.role === 'ROLE_OPERATOR' || u.role === 'ROLE_MANAGER')
            );
            setAgents(filteredAgents);
        } catch (err) {
            console.error('Failed to load request detail', err);
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        loadDetail();
    }, [loadDetail]);

    const updateRequest = async (data: Partial<RequestItem>) => {
        try {
            setIsSaving(true);
            await apiRequest.updateRequest(requestId, data as RequestItem);
            await loadDetail();
            return true;
        } catch (err) {
            console.error('Failed to update request', err);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const addComment = async (content: string, isInternal: boolean) => {
        const storedUser = localStorage.getItem('authUser');
        const authUser = storedUser ? JSON.parse(storedUser) : null;
        
        try {
            await apiRequest.addComment(requestId, {
                requestId: requestId,
                authorId: authUser?.userId || 'system',
                content,
                isInternal
            } as RequestComment);
            const comRes = await apiRequest.getComments(requestId);
            setComments(comRes.data);
            return true;
        } catch (err) {
            console.error('Failed to add comment', err);
            return false;
        }
    };

    return {
        request,
        comments,
        agents,
        userMap,
        codes,
        loading,
        isSaving,
        updateRequest,
        addComment,
        refresh: loadDetail
    };
};
