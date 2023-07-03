'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { chatHrefConstructor } from '@/lib/utils';

interface Props {
    friends: User[];
    sessionId: string
}

export const SidebarChatList = ({friends, sessionId}: Props) => {

    const router = useRouter();
    const pathname = usePathname();
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

    useEffect(() => {
        if ( pathname?.includes('chat') ) {
            setUnseenMessages( (prev) => {
                return prev.filter( ( message ) => !pathname.includes( message.senderId ) );
            } );
        }
    }, [pathname]);

    return (
        <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
            { friends.sort().map((friend) => {
                const unseenMessageCount = unseenMessages.filter( ( message ) => message.senderId === friend.id ).length;
                return <li key={friend.id}>
                    <a className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md text-sm leading-6 font-semibold"
                        href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}>
                        {friend.name}
                        {
                            unseenMessageCount > 0
                            && <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                                {unseenMessageCount}
                            </div>
                        }
                    </a>
                </li>
            }) }
        </ul>
    );
};
