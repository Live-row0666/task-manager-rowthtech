import PreSaleType from "./constant";

const GET_PRE_SALE_INTIAL_STATE={
    getPreSale: [],
    loading: false
}

const ADD_PRE_SALE_INTIAL_STATE={
    addPreSale: [],
    loading: false
}

const UPDATE_PRE_SALE_INTIAL_STATE={
    updatePreSale: [],
    loading: false
}

const DELETE_PRE_SALE_INTIAL_STATE={
    deletePreSale: [],
    loading: false
}



export const getPreSaleReducer = (state = GET_PRE_SALE_INTIAL_STATE, action) => {
    switch (action.type) {
        case PreSaleType.GET_PRE_SALE_FIRST:
            return {
                data: GET_PRE_SALE_INTIAL_STATE.data,
                loading: true,
            };
        case PreSaleType.GET_PRE_SALE_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case PreSaleType.GET_PRE_SALE_ERROR:
            return {
                data: action?.payload,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const addPreSaleReducer = (state = ADD_PRE_SALE_INTIAL_STATE, action) => {
    switch (action.type) {
        case PreSaleType.ADD_PRE_SALE_LOADING:
            return {
                data: ADD_PRE_SALE_INTIAL_STATE.data,
                loading: true,
            };
        case PreSaleType.ADD_PRE_SALE_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case PreSaleType.ADD_PRE_SALE_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
            case PreSaleType.ADD_PRE_SALE_RESET:
            return ADD_PRE_SALE_INTIAL_STATE
        default:
            return { ...state };

    }
};


export const updatePreSaleReducer = (state = UPDATE_PRE_SALE_INTIAL_STATE, action) => {
    switch (action.type) {
        case PreSaleType.UPDATE_PRE_SALE_LOADING:
            return {
                updatePreSale: UPDATE_PRE_SALE_INTIAL_STATE.updatePreSale,
                loading: true,
            };
        case PreSaleType.UPDATE_PRE_SALE_SUCCESS:
            return {
                updatePreSale: action?.payload,
                loading: false,
            };
        case PreSaleType.UPDATE_PRE_SALE_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
            case PreSaleType.UPDATE_PRE_SALE_RESET:
            return UPDATE_PRE_SALE_INTIAL_STATE
        default:
            return { ...state };

    }
};


export const deletePreSaleReducer = (state = DELETE_PRE_SALE_INTIAL_STATE, action) => {
    switch (action.type) {
        case PreSaleType.DELETE_PRE_SALE_LOADING:
            return {
                deletePreSale: state.deletePreSale,
                loading: true,
            };
        case PreSaleType.DELETE_PRE_SALE_SUCCESS:
            return {
                deletePreSale: action?.payload,
                loading: false,
            };
        case PreSaleType.DELETE_PRE_SALE_ERROR:
            return {
                deletePreSale: [],
                loading: false,
                message: action?.payload,
            };
            case PreSaleType.DELETE_PRE_SALE_RESET:
                return DELETE_PRE_SALE_INTIAL_STATE
        default:
            return { ...state };
    }
};


