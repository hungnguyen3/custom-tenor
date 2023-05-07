import { clearCollections, Collection, populateCollections } from '../../slices/CollectionsSlice';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { NextRouter } from 'next/router';
import { getPublicCollections } from '../../API/CollectionService';
import { CollectionDTO } from '../../types/DTOs/CollectionDTOs';
import { isResponseMessageSuccess, ResponseMessage } from '../../types/ResponseMessage';
import { getGiffiesByCollectionId } from '../../API/GiffyService';
import { GiffyDTO } from '../../types/DTOs/GiffyDTOs';

interface onDiscoveryRoutePopulationProps {
	dispatch: ThunkDispatch<any, any, any>;
	router: NextRouter;
}

// Function to populate collections
const populateCollectionsInfo = (dispatch: ThunkDispatch<any, any, any>) => {
	return new Promise((resolve, reject) => {
		getPublicCollections(10)
			.then((getPublicCollectionsRes: ResponseMessage<CollectionDTO[]>) => {
				if (!isResponseMessageSuccess(getPublicCollectionsRes)) {
					return reject();
				}

				var collections = getPublicCollectionsRes.data!;

				var toStoreCollections: Collection[] = [];

				const promises = collections.map(async (collection: CollectionDTO) => {
					const getGiffiesByCollectionIdRes = await getGiffiesByCollectionId(Number(collection.collectionId));
					if (!isResponseMessageSuccess(getGiffiesByCollectionIdRes)) {
						return null;
					}
					var giffies: GiffyDTO[] = getGiffiesByCollectionIdRes.data!;
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
				});

				Promise.all(promises).then(() => {
					dispatch(populateCollections(toStoreCollections));

					const collectionIds = collections.map((collection: CollectionDTO) => collection.collectionId);
					resolve(collectionIds.length > 0 ? Math.min(...collectionIds) : 0);
				});
			})
			.catch(() => {
				reject();
			});
	});
};

export const onDiscoveryRoutePopulation = (props: onDiscoveryRoutePopulationProps) => {
	const { dispatch, router } = props;

	// clear collections every time we change route
	dispatch(clearCollections());

	//  TODO: on auth change, discovery page should be populated with user's collections
};