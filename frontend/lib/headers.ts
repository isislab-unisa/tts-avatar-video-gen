"use server";
import { headers as nextHeaders } from "next/headers";

export async function cloneRequestHeaders(): Promise<Headers> {
  const rh = await nextHeaders(); // Promise<ReadonlyHeaders> nella tua toolchain
  const h = new Headers();
  for (const [k, v] of rh.entries()) h.append(k, v);
  return h;
}
