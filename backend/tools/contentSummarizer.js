import axios from "axios";

/**
 * Extract video ID from various YouTube URL formats
 */
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Fetch YouTube transcript using a free transcript API
 */
export async function fetch_transcript(url) {
    try {
        const videoId = extractVideoId(url);
        if (!videoId) {
            return {
                content: [
                    {
                        type: "text",
                        text: "❌ Invalid YouTube URL. Please provide a valid YouTube video link.",
                    },
                ],
            };
        }

        // Try using youtube-transcript-api via a proxy service
        // Alternative: Use youtubetranscript.com API
        const transcriptUrl = `https://youtubetranscript.com/?server_vid2=${videoId}`;

        try {
            // First attempt: Try to get transcript from YouTube's timedtext API
            const response = await axios.get(
                `https://www.youtube.com/watch?v=${videoId}`
            );

            // Extract captions from the page
            const captionsMatch = response.data.match(/"captionTracks":\s*(\[.*?\])/);

            if (captionsMatch) {
                const captions = JSON.parse(captionsMatch[1]);
                if (captions && captions.length > 0) {
                    // Get the first available caption track (usually auto-generated or English)
                    const captionUrl = captions[0].baseUrl;
                    const transcriptResponse = await axios.get(captionUrl);

                    // Parse XML transcript
                    const textMatches = transcriptResponse.data.match(/<text[^>]*>([^<]*)<\/text>/g);
                    if (textMatches) {
                        const transcript = textMatches
                            .map((match) => {
                                const textMatch = match.match(/<text[^>]*>([^<]*)<\/text>/);
                                return textMatch ? textMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"') : '';
                            })
                            .join(' ')
                            .replace(/\s+/g, ' ')
                            .trim();

                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `📝 **YouTube Transcript Fetched Successfully!**\n\n**Video ID:** ${videoId}\n**Transcript Length:** ${transcript.length} characters\n\n---\n\n${transcript}`,
                                },
                            ],
                        };
                    }
                }
            }

            // Fallback: Return video info without transcript
            const titleMatch = response.data.match(/<title>([^<]*)<\/title>/);
            const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown';

            return {
                content: [
                    {
                        type: "text",
                        text: `⚠️ **Could not fetch transcript** (Video may not have captions enabled)\n\n**Video:** ${title}\n**ID:** ${videoId}\n\n💡 *Tip: Try summarizing an article URL instead, or ask me to search for information about this video's topic.*`,
                    },
                ],
            };

        } catch (innerError) {
            console.error("Transcript fetch inner error:", innerError.message);
            return {
                content: [
                    {
                        type: "text",
                        text: `⚠️ **Transcript unavailable** for video ID: ${videoId}\n\nThe video may not have captions, or they're disabled by the creator.\n\n💡 *Try: "Search for [video topic] and summarize the key points"*`,
                    },
                ],
            };
        }
    } catch (error) {
        console.error("Transcript fetch error:", error);
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Failed to fetch transcript: ${error.message}`,
                },
            ],
        };
    }
}

/**
 * Fetch and summarize content from an article URL
 */
export async function summarize_article(url) {
    try {
        // Fetch the article content
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            timeout: 15000,
        });

        const html = response.data;

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Untitled Article';

        // Extract meta description
        const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
            html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
        const metaDesc = metaDescMatch ? metaDescMatch[1] : '';

        // Extract main content - remove scripts, styles, and HTML tags
        let content = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
            .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
            .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
            .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();

        // Limit content length for processing
        const maxLength = 8000;
        if (content.length > maxLength) {
            content = content.substring(0, maxLength) + '...';
        }

        // Count words
        const wordCount = content.split(/\s+/).length;

        return {
            content: [
                {
                    type: "text",
                    text: `📰 **Article Content Extracted**\n\n**Title:** ${title}\n**URL:** ${url}\n**Word Count:** ~${wordCount} words\n${metaDesc ? `**Summary:** ${metaDesc}\n` : ''}\n---\n\n**Full Content:**\n\n${content}`,
                },
            ],
        };
    } catch (error) {
        console.error("Article fetch error:", error);
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Failed to fetch article: ${error.message}\n\n💡 *The website may be blocking automated requests. Try copying the article text directly.*`,
                },
            ],
        };
    }
}

/**
 * Extract important points/key takeaways from text or URL
 * This prepares the content and returns it for the AI to process
 */
export async function extract_key_points(input, numPoints = 5) {
    try {
        let content = input;
        let sourceType = "text";
        let sourceInfo = "";

        // Check if input is a URL
        if (input.startsWith("http://") || input.startsWith("https://")) {
            // Check if it's a YouTube URL
            if (input.includes("youtube.com") || input.includes("youtu.be")) {
                const transcriptResult = await fetch_transcript(input);
                const transcriptText = transcriptResult.content[0].text;

                if (transcriptText.includes("❌") || transcriptText.includes("⚠️")) {
                    return transcriptResult; // Return error as-is
                }

                content = transcriptText;
                sourceType = "youtube";
                sourceInfo = input;
            } else {
                // It's an article URL
                const articleResult = await summarize_article(input);
                const articleText = articleResult.content[0].text;

                if (articleText.includes("❌")) {
                    return articleResult; // Return error as-is
                }

                content = articleText;
                sourceType = "article";
                sourceInfo = input;
            }
        }

        // Return the content with instructions for the AI to extract key points
        return {
            content: [
                {
                    type: "text",
                    text: `🔍 **Content Ready for Key Point Extraction**\n\n**Source Type:** ${sourceType}\n${sourceInfo ? `**Source:** ${sourceInfo}\n` : ''}**Requested Points:** ${numPoints}\n\n---\n\n**Content to Analyze:**\n\n${content}\n\n---\n\n📌 *Please extract the ${numPoints} most important key takeaways from this content. Format them as a numbered list with brief explanations.*`,
                },
            ],
        };
    } catch (error) {
        console.error("Key points extraction error:", error);
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Failed to extract content: ${error.message}`,
                },
            ],
        };
    }
}
