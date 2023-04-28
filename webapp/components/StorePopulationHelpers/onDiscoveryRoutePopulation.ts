import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { logIn, logOut, UserAuth } from '../../slices/UserAuthSlice';
import { clearUser, populateUser } from '../../slices/UserSlice';
import {
	CollectionDTO,
	GetPublicCollectionsDTO,
	isGetPublicCollectionsDTO,
} from '../../API/types/collections-types';
import {
	GetGiffiesByCollectionIdDTO,
	GiffyDTO,
	isGetGiffiesByCollectionIdDTO,
} from '../../API/types/giffies-types';
import {
	clearCollections,
	Collection,
	populateCollections,
} from '../../slices/CollectionsSlice';
import { app } from '../Firebase/FirebaseInit';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { NextRouter } from 'next/router';
import { Dispatch, SetStateAction } from 'react';
import { ErrorDTO } from '../../API/types/errors-types';
import { getPublicCollections } from '../../API/collectionHooks';
import { getGiffiesByCollectionId } from '../../API/giffyHooks';
import { populateUserInfo } from './onCollectionsRoutePopulation';

interface onDiscoveryRoutePopulationProps {
	dispatch: ThunkDispatch<any, any, any>;
	router: NextRouter;
	setLoggedIn: Dispatch<SetStateAction<boolean>>;
}

// Function to populate collections
const populateCollectionsInfo = (dispatch: ThunkDispatch<any, any, any>) => {
	return new Promise((resolve, reject) => {
		getPublicCollections(10)
			.then((response: GetPublicCollectionsDTO | ErrorDTO) => {
				if (!isGetPublicCollectionsDTO(response)) {
					return reject();
				}

				var collections = response.data;

				var toStoreCollections: Collection[] = [];

				const promises = collections.map((collection: CollectionDTO) => {
					return getGiffiesByCollectionId(Number(collection.collectionId)).then(
						(response: ErrorDTO | GetGiffiesByCollectionIdDTO) => {
							if (!isGetGiffiesByCollectionIdDTO(response)) {
								return null;
							}
							var giffies: GiffyDTO[] = response.data;

							toStoreCollections = [
								...toStoreCollections,
								{
									collectionId: collection.collectionId,
									collectionName: collection.collectionName,
									private: collection.private,
									giffies: giffies,
									users: {},
								},
							];
						}
					);
				});

				Promise.all(promises).then(() => {
					dispatch(populateCollections(toStoreCollections));

					const collectionIds = collections.map(
						(collection: CollectionDTO) => collection.collectionId
					);
					resolve(collectionIds.length > 0 ? Math.min(...collectionIds) : 0);
				});
			})
			.catch(() => {
				reject();
			});
	});
};

export const onDiscoveryRoutePopulation = (
	props: onDiscoveryRoutePopulationProps
) => {
	const { dispatch, router, setLoggedIn } = props;

	// clear collections every time we change route
	dispatch(clearCollections());

	onAuthStateChanged(getAuth(app), user => {
		if (user) {
			// TODO: handle idToken
			const userAuth = {
				uid: user.uid,
				email: user.email,
				displayName: user.displayName,
				photoURL: user.photoURL,
			};

			populateUserInfo(dispatch)
				.then(() => {
					return populateCollectionsInfo(dispatch);
				})
				.then(firstCollectionId => {
					if (
						firstCollectionId !== null &&
						firstCollectionId !== undefined &&
						!router.route.includes('discovery')
					) {
						router.push(`/discovery/${firstCollectionId}`);
					}
				})
				.catch(() => {
					// TODO: need better logic here
					dispatch(clearCollections());
				});

			dispatch(logIn(userAuth));
			setLoggedIn(true);
		} else {
			populateCollectionsInfo(dispatch);
			dispatch(logOut());
			dispatch(clearUser());
			setLoggedIn(false);
		}
	});
};
