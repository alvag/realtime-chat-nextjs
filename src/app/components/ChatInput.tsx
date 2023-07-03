'use client';

import TextareaAutosize from 'react-textarea-autosize';
import { useRef, useState } from 'react';
import Button from '@/app/components/ui/Button';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Props {
    chatPartner: User;
    chatId: string;
}

export const ChatInput = ({chatPartner, chatId}: Props) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('')

    const sendMessage = async() => {
        setIsLoading(true);

        try {
            await axios.post('/api/message/send', { text: input, chatId });
            setInput('');
            textareaRef.current?.focus();
        } catch ( error ) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
            <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                <TextareaAutosize ref={textareaRef}
                                  onKeyDown={handleKeyDown}
                                  value={input}
                                  onChange={(e) => setInput(e.target.value)}
                                  placeholder={`Message ${chatPartner.name}`}
                                  rows={1}
                                  className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
                />

                <div onClick={() => textareaRef.current?.focus()}
                     className="py-2" aria-hidden="true">
                    <div className="py-2">
                        <div className="h-9" />
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                    <div className="flex-shrink-0">
                        <Button isLoading={isLoading} onClick={sendMessage} type="submit">
                            Post
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
