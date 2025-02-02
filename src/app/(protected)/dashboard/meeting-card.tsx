'use client'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { uploadFile } from '@/lib/firebase'
import { Presentation, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

const MeetingCard = () => {
    const [progress, setProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const uploadMeeting = api.project.uploadMeeting.useMutation()
    const { project } = useProject()
    const router = useRouter()
    const processMeeting = useMutation({
        mutationFn: async ( data: {meetingUrl: string, meetingId: string, projectId: string }) =>{
            const { meetingUrl, meetingId, projectId } = data
            const response = await axios.post(`api/process-meeting`, { meetingUrl, meetingId, projectId })
            return response.data
        }
    })
    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a']
        },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async acceptedFiles => {
            if(!project) return
            setIsUploading(true)
            console.log(acceptedFiles)
            const file = acceptedFiles[0]
            if (!file) return
            const downloadURL = await uploadFile(file as File, setProgress) as string
            uploadMeeting.mutate({
                projectId: project.id,
                meetingUrl: downloadURL,
                name: file.name
            },{
                onSuccess: (meeting) =>{
                    toast.success('Meeting uploaded successfully')
                    router.push('/meetings')
                    processMeeting.mutateAsync({ meetingUrl: downloadURL, meetingId: meeting.id, projectId: project.id})
                },
                onError: () =>{
                    toast.error('Failed to upload meeting')
                }
            })
            setIsUploading(false)
        }
    })
  return (
    <Card className='col-span-2 flex flex-col items-center justify-center p-10' {...getRootProps()}>
        {!isUploading && (
            <>
                <Presentation className='h-10 w-10 animate-bounce' />
                <h3 className='mt-2 text-sm font-semibold text-gray-900'>
                    Create a new Meeting
                </h3>
                <p className='mt-1 text-center text-sm text-gray-500'>
                    Analyze your meeting with GithubSaas
                    <br />
                    Powerd by AI
                </p>
                <div className="mt-6">
                    <Button disabled = {isUploading}>
                        <Upload className='ml-0.5 mr-1.5 h-5 w-5' aria-hidden="true" />
                        Upload Meeting
                        <input className="hidden" {...getInputProps()} />
                    </Button>
                </div>
            </>
        )}
        {isUploading && (
            <div className="">
                <CircularProgressbar value={progress} text={`${progress}%`} className='size-20' styles={
                    buildStyles({
                        pathColor: '#2563eb',
                        textColor: '#2563eb'
                    })
                }/>
                <p className='text-sm text-gray-500 text-center'>Uploading your meeting...</p>
            </div>
        )}
    </Card>
  )
}

export default MeetingCard