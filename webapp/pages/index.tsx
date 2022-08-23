import type { NextPage } from 'next';
import FileUploadBox from '../components/FileUploadBox';
import Layout from '../components/Layout';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';

const Home: NextPage = () => {
	const count = useSelector((state: RootState) => state.counter.value);
	const dispatch = useDispatch();

	return (
		<Layout>
			<div></div>
			<FileUploadBox />
		</Layout>
	);
};

export default Home;
