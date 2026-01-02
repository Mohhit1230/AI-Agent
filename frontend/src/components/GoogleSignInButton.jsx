import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { googleLogin } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const GoogleSignInButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        const result = await dispatch(googleLogin({ credential: credentialResponse.credential }));

        if (googleLogin.fulfilled.match(result)) {
            navigate('/');
        }
    };

    const handleGoogleError = () => {
        console.error('Google Sign-In failed');
    };

    return (
        <div className="w-full">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="continue_with"
                shape="rectangular"
                logo_alignment="left"
                width="100%"
            />
        </div>
    );
};

export default GoogleSignInButton;
