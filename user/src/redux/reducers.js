import { combineReducers } from 'redux';

// Essential reducers for user functionality
import Auth from './auth/reducers';
import Layout from './layout/reducers';
import { createTicket, getAllTickets, getTicketById, updateTicket, updateTicketResponse } from './support/reducer';

export default combineReducers({
    Auth,
    Layout,
    // SUPPORT
    getAllTickets, createTicket, updateTicket, updateTicketResponse, getTicketById,
});
