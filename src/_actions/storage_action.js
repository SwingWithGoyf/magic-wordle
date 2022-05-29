import { InitStorage } from '../_storage/StorageCommon';
import { storageConstants } from '../_constants/storage_constants';

export const userActions = {
    initStorage,
};

export function initStorage() {
    return dispatch => {

        InitStorage(function(initError) {
            if (!initError) {
                dispatch(success());
            } else {
                dispatch(failure(initError));
            }
        });
    };

    function success() { return { type: storageConstants.INITSTORAGE_SUCCESS } }
    function failure(error) { return { type: storageConstants.INITSTORAGE_FAILURE, error } }
}