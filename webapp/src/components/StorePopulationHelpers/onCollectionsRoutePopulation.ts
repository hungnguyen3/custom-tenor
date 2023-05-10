import UserService from '../../API/UserService';
import { clearUser, populateUser, setFinishedAccountSetup } from '../../slices/UserSlice';
import { clearCollections, Collection, populateCollections, UserAccess } from '../../slices/CollectionsSlice';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { NextRouter } from 'next/router';
import { isResponseMessageSuccess, ResponseMessage } from '../../types/ResponseMessage';
import { UserDTO } from '../../types/DTOs/UserDTOs';
import { getCurrentUserCollections } from '../../API/CollectionService';
import { CollectionDTO, isGetCurrentUserCollectionsDTO } from '../../types/DTOs/CollectionDTOs';
import { getUsersByCollectionId } from '../../API/CollectionUserRelationshipService';
import { Permission } from '../../types/enums/Permission';
import { getGiffiesByCollectionId } from '../../API/GiffyService';
import { GiffyDTO } from '../../types/DTOs/GiffyDTOs';
import { Auth } from 'aws-amplify';

interface onCollectionsRoutePopulationProps {
	dispatch: ThunkDispatch<any, any, any>;
	router: NextRouter;
}

// Function to populate user information
export const populateUserInfo = (dispatch: ThunkDispatch<any, any, any>, currentUser: any) => {
	return new Promise<void>((resolve, reject) => {
		UserService.getCurrentUser()
			.then(async (getCurrentUserRes: ResponseMessage<UserDTO>) => {
				if (!isResponseMessageSuccess(getCurrentUserRes)) {
					dispatch(setFinishedAccountSetup(false));

					if (currentUser) {
						const currentUser = await Auth.currentAuthenticatedUser();
						dispatch(
							populateUser({
								userId: 0,
								userName: currentUser.attributes.name,
								userEmail: currentUser.attributes.email,
								profileImgS3Url: '',
								profileImgS3Key: '',
							})
						);
					} else {
						console.log('Not signed in');
					}

					return reject();
				}

				var user = getCurrentUserRes.data!;

				const userInfo = {
					userId: user.userId,
					userName: user.userName,
					userEmail: user.userEmail,
					profileImgS3Url: user.profileImgS3Url,
					profileImgS3Key: user.profileImgS3Key,
				};

				if (
					userInfo.profileImgS3Url &&
					userInfo.profileImgS3Key &&
					userInfo.userId &&
					userInfo.userName &&
					userInfo.userEmail
				) {
					dispatch(populateUser(userInfo));
					dispatch(setFinishedAccountSetup(true));
				}

				resolve();
			})
			.catch(() => {
				reject();
			});
	});
};

// Function to populate collections
const populateCollectionsInfo = (dispatch: ThunkDispatch<any, any, any>) => {
	return new Promise((resolve, reject) => {
		getCurrentUserCollections()
			.then((getCurrentUserCollectionsRes: ResponseMessage<CollectionDTO[]>) => {
				if (!isGetCurrentUserCollectionsDTO(getCurrentUserCollectionsRes)) {
					return reject();
				}

				var collections = getCurrentUserCollectionsRes.data;
				var toStoreCollections: Collection[] = [];

				collections.map(async (collection: CollectionDTO) => {
					var getUsersByCollectionIdRes: ResponseMessage<UserDTO[]> = await getUsersByCollectionId(
						collection.collectionId
					);
					if (!isResponseMessageSuccess(getUsersByCollectionIdRes)) return null;

					const usersObject = getUsersByCollectionIdRes.data!.reduce((acc, user: UserDTO) => {
						(acc as { [userEmail: string]: UserAccess })[user.userEmail] = {
							collectionId: collection.collectionId,
							user: {
								userId: user.userId,
								userName: user.userName,
								userEmail: user.userEmail,
								profileImgS3Url: user.profileImgS3Url,
								profileImgS3Key: user.profileImgS3Key,
							},
							// TODO: CHANGE THIS
							permission: Permission.READ,
						};
						return acc;
					}, {});

					getGiffiesByCollectionId(Number(collection.collectionId)).then(
						(getGiffiesByCollectionIdRes: ResponseMessage<GiffyDTO[]>) => {
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
									users: usersObject,
								},
							];

							dispatch(populateCollections(toStoreCollections));
						}
					);
				});

				const collectionIds = collections.map((collection: CollectionDTO) => collection.collectionId);
				resolve(collectionIds.length > 0 ? Math.min(...collectionIds) : 0);
			})
			.catch(() => {
				reject();
			});
	});
};

// Original function modified to call the new functions
export const onCollectionsRoutePopulation = (props: onCollectionsRoutePopulationProps) => {
	const { dispatch, router } = props;

	// clear collections every time we change route
	dispatch(clearCollections());

	// populating redux state for user
	Auth.currentAuthenticatedUser()
		.then((currentUser) => {
			populateUserInfo(dispatch, currentUser);
		})
		.catch(() => {
			dispatch(clearUser());
		});
};
