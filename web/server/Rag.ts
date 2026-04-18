'use server'

export async function GetRagResponse(request: string) {
    const response = await fetch(process.env.RAG_URI || "",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "question": request }),
        },
    );
    const json = await response.json();
    console.log(json);
    const asnwer = json.answer;
    const images = json.imageIds || [0];
    return [asnwer, images];
}

export async function GetImage(id: string): Promise<any> {
    const img = await fetch(`${process.env.IMG_URI}/img/${id}` || "");
    return img;
}