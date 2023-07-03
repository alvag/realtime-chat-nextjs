import {FC} from 'react';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';

interface pageProps {
}

const page: FC<pageProps> = async ({}) => {
    const session = await getServerSession(authOptions)
    return <pre>Dashboard</pre>
}

export default page;