import { getUsers, UserWithoutPassword } from "@/lib/db-utils";
import { getAll, ApiResponse } from "@/lib/api-utils";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<ApiResponse<UserWithoutPassword[]>>> {
  return getAll<UserWithoutPassword>(
    () => getUsers(), 
    'users'
  );
} 