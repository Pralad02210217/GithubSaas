import { db } from '@/server/db';
import { Octokit } from 'octokit'
import axios from 'axios'
import { aiSummariseCommit } from './gemini';

type Response = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string

}
export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

const githubUrl = 'https://github.com/docker/genai-stack'

export const getCommitHashes = async(githubUrl: string): Promise<Response[]> =>{
    const [ owner, repo ] = githubUrl.split('/').slice(-2)
    if(!owner || !repo){
        throw new Error("Invalid github url")
    }
    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo
    })
    const sortedCommits = data.sort((a:any, b: any)=> new Date(b.commit.author.data).getTime() - new Date(a.commit.author.date).getTime()) as any[]
    return sortedCommits.slice(0, 15).map((commit: any)=>({
        commitHash: commit.sha as string,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvatar: commit?.author?.avatar_url ?? "",
        commitDate: commit.commit?.author.date ?? ""
    }))
}

async function summriseCommit(githubUrl: string, commitHash: string){
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }
    })
    return await aiSummariseCommit(data) || ""
}

export const pullCommits = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGithubUrl(projectId )
    const commitHashes = await getCommitHashes(githubUrl)
    const unprocessedCommits = await filterUnprocesssedCommits(projectId, commitHashes)
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map(commit =>{
        return summriseCommit(githubUrl, commit.commitHash)
    }))
    const summaries = summaryResponses.map((response) =>{
        if(response.status === 'fulfilled'){
            return response.value as string
        }
        return ""
    })
    const commit = await db.commit.createMany({

        data: summaries.map((summary, index) =>{
            return {
                projectId: projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
                commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
                commitDate: unprocessedCommits[index]!.commitDate,
                summary
            
            }
        })
    })
    return unprocessedCommits
}

async function fetchProjectGithubUrl(projectId: string){
    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            githubUrl: true
        }
    })
    if(!project?.githubUrl){
        throw new Error("Project has no github url")
    }
    return {
        project,
        githubUrl: project?.githubUrl
    }
}
async function filterUnprocesssedCommits(projectId: string, commitHashes: Response[]){
    const processedCommits = await db.commit.findMany({
        where: { projectId }
    })
    const unprocessedCommits = commitHashes.filter((commit) =>!processedCommits.some((processedCommits) => processedCommits.commitHash === commit.commitHash))
    return unprocessedCommits
}