import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { io } from 'socket.io-client';
import { mockGet } from '../helpers/api/apiCore';
import DependencyAlerts, { getOutstandingDependencies } from './DependencyAlerts';

jest.mock('../helpers/api/apiCore', () => {
    const mockGet = jest.fn();
    return { mockGet, APICore: class { get(...args) { return mockGet(...args); } } };
});
jest.mock('react-router-dom', () => {
    const React = require('react');
    return { Link: React.forwardRef(({ to, children, ...props }, ref) => <a ref={ref} href={to} {...props}>{children}</a>) };
});
jest.mock('socket.io-client', () => ({ io: jest.fn() }));

const rows = [
    { _id: 'low', title: 'Low item', priority: 'low', status: 'pending' },
    { _id: 'done', title: 'Completed item', priority: 'urgent', status: 'completed' },
    { _id: 'medium', title: 'Medium item', priority: 'medium', status: 'in_review' },
    { _id: 'approved', title: 'Approved item', priority: 'urgent', status: 'approved' },
    { _id: 'high', title: 'High item', priority: 'high', status: 'pending' },
    { _id: 'submitted', title: 'Submitted item', priority: 'urgent', status: 'submitted' },
    { _id: 'urgent', title: 'Urgent item', description: 'Provide the production token', priority: 'urgent', status: 'rejected' },
];

test('excludes approved, completed and submitted dependencies and sorts outstanding statuses by priority', () => {
    expect(getOutstandingDependencies(rows).map(dep => dep._id)).toEqual(['urgent', 'high', 'medium', 'low']);
    expect(rows[0]._id).toBe('low');
});

test('loads all dependencies and removes completed alerts after a live update', async () => {
    const get = mockGet;
    get.mockResolvedValue({ data: { data: rows } });
    const handlers = {};
    const socket = { on: jest.fn((event, handler) => { handlers[event] = handler; }), emit: jest.fn(), disconnect: jest.fn() };
    io.mockReturnValue(socket);
    const { unmount } = render(<DependencyAlerts userId="client-1" />);
    const toggle = await screen.findByRole('button', { name: 'Dependency alerts: 4 outstanding' });
    fireEvent.click(toggle);
    await screen.findByText('Urgent item');
    expect(screen.queryByText('Completed item')).toBeNull();
    expect(screen.queryByText('Approved item')).toBeNull();
    expect(screen.queryByText('Submitted item')).toBeNull();
    expect(screen.getByText('Provide the production token')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Urgent item/ }).getAttribute('href')).toBe('/dashboard/dependencies?dependency=urgent');
    expect(get).toHaveBeenCalledWith('/api/v1/client/dependency');
    get.mockResolvedValue({ data: { data: rows.map(dep => ({ ...dep, status: 'completed' })) } });
    handlers.dependency_status_changed();
    expect(await screen.findByText('No outstanding dependencies.')).toBeTruthy();
    unmount();
    expect(socket.disconnect).toHaveBeenCalled();
});
