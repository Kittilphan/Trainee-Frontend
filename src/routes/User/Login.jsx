import UserLogin from '../../components/UserLogin';
import useQuery from '../../hooks/useQuery';

export default function UserLoginForm() {
	const query = useQuery();
	return <UserLogin redirectUrl={query.get('redirect')} />;
}
