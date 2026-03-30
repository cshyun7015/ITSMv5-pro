import { useState, useEffect, useCallback } from 'react';
import { apiRequest, type RequestItem } from '../api/apiRequest';
import apiUser from '../../../api/apiUser';

export const useRequestList = () => {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [userMap, setUserMap] = useState<{ [key: string]: string }>({});

    // Pagination & Sort
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    // Filters
    const [filters, setFilters] = useState({
        title: '',
        requesterId: '',
        fromDate: (function() {
            const d = new Date();
            d.setMonth(d.getMonth() - 1);
            return d.toISOString().split('T')[0];
        })(),
        toDate: new Date().toISOString().split('T')[0]
    });

    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiRequest.getRequests({
                title: filters.title || undefined,
                requesterId: filters.requesterId || undefined,
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined,
                page,
                size,
                sort: `${sortBy},${sortDir}`
            });
            setRequests(res.data.content);
            setTotalElements(res.data.totalElements);
        } catch (err) {
            console.error('Failed to load requests', err);
        } finally {
            setLoading(false);
        }
    }, [filters, page, size, sortBy, sortDir]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await apiUser.list({ size: 2000 });
                const map: { [key: string]: string } = {};
                res.content.forEach((u: any) => { map[u.userId] = u.name; });
                setUserMap(map);
            } catch (err) {
                console.error('Failed to load users for mapping', err);
            }
        };
        loadUsers();
    }, []);

    const handleSearch = () => {
        setPage(0);
        loadRequests();
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
        setPage(0);
    };

    return {
        requests,
        loading,
        userMap,
        page,
        setPage,
        size,
        totalElements,
        sortBy,
        sortDir,
        handleSort,
        filters,
        setFilters,
        handleSearch,
        loadRequests
    };
};
