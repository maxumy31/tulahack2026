import Image from "next/image";
import Button from "./components/Button";
import { redirect } from "next/navigation";


export default function HomePage() {

  async function navigateToClient() {
    'use server';
    redirect("/client");
  }

  async function navigateToOperator() {
    'use server';
    redirect("/auth");
  }

  return (
    <>
      <div className="flex flex-col mx-auto my-auto gap-8 w-[400px]">
        <form action={navigateToOperator} >
          <Button className="w-full h-full">Я сотрудник</Button>
        </form>
        <form action={navigateToClient}>
          <Button className="w-full h-full">Я клиент</Button>
        </form>
      </div>
    </>
  );
}
