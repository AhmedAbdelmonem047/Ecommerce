import { compare, hash } from "bcrypt"

export const GenerateHash = async (plaintext: string, saltRounds: number = Number(process.env.SALT_ROUNDS)) => {
    return hash(plaintext, saltRounds);
}

export const CompareHash = async (plaintext: string, cipherText: string) => {
    return compare(plaintext, cipherText);
}