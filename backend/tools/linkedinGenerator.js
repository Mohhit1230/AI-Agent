import axios from "axios";
import { config } from "dotenv";
config();

/**
 * LinkedIn Post Generator Tool - Direct API Integration
 * 
 * Uses LinkedIn's official API for:
 * - Posting content directly to LinkedIn
 * - Fetching user profile information
 * 
 * Setup: Complete OAuth manually ONCE, then paste access token in .env
 * The access token lasts 60 days, then needs to be refreshed.
 */

// LinkedIn API Configuration
const LINKEDIN_API_BASE = "https://api.linkedin.com/v2";

// Get access token from environment
const getAccessToken = () => process.env.LINKEDIN_ACCESS_TOKEN;

// Industry hashtags database
const INDUSTRY_KEYWORDS = {
    tech: ['AI', 'MachineLearning', 'CloudComputing', 'DevOps', 'CyberSecurity', 'DataScience', 'StartupLife', 'TechTwitter', 'Innovation', 'DigitalTransformation'],
    business: ['Leadership', 'Entrepreneurship', 'BusinessGrowth', 'Strategy', 'Management', 'StartupFounder', 'CEO', 'BusinessTips', 'GrowthMindset', 'Success'],
    career: ['CareerAdvice', 'JobSearch', 'ProfessionalDevelopment', 'CareerGrowth', 'Networking', 'PersonalBranding', 'Hiring', 'OpenToWork', 'CareerChange', 'NewJob'],
    marketing: ['DigitalMarketing', 'ContentMarketing', 'SocialMediaMarketing', 'SEO', 'BrandBuilding', 'MarketingStrategy', 'GrowthHacking', 'ContentCreator', 'B2B', 'Branding'],
    finance: ['FinTech', 'Investment', 'VentureCapital', 'StartupFunding', 'Finance', 'CryptoInvesting', 'PersonalFinance', 'WealthManagement', 'Banking', 'EconomicTrends'],
    hr: ['HR', 'TalentAcquisition', 'EmployeeExperience', 'PeopleOps', 'WorkplaceCulture', 'Diversity', 'Inclusion', 'RemoteWork', 'FutureOfWork', 'TeamBuilding'],
    personal: ['Motivation', 'Success', 'Mindset', 'Productivity', 'PersonalGrowth', 'SelfImprovement', 'WorkLifeBalance', 'MentalHealth', 'Gratitude', 'Inspiration'],
};

// Engagement tips by post type
const ENGAGEMENT_TIPS = {
    achievement: {
        bestTime: "Tuesday-Thursday, 8-10 AM or 5-6 PM",
        format: "Personal story + specific numbers + lesson learned",
        hooks: ["I never thought I'd be writing this post...", "After X years, I finally...", "Today marks a milestone..."],
        length: "1300-1500 characters performs best",
    },
    announcement: {
        bestTime: "Monday-Wednesday, 9-11 AM",
        format: "Clear headline + context + what's next",
        hooks: ["Exciting news!", "I'm thrilled to announce...", "Big update:"],
        length: "800-1200 characters",
    },
    thought_leadership: {
        bestTime: "Tuesday-Thursday, 7-9 AM",
        format: "Contrarian take or unique insight + supporting points + takeaway",
        hooks: ["Unpopular opinion:", "Here's what nobody tells you about...", "I changed my mind about..."],
        length: "1500-2000 characters",
    },
    lessons_learned: {
        bestTime: "Wednesday-Friday, 8-10 AM",
        format: "Situation + what went wrong/right + lessons",
        hooks: ["X lessons from Y years of...", "What I wish I knew before...", "The biggest mistake I made..."],
        length: "1200-1800 characters",
    },
    celebration: {
        bestTime: "Any weekday, lunch hours (12-1 PM)",
        format: "Gratitude + journey + acknowledgments",
        hooks: ["Today I'm celebrating...", "Grateful for this moment...", "X years ago, I could never imagine..."],
        length: "800-1200 characters",
    }
};

/**
 * Create LinkedIn API client with authentication
 */
const createLinkedInClient = () => {
    const accessToken = getAccessToken();

    if (!accessToken) {
        throw new Error("LINKEDIN_ACCESS_TOKEN not set. See setup guide in .env");
    }

    return axios.create({
        baseURL: LINKEDIN_API_BASE,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202401'
        }
    });
};

