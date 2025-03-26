import { NextResponse } from "next/server";
import { ApiResponse, successResponse, errorResponse } from "@/lib/api-utils";

// Define Strapi content types
export interface StrapiContent {
  data: StrapiContentItem[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiContentItem {
  id: number;
  attributes: {
    title?: string;
    content?: string;
    slug?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    documentId?: string;
    [key: string]: string | number | boolean | null | Record<string, unknown> | undefined;
  };
}

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function GET(): Promise<NextResponse<ApiResponse<StrapiContent>>> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/pages?populate=*`, {
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      throw new Error(`Strapi responded with status: ${response.status}`);
    }
    
    const data = await response.json() as StrapiContent;
    return successResponse<StrapiContent>(data);
  } catch (error) {
    console.error("Error fetching content from Strapi:", error);
    const message = error instanceof Error 
      ? error.message 
      : "Failed to fetch content";
      
    return errorResponse(message, 500, error);
  }
}
