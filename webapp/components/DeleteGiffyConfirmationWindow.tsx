import { deleteObject, ref } from 'firebase/storage';
import router from 'next/router';
import { giffyDTO } from '../API/DTO';
import { deleteGiffyById } from '../API/serverHooks';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
	closeDeleteGiffyConfirmationWindow,
	removeGiffyFromACollection,
	removeSelectedGiffy,
} from '../slices/CollectionsSlice';
import { RootState } from '../store';
import styles from '../styles/DeleteGiffyConfirmationWindow.module.scss';
import { storage } from './Firebase/FirebaseInit';

export const DeleteGiffyConfirmationWindow = () => {
	const { collectionId } = router.query;
	const dispatch = useAppDispatch();
	const selectedGiffies = useAppSelector(
		(state: RootState) => state.collections.selectedGiffyIds
	);
	const giffies = useAppSelector((state: RootState) => {
		return state.collections.value?.filter(
			curCollection => curCollection.collectionId === Number(collectionId)
		)[0]?.giffies;
	});

	return (
		<div className={styles.centeredBox}>
			<div className={styles.buttonContainer}>
				<button
					className={styles.cancelButton}
					onClick={() => {
						selectedGiffies.forEach((giffyId: number) => {
							dispatch(removeSelectedGiffy(giffyId));
						});
						dispatch(closeDeleteGiffyConfirmationWindow());
					}}
				>
					Cancel
				</button>
				<button
					className={styles.deleteButton}
					onClick={() => {
						selectedGiffies.forEach(async (giffyId: number) => {
							try {
								if (giffies) {
									giffies
										.filter((giffy: giffyDTO) => giffy.giffyId === giffyId)
										.forEach((giffy: giffyDTO) => {
											// 1. delete giffy from Firebase
											deleteObject(ref(storage, giffy.firebaseRef))
												.then(() => {
													// 2. delete giffy pic from database
													deleteGiffyById(giffy.giffyId)
														.then(response => {
															// 3. delete from Redux store
															if (!response.error) {
																dispatch(
																	removeGiffyFromACollection({
																		collectionId: Number(collectionId),
																		giffyId: giffyId,
																	})
																);
																dispatch(removeSelectedGiffy(giffyId));
															}
														})
														.catch(err => console.log(err));
												})
												.catch(err => console.log(err));
										});
								}
							} catch (error) {
								console.log(error);
							}
						});
						dispatch(closeDeleteGiffyConfirmationWindow());
					}}
				>
					Delete
				</button>
			</div>
		</div>
	);
};