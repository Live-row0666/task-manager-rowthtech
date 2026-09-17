// @flow
import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import reducers from './reducers';
import rootSaga from './sagas';
import logger from 'redux-logger';
const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware,logger];

export function configureStore(initialState: {}): any {
    // const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'];
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store = createStore(reducers, initialState, composeEnhancers(applyMiddleware(...middlewares)));
    sagaMiddleware.run(rootSaga);
    return store;
}
