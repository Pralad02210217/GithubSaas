import IssueList from "./issues-list"

type Props = {
    params: Promise<{ meetingId: string}>
}

const MeetingDetailsPage = async ({params}: Props) => {
    const { meetingId } = await params
  return (
    <IssueList meetingId={meetingId} />
  )
}