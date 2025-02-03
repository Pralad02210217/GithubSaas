import { redirect } from "next/navigation";


export default async function Home() {

  return (
    <>
      <h1 className="text-red-600">Hello</h1>
    <button onClick={() => {
      redirect('/dashboard')
    }}>
      Click to go to dashboard
    </button>
    </>
  );
}
