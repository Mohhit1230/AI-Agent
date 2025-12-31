import { exec } from "child_process";
import { promisify } from "util";
import { config } from "dotenv";
const execAsync = promisify(exec);
config();


export async function check_status() {
  try {
    const { stdout, stderr } = await execAsync("git status");
    if (stderr && !stdout) {
      return {
        content: [{ type: "text", text: `❌ Git status error: ${stderr}` }],
      };
    }
    return { content: [{ type: "text", text: `Git Status:\n\n${stdout}` }] };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `❌ Git status failed: ${error.message}` },
      ],
    };
  }
}

export async function create_issue(owner, repo, title, body) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return {
      content: [
        {
          type: "text",
          text: "⚠️ GITHUB_TOKEN is not set in the .env file. Please add it to use GitHub tools.",
        },
      ],
    };
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to create GitHub issue: ${errorData.message}`,
          },
        ],
      };
    }

    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: `✅ GitHub issue created successfully: ${data.html_url}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error creating GitHub issue: ${error.message}`,
        },
      ],
    };
  }
}

export async function list_commits(count = 10) {
  try {
    const { stdout } = await execAsync(`git log -n ${count} --oneline`);
    return {
      content: [
        { type: "text", text: `Latest ${count} commits:\n\n${stdout}` },
      ],
    };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `❌ Failed to list commits: ${error.message}` },
      ],
    };
  }
}
export async function commit_all(message) {
  try {
    await execAsync("git add .");
    const { stdout } = await execAsync(`git commit -m "${message}"`);
    return {
      content: [{ type: "text", text: `✅ Committed changes: ${stdout}` }],
    };
  } catch (error) {
    return {
      content: [
        { type: "text", text: `❌ Git commit failed: ${error.message}` },
      ],
    };
  }
}

export async function push() {
  try {
    const { stdout } = await execAsync("git push");
    return {
      content: [{ type: "text", text: `✅ Pushed changes: ${stdout}` }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `❌ Git push failed: ${error.message}` }],
    };
  }
}

export async function create_pull_request(
  owner,
  repo,
  title,
  body,
  head,
  base = "main"
) {
  const token = process.env.GITHUB_TOKEN;
  if (!token)
    return { content: [{ type: "text", text: "⚠️ GITHUB_TOKEN missing." }] };

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body, head, base }),
      }
    );

    const data = await response.json();
    if (!response.ok)
      return {
        content: [{ type: "text", text: `❌ PR failed: ${data.message}` }],
      };
    return {
      content: [{ type: "text", text: `✅ PR created: ${data.html_url}` }],
    };
  } catch (error) {
    return { content: [{ type: "text", text: `❌ Error: ${error.message}` }] };
  }
}

export async function list_issues(owner, repo, state = "open") {
  const token = process.env.GITHUB_TOKEN;
  try {
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (token) headers["Authorization"] = `token ${token}`;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}`,
      { headers }
    );
    const data = await response.json();
    if (!response.ok)
      return {
        content: [{ type: "text", text: `❌ Failed: ${data.message}` }],
      };

    const issues = data
      .filter((i) => !i.pull_request)
      .map((i) => `#${i.number} ${i.title} (${i.state})`)
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `Issues in ${owner}/${repo}:\n\n${issues || "No issues found."
            }`,
        },
      ],
    };
  } catch (error) {
    return { content: [{ type: "text", text: `❌ Error: ${error.message}` }] };
  }
}

export async function list_pull_requests(owner, repo, state = "open") {
  const token = process.env.GITHUB_TOKEN;
  try {
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (token) headers["Authorization"] = `token ${token}`;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}`,
      { headers }
    );
    const data = await response.json();
    if (!response.ok)
      return {
        content: [{ type: "text", text: `❌ Failed: ${data.message}` }],
      };

    const prs = data
      .map((p) => `#${p.number} ${p.title} (${p.state})`)
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text: `PRs in ${owner}/${repo}:\n\n${prs || "No PRs found."}`,
        },
      ],
    };
  } catch (error) {
    return { content: [{ type: "text", text: `❌ Error: ${error.message}` }] };
  }
}

export async function get_repo_stats(owner, repo) {
  const token = process.env.GITHUB_TOKEN;
  try {
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (token) headers["Authorization"] = `token ${token}`;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );
    const data = await response.json();
    if (!response.ok)
      return {
        content: [{ type: "text", text: `❌ Failed: ${data.message}` }],
      };

    const stats = `Repo: ${data.full_name}\nDescription: ${data.description}\nStars: ${data.stargazers_count}\nForks: ${data.forks_count}\nLanguage: ${data.language}\nVisibility: ${data.visibility}`;
    return { content: [{ type: "text", text: stats }] };
  } catch (error) {
    return { content: [{ type: "text", text: `❌ Error: ${error.message}` }] };
  }
}

export async function get_user_profile(username) {
  const token = process.env.GITHUB_TOKEN;
  try {
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (token) headers["Authorization"] = `token ${token}`;

    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers,
    });
    const data = await response.json();
    if (!response.ok)
      return {
        content: [{ type: "text", text: `❌ Failed: ${data.message}` }],
      };

    const profile = `User: ${data.login} (${data.name || "N/A"})\nBio: ${data.bio || "N/A"
      }\nPublic Repos: ${data.public_repos}\nFollowers: ${data.followers
      }\nFollowing: ${data.following}\nLocation: ${data.location || "N/A"}`;
    return { content: [{ type: "text", text: profile }] };
  } catch (error) {
    return { content: [{ type: "text", text: `❌ Error: ${error.message}` }] };
  }
}
