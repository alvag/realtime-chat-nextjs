'use client';

import { useState } from 'react';
import { Check, UserPlus, X } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Props {
    incomingFriendRequest: IncomingFriendRequest[];
    sessionId: string;
}

export const FriendRequests = ({incomingFriendRequest, sessionId}: Props) => {
    const router = useRouter();

    const [friendRequest, setFriendRequest] = useState<IncomingFriendRequest[]>(
        incomingFriendRequest
    );

    const acceptFriend = async (senderId: string) => {
        await axios.post('/api/friends/accept', {
            id: senderId
        });

        setFriendRequest((prev) =>
            prev.filter((request) => request.senderId !== senderId)
        );

        router.refresh();
    }

    const denyFriend = async (senderId: string) => {
        await axios.post('/api/friends/deny', {
            id: senderId
        });

        setFriendRequest((prev) =>
            prev.filter((request) => request.senderId !== senderId)
        );

        router.refresh();
    }

    return (
        <>
            {
                friendRequest.length === 0
                    ? ( <p className="text-sm text-zinc-500">Nothing to show here...</p> )
                    : (
                        friendRequest.map( ( { senderId, senderEmail } ) => (
                            <div key={senderId} className="flex gap-4 items-center">
                                <UserPlus className="text-black" />
                                <p className="font-medium text-xl">{senderEmail}</p>
                                <button onClick={() => acceptFriend(senderId)}
                                    aria-label="accept friend" className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md">
                                    <Check className="font-semibold text-white w-3/4 h-3/4" />
                                </button>
                                <button onClick={() => denyFriend(senderId)}
                                    aria-label="deny friend" className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md">
                                    <X className="font-semibold text-white w-3/4 h-3/4" />
                                </button>
                            </div>
                        ))
                    )
            }
        </>
    );
};
