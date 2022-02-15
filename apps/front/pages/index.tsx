import { Button } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon } from '@mui/icons-material';
import { useDarkMode } from 'next-dark-mode';
import Router from 'next/router';
import withAuth from './withAuth';

const Home = () => {
    const { switchToDarkMode, switchToLightMode, darkModeActive } = useDarkMode();

    const handleChangeMode = () => {
        if (darkModeActive) {
            switchToLightMode();
        } else {
            switchToDarkMode();
        }
    };

    const redirectLogin = ($e: any) => {
        Router.push('/login');
    };

    const redirectRegister = ($e: any) => {
        Router.push('/register');
    };

    const nextMode = darkModeActive ? 'Light' : 'Dark';
    const Icon = darkModeActive ? LightIcon : DarkIcon;

    return (
        <>
            <Button onClick={handleChangeMode} color="primary" variant="contained" startIcon={<Icon />}>
                Use {nextMode} mode
            </Button>
            <br />
            <Button color="primary" variant="contained" startIcon={<Icon />} onClick={redirectLogin}>
                Redirect to /login
            </Button>
            <br />
            <Button color="primary" variant="contained" startIcon={<Icon />} onClick={redirectRegister}>
                Redirect to /register
            </Button>
        </>
    );
};

export default withAuth(Home);
