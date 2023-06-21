'use client';

import {FC, useState} from 'react';
import Button from '@/app/components/ui/Button';
import {addFriendValidator} from '@/lib/validations/add-friend';
import axios, {AxiosError} from 'axios';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';

interface AddFriendButtonProps {
}

type FormData = z.infer<typeof addFriendValidator>;

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
    const [showSuccessState, setShowSuccessState] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: {errors}
    } = useForm<FormData>({
        resolver: zodResolver(addFriendValidator)
    })

    const addFriend = async (email: string) => {
        try {
            const validatedEmail = addFriendValidator.parse({email});

            await axios.post('/api/friends/add', {
                email: validatedEmail
            });

            setShowSuccessState(true);
        } catch (e) {
            if (e instanceof z.ZodError) {
                setError('email', {message: e.message});
                return;
            }

            if (e instanceof AxiosError) {
                setError('email', {message: e.response?.data});
                return;
            }

            setError('email', {message: 'An unknown error occurred'});
        }
    }

    const onSubmit = async (data: FormData) => {
        await addFriend(data.email);
    }

    return <form className='max-w-sm' onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="email" className='block text-sm font-medium leading-6 text-gray-900'>
            Add friend by email
        </label>

        <div className="mt-2 flex gap-4">
            <input {...register('email')} type="text"
                   className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                   placeholder="you@email.com"/>

            <Button>Add</Button>
        </div>

        <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
        {showSuccessState && <p className="mt-1 text-sm text-green-600">Friend request sent!</p>}
    </form>;
};

export default AddFriendButton;
