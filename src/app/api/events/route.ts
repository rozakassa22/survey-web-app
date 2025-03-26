import { NextResponse } from "next/server";

// Define event message types
export interface EventMessage {
  type: 'connected' | 'update';
  timestamp?: string;
  message?: string;
}

// Define stream controller types
export type SSEPayload = string; // encoded JSON message
export type SSEController = ReadableStreamDefaultController<SSEPayload>;

export async function GET(): Promise<NextResponse> {
  const encoder = new TextEncoder();
  let isControllerClosed = false;

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      // Send initial connection message
      const initialMessage: EventMessage = { type: "connected" };
      controller.enqueue(encoder.encode("data: " + JSON.stringify(initialMessage) + "\n\n"));

      // Set up an interval to send updates
      const interval = setInterval(() => {
        if (!isControllerClosed) {
          try {
            const updateMessage: EventMessage = {
              type: "update",
              timestamp: new Date().toISOString(),
              message: "New survey response received",
            };
            
            controller.enqueue(
              encoder.encode("data: " + JSON.stringify(updateMessage) + "\n\n")
            );
          } catch (error) {
            console.error("Error sending SSE message:", error);
            clearInterval(interval);
            controller.close();
          }
        }
      }, 5000); // Send updates every 5 seconds

      // Clean up on client disconnect
      return () => {
        isControllerClosed = true;
        clearInterval(interval);
        controller.close();
      };
    },
    cancel() {
      isControllerClosed = true;
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
} 