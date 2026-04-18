'use client'
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import Button from "../components/Button";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { CheckToken } from "@/server/OperatorAuth";

export default function OperatorPage({ }) {

    const router = useRouter();

    async function navigateBack() {
        router.push("/");
    }

    async function navigateForward() {
        router.push("operator");
    }

    async function checkCookies() {
        const token = Cookies.get("token") || "";

        const isValid = await CheckToken(token);
        if (isValid) {
            navigateForward();
        }
    }


    useEffect(() => {
        checkCookies();
    })



    const [token, setToken] = useState<string>("");
    const [error, setError] = useState<string>("");

    async function onAuth() {
        Cookies.set("token", token);
        const isValid = await CheckToken(token);
        if (isValid) {
            navigateForward();
        } else {
            setError("Введен неправильный токен");
        }
    }

    return (
        <>
            <div className="mx-auto my-auto w-[400px]">
                <div className="text-center text-error my-4 font-bold">
                    {error}
                </div>
                <form onSubmit={(e) => e.preventDefault()}>   
                <div className="flex flex-row gap-8" >
                    <input className="input h-16 flex-1" placeholder="Введите токен доступа"
                        onChange={(event) => {
                            setToken(event.target.value);
                            setError("");
                        }}></input>
                    <Button onClick={onAuth}>Вход</Button>
                </div>
                </form>

            </div>

        </>)
}