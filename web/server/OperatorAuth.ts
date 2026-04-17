const operatorToken = "test";

export async function CheckToken(token : string) {
    return token === operatorToken;
}