/**
 * Get the authenticated user's LinkedIn profile
 */
export async function get_user_profile() {
    try {
        const client = createLinkedInClient();

        // Get user info
        const userInfoResponse = await client.get('/userinfo');
        const userInfo = userInfoResponse.data;

        // Get the user's URN for posting
        const meResponse = await client.get('/me');
        const profile = meResponse.data;

        return {
            content: [{
                type: "text",
                text: `👤 **LinkedIn Profile Retrieved**

## Your Profile:
- **Name:** ${userInfo.name || `${profile.localizedFirstName} ${profile.localizedLastName}`}
- **Email:** ${userInfo.email || 'Not available'}
- **LinkedIn ID:** ${profile.id}

✅ **API Connected!** You can now post directly to LinkedIn.`
            }],
            profileId: profile.id,
            urn: `urn:li:person:${profile.id}`
        };
    } catch (error) {
        console.error("Profile fetch error:", error.response?.data || error);

        if (error.message?.includes("LINKEDIN_ACCESS_TOKEN")) {
            return {
                content: [{
                    type: "text",
                    text: `❌ **LinkedIn Not Configured**

Please complete the one-time OAuth setup. See the setup guide!`
                }]
            };
        }

        if (error.response?.status === 401) {
            return {
                content: [{
                    type: "text",
                    text: `❌ **Access Token Expired**

Your LinkedIn access token has expired (they last 60 days).
Please refresh it following the setup guide.`
                }]
            };
        }

        return {
            content: [{
                type: "text",
                text: `❌ Failed to fetch profile: ${error.response?.data?.message || error.message}`
            }]
        };
    }
}

/**
 * Publish a post directly to LinkedIn
 */
export async function publish_post(content, visibility = "PUBLIC") {
    try {
        const client = createLinkedInClient();

        // Get the user's URN
        const meResponse = await client.get('/me');
        const authorUrn = `urn:li:person:${meResponse.data.id}`;

        // Create the post using UGC API
        const postData = {
            author: authorUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: content
                    },
                    shareMediaCategory: "NONE"
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": visibility
            }
        };

        const response = await client.post('/ugcPosts', postData);

        const postId = response.headers['x-restli-id'] || response.data.id;
        const postUrl = `https://www.linkedin.com/feed/update/${postId}`;

        return {
            content: [{
                type: "text",
                text: `✅ **Posted to LinkedIn!**

🔗 **View Post:** ${postUrl}

**Visibility:** ${visibility}

---

**Content:**
\`\`\`
${content.substring(0, 300)}${content.length > 300 ? '...' : ''}
\`\`\`

💡 Engage with comments in the first hour for max reach!`
            }],
            postId: postId,
            postUrl: postUrl
        };
    } catch (error) {
        console.error("Post publish error:", error.response?.data || error);

        if (error.message?.includes("LINKEDIN_ACCESS_TOKEN")) {
            return {
                content: [{
                    type: "text",
                    text: `❌ **LinkedIn Not Configured** - Set LINKEDIN_ACCESS_TOKEN in .env`
                }]
            };
        }

        if (error.response?.status === 401) {
            return {
                content: [{
                    type: "text",
                    text: `❌ **Token Expired** - Refresh your access token (60-day expiry)`
                }]
            };
        }

        if (error.response?.status === 403) {
            return {
                content: [{
                    type: "text",
                    text: `❌ **Permission Denied** - Make sure "Share on LinkedIn" product is enabled in your app`
                }]
            };
        }

        return {
            content: [{
                type: "text",
                text: `❌ Failed to publish: ${error.response?.data?.message || error.message}`
            }]
        };
    }
}

/**
 * Publish a post with an image/link to LinkedIn
 */
