'use client'

import MDEditor from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import { DialogTitle } from '@radix-ui/react-dialog'
import Image from 'next/image'
import React, { useState } from 'react'
import { askQuestion } from './actions'
import { readStreamableValue } from 'ai/rsc'
import CodeReference from './code-references'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

const AskQuestionCard = () => {
    const { project } = useProject()
    const [open, setOpen] = useState(false)
    const [question, setQuestion] = useState('')
    const [loading, setLoading] = useState(false)
    const [fileReferences, setFileReferences] = useState<{ fileName:string; sourceCode:string; summary:string }[]>([])
    const [answer, setAnswer] = useState('')
    const saveAnswer = api.project.saveAnswer.useMutation()

    const onSubmit = async(e: React.FormEvent<HTMLFormElement>) =>{
        setAnswer('')
        setFileReferences([])
        e.preventDefault()
        if(!project?.id) return
        setLoading(true)
        
        const { output, fileReferences } = await askQuestion(question, project.id)
        setOpen(true)
        setFileReferences(fileReferences)

        for await (const delta of readStreamableValue(output)){
            if(delta){
                setAnswer(ans => ans + delta)
            }
        }
        setLoading(false)
    }
  return (
    <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='sm:max-w-[80vw] max-h-[90vh] overflow-y-auto' >
            <DialogHeader>
                <div className="flex items-center gap-2">
                <DialogTitle>
                    <Image src='/logo.png' alt='githubsaas logo' width={32} height={32} />
                </DialogTitle>
                <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={() =>{
                    saveAnswer.mutate({
                        projectId: project!.id,
                        question,
                        answer,
                        fileReferences
                    }, {
                        onSuccess: () =>{
                            toast.success('Answer saved!')
                        },
                        onError: () =>{
                            toast.error("Failed to save answer")
                        }
                    })
                }}>
                    Save Answer
                </Button>
                </div>
            </DialogHeader>
            <MDEditor.Markdown source={answer} className='max-w-[70vw] !h-full max-h-[40vh] overflow-y-scroll' />
            <div className="h-4"></div>
            <CodeReference filesReferences={fileReferences} />
            <Button type='button' onClick={() => { setOpen(false)}}>
                Close
            </Button>
            </DialogContent>
        </Dialog>
        <Card className='relative col-span-3'>
            <CardHeader>
                <CardTitle>Ask a question</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit}>
                    <Textarea placeholder='Which file should i edit to change the home page?' value={question} onChange={e => setQuestion(e.target.value)} />
                    <div className="h-4"></div>
                    <Button type='submit' disabled={loading}>
                        Ask GithubAgent
                    </Button>
                </form>
            </CardContent>
        </Card>
    </>
  )
}

export default AskQuestionCard