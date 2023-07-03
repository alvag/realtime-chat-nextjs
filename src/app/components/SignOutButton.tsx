'use client';

import { ButtonHTMLAttributes, useState } from 'react';
import Button from '@/app/components/ui/Button';
import { signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Loader2, LogOut } from 'lucide-react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const SignOutButton = ({...props}: Props) => {
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleClick = async () => {
        setIsSigningOut( true );
        try {
            await signOut();
        } catch ( e ) {
            toast.error( 'Error signing out' );
        } finally {
            setIsSigningOut( false );
        }

    }

    return (
        <Button onClick={handleClick}
            {...props} variant="ghost">
            {
                isSigningOut
                    ? <Loader2 className="animate-spin h-4 w-4"/>
                    : <LogOut className="h-4 w-4"/>
            }
        </Button>
    );
};