export async function publish_post_with_image(content, imageUrl, visibility = "PUBLIC") {
    try {
        const client = createLinkedInClient();

        const meResponse = await client.get('/me');
        const authorUrn = `urn:li:person:${meResponse.data.id}`;

        const postData = {
            author: authorUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: content
                    },
                    shareMediaCategory: "ARTICLE",
                    media: [{
                        status: "READY",
                        originalUrl: imageUrl,
                        title: { text: "Shared Image" }
                    }]
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": visibility
            }
        };

        const response = await client.post('/ugcPosts', postData);
        const postId = response.headers['x-restli-id'] || response.data.id;

        return {
            content: [{
                type: "text",
                text: `✅ **Posted with Image!**

🔗 https://www.linkedin.com/feed/update/${postId}`
            }],
            postId: postId
        };
    } catch (error) {
        console.error("Image post error:", error.response?.data || error);
        return {
            content: [{
                type: "text",
                text: `❌ Failed to post: ${error.response?.data?.message || error.message}`
            }]
        };
    }
}

/**
 * Search for people info (provides search guidance)
 */
export async function search_people_info(query, context = '') {
    const accessToken = getAccessToken();

    return {
        content: [{
            type: "text",
            text: `🔍 **LinkedIn Search: "${query}"**

${accessToken ? '✅ API Connected' : '⚠️ API not configured'}

**Direct Search Link:**
🔗 https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}

**Context:** ${context || 'General search'}

💡 When mentioning someone in a post, include their title and why you're tagging them.`
        }]
    };
}

// Helper functions
function detectPostType(content) {
    content = content.toLowerCase();

    if (content.includes('achieved') || content.includes('accomplished') || content.includes('milestone')) {
        return 'achievement';
    }
    if (content.includes('announce') || content.includes('excited to share') || content.includes('launching')) {
        return 'announcement';
    }
    if (content.includes('lesson') || content.includes('learned') || content.includes('mistake')) {
        return 'lessons_learned';
    }
    if (content.includes('grateful') || content.includes('thankful') || content.includes('celebrate')) {
        return 'celebration';
    }

    return 'thought_leadership';
}

function detectIndustries(content) {
    content = content.toLowerCase();
    const detected = [];

    if (/\b(ai|machine learning|software|developer|coding|tech|startup|cloud|data)\b/i.test(content)) {
        detected.push('tech');
    }
    if (/\b(business|company|entrepreneur|ceo|founder|growth|revenue)\b/i.test(content)) {
        detected.push('business');
    }
    if (/\b(career|job|hired|promotion|role|position|work)\b/i.test(content)) {
        detected.push('career');
    }
    if (/\b(marketing|brand|content|social media|seo)\b/i.test(content)) {
        detected.push('marketing');
    }
    if (/\b(finance|investment|funding|capital|money)\b/i.test(content)) {
        detected.push('finance');
    }
    if (/\b(hiring|team|culture|employee|talent|remote)\b/i.test(content)) {
        detected.push('hr');
    }

    detected.push('personal');
    return [...new Set(detected)];
}

/**
 * Draft a LinkedIn post (with option to publish directly)
 */
