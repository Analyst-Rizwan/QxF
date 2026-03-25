// Use VITE_API_URL in production, fallback to 8000 for local dev (no proxy in school tier by default unless configured)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Stream a chat response from the School AI (SSE), tailored for Class 9-10.
 */
export async function streamMessageFromSchoolAI(
  message: string,
  onToken: (text: string) => void,
  onDone: (fullText: string, conversationId: number | null) => void,
  opts?: { conversation_id?: number | null }
): Promise<void> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  
  // Note: App operates without tokens for the pilot. 
  // Authentication is handled via the batch code system conceptually, 
  // and the dashboard/chat routes are open for the pilot demo.

  const body: Record<string, unknown> = { message };
  if (opts?.conversation_id != null) body.conversation_id = opts.conversation_id;

  try {
    const res = await fetch(`${API_BASE_URL}/school/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      console.error("Streaming error:", res.status);
      onDone("⚠️ AI server returned an error.", null);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let conversationId: number | null = opts?.conversation_id ?? null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; 

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const evt = JSON.parse(jsonStr);

          if (evt.type === "conv") {
            conversationId = evt.conversation_id;
          } else if (evt.type === "delta") {
            onToken(evt.text || "");
          } else if (evt.type === "done") {
            onDone(evt.full_text || "", conversationId);
            return;
          } else if (evt.type === "error") {
            onDone("⚠️ " + (evt.message || "AI streaming error."), conversationId);
            return;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }

    onDone("", conversationId);
  } catch (err) {
    console.error("AI Stream Error:", err);
    onDone("⚠️ Could not connect to AI server.", null);
  }
}
