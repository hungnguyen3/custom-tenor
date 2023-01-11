import { createSlice } from '@reduxjs/toolkit';
import finalPropsSelectorFactory from 'react-redux/es/connect/selectorFactory';
import { giffyDTO } from '../API/DTO';

export interface Collection {
	collectionId: number;
	collectionName: string;
	private: boolean;
	giffies: giffyDTO[];
}

interface CollectionsState {
	value: Collection[];
	selectedGiffyIds: number[];
	selectedCollectionToDelete: number | null;
	isUploadGiffyWindowOpen: boolean;
	isCreateNewCollectionWindowOpen: boolean;
	isDeleteGiffyConfirmationWindowOpen: boolean;
}

const initialState: CollectionsState = {
	value: [],
	selectedGiffyIds: [],
	selectedCollectionToDelete: null,
	isUploadGiffyWindowOpen: false,
	isCreateNewCollectionWindowOpen: false,
	isDeleteGiffyConfirmationWindowOpen: false,
};

export const collectionsSlice = createSlice({
	name: 'collections',
	initialState,
	reducers: {
		populateCollections: (
			state,
			action: {
				payload: Collection[];
				type: string;
			}
		) => {
			const collectionsValue: Collection[] = action.payload;
			state.value = collectionsValue;
		},
		clearCollections: state => {
			state.value = [];
		},
		selectACollectionToDelete: (state, action: { payload: number }) => {
			state.selectedCollectionToDelete = action.payload;
		},
		unselectACollectionToDelete: state => {
			state.selectedCollectionToDelete = null;
		},
		openUploadGiffyWindow: state => {
			state.isUploadGiffyWindowOpen = true;
		},
		closeUploadGiffyWindow: state => {
			state.isUploadGiffyWindowOpen = false;
		},
		openCreateNewCollectionWindow: state => {
			state.isCreateNewCollectionWindowOpen = true;
		},
		closeCreateNewCollectionWindow: state => {
			state.isCreateNewCollectionWindowOpen = false;
		},
		openDeleteGiffyConfirmationWindow: state => {
			state.isDeleteGiffyConfirmationWindowOpen = true;
		},
		closeDeleteGiffyConfirmationWindow: state => {
			state.isDeleteGiffyConfirmationWindowOpen = false;
		},
		addGiffyToACollection: (
			state,
			action: {
				payload: giffyDTO;
			}
		) => {
			if (state.value) {
				for (let i = 0; i < state.value.length; i++) {
					if (state.value[i].collectionId === action.payload.collectionId) {
						state.value[i].giffies.push(action.payload);
					}
				}
			}
		},
		removeGiffyFromACollection: (
			state,
			action: {
				payload: {
					collectionId: number;
					giffyId: number;
				};
			}
		) => {
			if (state.value) {
				for (let i = 0; i < state.value.length; i++) {
					if (state.value[i].collectionId === action.payload.collectionId) {
						var giffiesClone = [...state.value[i].giffies];

						var giffiesAfterRemoval = giffiesClone.filter(
							giffy => giffy.giffyId !== action.payload.giffyId
						);

						state.value[i].giffies = giffiesAfterRemoval;
					}
				}
			}
		},
		addNewCollection: (
			state,
			action: {
				payload: Collection;
			}
		) => {
			state.value?.push(action.payload);
		},
		addSelectedGiffy: (state, action: { payload: number }) => {
			state.selectedGiffyIds.push(action.payload);
		},
		removeSelectedGiffy: (state, action: { payload: number }) => {
			// Remove from selectedGiffies, but not from Redux giffies list
			const index = state.selectedGiffyIds.indexOf(action.payload);
			if (index !== -1) state.selectedGiffyIds.splice(index, 1);
		},
		clearSelectedGiffy: state => {
			state.selectedGiffyIds = [];
		},
		selectAllGiffiesByCollectionId: (state, action: { payload: number }) => {
			if (state.value) {
				for (let i = 0; i < state.value.length; i++) {
					if (state.value[i].collectionId === action.payload) {
						state.value[i].giffies.forEach(giffy => {
							state.selectedGiffyIds.push(giffy.giffyId);
						});
					}
				}
			}
		},
	},
});

export const {
	populateCollections,
	clearCollections,
	selectACollectionToDelete,
	unselectACollectionToDelete,
	openUploadGiffyWindow,
	closeUploadGiffyWindow,
	openCreateNewCollectionWindow,
	closeCreateNewCollectionWindow,
	addGiffyToACollection,
	removeGiffyFromACollection,
	addNewCollection,
	addSelectedGiffy,
	removeSelectedGiffy,
	openDeleteGiffyConfirmationWindow,
	closeDeleteGiffyConfirmationWindow,
	clearSelectedGiffy,
	selectAllGiffiesByCollectionId,
} = collectionsSlice.actions;

export default collectionsSlice.reducer;
