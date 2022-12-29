import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { userDTO } from '../API/DTO';
import { createUser } from '../API/serverHooks';
import { useAppSelector } from '../hooks';
import { populateUser } from '../slices/UserSlice';
import { RootState } from '../store';
import styles from '../styles/Auth.module.scss';
import FileUploadBox from './FileUploadBox';
import { googleSignIn, logOut, storage } from './Firebase/FirebaseInit';

interface UserInfo {
	userName: string;
	firebaseAuthId: string;
	profileImgUrl: string;
}

const Auth = () => {
	const dispatch = useDispatch();
	// TODO: firebaseAuthID might be null
	const [userInfo, setUserInfo] = useState<UserInfo>({
		userName: '',
		firebaseAuthId: useAppSelector((state: RootState) =>
			state.userAuth.value ? state.userAuth.value.uid : ''
		),
		profileImgUrl:
			'https://raw.githubusercontent.com/hungnguyen3/Giffy/main/webapp/public/userProfile.png',
	});
	const [userImg, setUserImg] = useState<File | null>(null);

	const isLoggedIn = useAppSelector((state: RootState) =>
		state.userAuth.value ? true : false
	);

	const hasAnAccount = useAppSelector((state: RootState) =>
		state.user.value ? true : false
	);

	const uploadHandler = async () => {
		if (userImg) {
			try {
				const storageRef = ref(
					storage,
					`images/${userInfo?.userName}/${userImg.name}${new Date().getTime()}`
				);
				const snapshot = await uploadBytes(storageRef, userImg);
				const downloadURL = await getDownloadURL(snapshot.ref);

				if (!downloadURL) {
					alert(
						'Failed to save image to firebase therefore failed to create a new user'
					);
				} else {
					const createUserRes: userDTO = await createUser({
						userName: userInfo.userName,
						firebaseAuthId: userInfo.firebaseAuthId,
						profileImgUrl: userInfo.profileImgUrl,
					});

					console.log(createUserRes);
					if (createUserRes) {
						dispatch(
							populateUser({
								userId: createUserRes.userId,
								userName: createUserRes.userName,
								profileImgUrl: createUserRes.profileImgUrl,
							})
						);
						alert('Created a new user successfully');
					} else {
						// TODO: error handling
					}
				}
			} catch (err) {
				console.log(err);
				alert('Upload unsuccessfully');
			}
		} else {
			alert('Select an img first');
		}
	};

	if (isLoggedIn && !hasAnAccount) {
		return (
			<div className={styles.centeredBox}>
				<h1>Sign up 🚀</h1>
				<div className={styles.name}>
					User name: &nbsp;
					<input
						type="text"
						onChange={event => {
							setUserInfo({
								...userInfo,
								userName: event.target.value,
							});
						}}
					></input>
				</div>
				<FileUploadBox
					setFileHolderForParent={setUserImg}
					displayText={'Drag and drop your profile img or click here'}
				/>
				<div className={styles.buttonContainer}>
					<button className={styles.fileUploadBtn} onClick={uploadHandler}>
						Upload
					</button>
					<button className={styles.fileUploadBtn} onClick={logOut}>
						Cancel
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.centeredBox}>
			<h1>Welcome to Giffy 👋</h1>
			<button onClick={googleSignIn} className={styles.loginWithGoogleBtn}>
				Sign in with Google
			</button>
		</div>
	);
};

export default Auth;
