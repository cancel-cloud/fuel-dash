"use client";

import { Client, Account, Databases, Storage, Query, ID, Permission, Role } from "appwrite";

export const appwrite = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(appwrite);
export const db = new Databases(appwrite);
export const storage = new Storage(appwrite);

export { Query, ID, Permission, Role };
