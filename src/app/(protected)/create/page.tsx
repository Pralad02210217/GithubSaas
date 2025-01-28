'use client'
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import React from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type FormInput = {
    repoUrl: string;
    projectName: string;
    githubToken?: string;
}

const CreatePage = () => {
    const { register, handleSubmit, reset } = useForm<FormInput>()
    const createProject = api.project.createProject.useMutation()
    function onSubmit(data: FormInput){

        createProject.mutate({
            githubUrl: data.repoUrl,
            name: data.projectName,
            githubToken: data.githubToken
        },{
            onSuccess: () =>{
                toast.success('Project created Successfully')
                reset()
            },
            onError: () =>{
                toast.error("Failed to create project")
            }
        }
    )
        return true
    }

  return (
    <div className='flex items-center gap-12 h-full justify-center'>
        <img src="/undraw_github.svg" alt="" className='h-56 w-auto' />
        <div>
            <div>
                <h1 className='font-semibold text-2xl'>
                    Link your Github Repositroy
                </h1>
                <p className='text-sm text-muted-foreground'>
                    Enter your URL of your repository to link it to GithubSaas
                </p>
            </div>
            <div className="h-4"></div>
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input
                        {...register('projectName', {required: true})}
                        placeholder='ProjectName'
                        required 
                     />
                    <div className="h-4"></div>
                    <input
                        {...register('repoUrl', {required: true})}
                        placeholder='Github URL'
                        type='url'
                        required 
                     />
                    <div className="h-4"></div>
                    <input
                        {...register('githubToken')}
                        placeholder='Github Token (Optional)'
                     />
                    <div className="h-4"></div>
                    <Button type='submit' disabled={createProject.isPending}>
                        Create Project
                    </Button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default CreatePage