export async function draft_linkedin_post(
    achievement,
    context = '',
    tone = 'professional',
    postType = 'auto',
    includeEmojis = true,
    autoPublish = false
) {
    try {
        const detectedType = postType === 'auto' ? detectPostType(achievement) : postType;
        const tips = ENGAGEMENT_TIPS[detectedType] || ENGAGEMENT_TIPS.achievement;
        const industries = detectIndustries(achievement + ' ' + context);

        // Generate hashtags
        let hashtags = [];
        industries.forEach(industry => {
            hashtags.push(...(INDUSTRY_KEYWORDS[industry] || []).slice(0, 2));
        });
        hashtags = [...new Set(hashtags)].slice(0, 5);

        const hook = tips.hooks[Math.floor(Math.random() * tips.hooks.length)];

        const emojis = {
            achievement: '🏆',
            announcement: '📣',
            thought_leadership: '💡',
            lessons_learned: '📚',
            celebration: '🎉'
        };

        const generatedPost = `${includeEmojis ? emojis[detectedType] + ' ' : ''}${hook}

${achievement}

${context ? context + '\n' : ''}
${includeEmojis ? '💬 ' : ''}What's your take on this? I'd love to hear your thoughts!

${hashtags.map(tag => `#${tag}`).join(' ')}`;

        // Auto-publish if requested
        const accessToken = getAccessToken();
        let publishResult = null;

        if (autoPublish && accessToken) {
            publishResult = await publish_post(generatedPost);
        }

        return {
            content: [{
                type: "text",
                text: `📝 **LinkedIn Post ${autoPublish && publishResult ? 'Published!' : 'Draft'}**

---

## Post:
\`\`\`
${generatedPost}
\`\`\`

---

**Type:** ${detectedType.replace('_', ' ').toUpperCase()} | **Length:** ${generatedPost.length} chars

**Best Time:** ${tips.bestTime}

${autoPublish && publishResult ? publishResult.content[0].text :
                        `📤 Use \`linkedinPublishPost\` to post directly!`}

${!accessToken ? '⚠️ Set LINKEDIN_ACCESS_TOKEN for direct posting' : ''}`
            }],
            generatedPost: generatedPost,
            postType: detectedType,
            hashtags: hashtags
        };
    } catch (error) {
        console.error("Draft post error:", error);
        return {
            content: [{
                type: "text",
                text: `❌ Failed to draft post: ${error.message}`
            }]
        };
    }
}

/**
 * Suggest hashtags for LinkedIn post
 */
export async function suggest_hashtags(content, count = 10) {
    try {
        const industries = detectIndustries(content);

        let hashtags = [];
        industries.forEach(industry => {
            hashtags.push(...(INDUSTRY_KEYWORDS[industry] || []));
        });

        hashtags = [...new Set(hashtags)].slice(0, count);

        return {
            content: [{
                type: "text",
                text: `🏷️ **Hashtag Suggestions**

**Industries:** ${industries.join(', ')}

## Copy-Paste:
\`\`\`
${hashtags.slice(0, 5).map(h => `#${h}`).join(' ')}
\`\`\`

## All Recommendations:
${hashtags.map(h => `#${h}`).join('  ')}

💡 Use 3-5 hashtags per post for optimal reach.`
            }],
            hashtags: hashtags,
            industries: industries
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `❌ Failed: ${error.message}`
            }]
        };
    }
}

/**
 * Analyze post engagement potential
 */
export async function analyze_engagement(postContent, targetAudience = 'professionals') {
    try {
        const charCount = postContent.length;
        const wordCount = postContent.split(/\s+/).length;
        const lineCount = postContent.split('\n').filter(l => l.trim()).length;
        const hashtagCount = (postContent.match(/#\w+/g) || []).length;
        const questionCount = (postContent.match(/\?/g) || []).length;

        const postType = detectPostType(postContent);
        const tips = ENGAGEMENT_TIPS[postType];

        let score = 70;
        const issues = [];
        const strengths = [];

        if (charCount >= 1000 && charCount <= 1500) {
            score += 10;
            strengths.push("✅ Optimal length");
        } else if (charCount < 500) {
            score -= 10;
            issues.push("Too short - aim for 1000+ chars");
        }

        if (lineCount >= 5) {
            score += 5;
            strengths.push("✅ Good whitespace");
        }

        if (hashtagCount >= 3 && hashtagCount <= 5) {
            score += 10;
            strengths.push("✅ Perfect hashtag count");
        } else if (hashtagCount === 0) {
            score -= 10;
            issues.push("Add 3-5 hashtags");
        }

        if (questionCount > 0) {
            score += 10;
            strengths.push("✅ Includes question");
        } else {
            issues.push("Add a question for engagement");
        }

        score = Math.max(0, Math.min(100, score));
        const scoreLabel = score >= 85 ? '🌟 EXCELLENT' : score >= 70 ? '👍 GOOD' : '⚠️ NEEDS WORK';

        return {
            content: [{
                type: "text",
                text: `📊 **Engagement Analysis**

## Score: ${score}/100 ${scoreLabel}

| Metric | Your Post | Optimal |
|--------|-----------|---------|
| Characters | ${charCount} | 1000-1500 |
| Words | ${wordCount} | 150-250 |
| Hashtags | ${hashtagCount} | 3-5 |
| Questions | ${questionCount} | 1-2 |

**Strengths:**
${strengths.join('\n') || 'Keep improving!'}

**To Improve:**
${issues.map(i => `• ${i}`).join('\n') || '• Looks great!'}

**Best Time:** ${tips.bestTime}`
            }],
            score: score,
            postType: postType
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `❌ Analysis failed: ${error.message}`
            }]
        };
    }
}
