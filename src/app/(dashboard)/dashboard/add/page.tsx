import {FC} from 'react';
import AddFriendButton from '@/app/components/AddFriendButton';

interface PageProps {
}

const Page: FC<PageProps> = ( {} ) => {
    return <main className='pt-8'>
        <h1 className='font-bold text-5xl mb-8'>Add a friend</h1>
        <AddFriendButton/>
    </main>;
};

export default Page;
