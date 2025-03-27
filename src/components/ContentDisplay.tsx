"use client";

import { BellRing, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface StrapiResponseItem {
  id: number;
  title?: string;
  content?: string;
  slug?: string;
  createdAt: string;
  attributes?: {
    title?: string;
    content?: string;
    slug?: string;
    createdAt?: string;
  };
}

interface Page {
  id: string | number;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
}

export default function SupplementaryContent() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const setupSSE = () => {
      if (eventSource) {
        eventSource.close();
      }
      eventSource = new EventSource("/api/events");

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "connected") {
          } else if (data.type === "update") {
            fetchContent();
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        setIsConnected(false);
        eventSource?.close();
        reconnectTimeout = setTimeout(() => {
          setupSSE();
        }, 5000);
      };
    };

    const fetchContent = async () => {
      try {
        const response = await fetch("/api/content");
        const responseData = await response.json();


        if (
          responseData.success &&
          responseData.data &&
          Array.isArray(responseData.data.data)
        ) {

          const items = responseData.data.data.map((item: StrapiResponseItem) => ({
            id: item.id,
            title: item.title || item.attributes?.title || "Untitled",
            content: item.content || item.attributes?.content || "",
            slug: item.slug || item.attributes?.slug || "",
            createdAt:
              item.createdAt || item.attributes?.createdAt || new Date().toISOString(),
          }));

          const filteredPages = items.filter((page: Page) =>
            ["survey-guide", "privacy-policy"].includes(page.slug)
          );

          setPages(filteredPages);
        } else {
          console.error("Invalid content data structure:", responseData);
          setPages([]);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast.error("Failed to load supplementary content");
      }
    };

    fetchContent();
    setupSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
    
      if (
        showDropdown &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
      >
        <span className="text-sm font-semibold">Helpful Information</span>
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        {showDropdown ? (
          <X className="w-5 h-5" />
        ) : (
          <BellRing
            className={`w-5 h-5 ${
              isConnected
                ? "text-red-500 animate-scale-pulse"
                : "text-gray-500"
            }`}
          />
        )}
      </button>

      {showDropdown && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 p-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 mb-4 last:mb-0 last:pb-0"
            >
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {page.title}
              </h3>
              <div
                className="text-xs text-gray-600 dark:text-gray-300 mt-1"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Published: {new Date(page.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
