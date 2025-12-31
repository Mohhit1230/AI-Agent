import { twitterPost } from "./tools/twitterPost.js";
import { email } from "./tools/email.js";
import { editPDF, generatePdf } from "./tools/generatePdf.js";
import { keep_add_note, keep_archive_note, keep_delete_note, keep_list_notes, keep_update_note } from "./tools/google/keep_api.js";
import { add_event, list_events, view_day } from "./tools/google/calender_api.js";
import { list_files, read_file, update_code } from "./tools/localFileSys.js";
import { check_status, commit_all, create_issue, create_pull_request, get_repo_stats, get_user_profile, list_commits, list_issues, list_pull_requests, push } from "./tools/github_tools.js";
import { fetch_transcript, summarize_article, extract_key_points } from "./tools/contentSummarizer.js";
import { config } from "dotenv";
config();

// TWITTER
export function createPost(status) {
  return twitterPost(status);
}
// SEND EMAIL
export function sendEmail({ to, subject, text }) {
  return email({ to, subject, text });
}

// Edit PDF
export function editExistingPDF(fileBuffer, newText) {
  return editPDF(fileBuffer, newText);
}

// PDF Generation
export function generatePDF(content) {
  return generatePdf(content);
}

// Google Calender 
export function calendar_list_events(maxResults = 10) {
  return list_events(maxResults = 10);
}

export function calendar_add_event(
  summary,
  description,
  startTime,
  endTime,
  location = ""
) {
  return add_event(summary,
    description,
    startTime,
    endTime,
    location = "");
}

export function calendar_view_day(date) {
  return view_day(date);
}



// Google Keep Tools
export function keepListNotes() {
  return keep_list_notes();
}

export function keepAddNote(title, text) {
  return keep_add_note(title, text);
}

export function keepUpdateNote(id, title, text) {
  return keep_update_note(id, title, text);
}

export function keepArchiveNote(id, archive) {
  return keep_archive_note(id, archive);
}

export function keepDeleteNote(id, delete_note) {
  return keep_delete_note(id, delete_note);
}

// Local File System Reader/Writer
export function read_project_file(filePath) {
  return read_file(filePath);
}

export function update_code_snippet(filePath, content) {
  return update_code(filePath, content);
}

export function list_project_files(dirPath) {
  return list_files(dirPath);
}


// GITHUB TOOLS
export function git_check_status() {
  return check_status();
}

export function github_create_issue(owner, repo, title, body) {
  return create_issue(owner, repo, title, body);
}

export function git_list_commits(count = 10) {
  return list_commits(count = 10);
}
export function git_commit_all(message) {
  return commit_all(message);
}

export function git_push() {
  return push();
}

export function github_create_pull_request(
  owner,
  repo,
  title,
  body,
  head,
  base = "main"
) {
  return create_pull_request(owner,
    repo,
    title,
    body,
    head,
    base = "main");
}

export function github_list_issues(owner, repo, state = "open") {
  return list_issues(owner, repo, state = "open");
}

export function github_list_pull_requests(owner, repo, state = "open") {
  return list_pull_requests(owner, repo, state = "open");
}

export function github_get_repo_stats(owner, repo) {
  return get_repo_stats(owner, repo);
}

export function github_get_user_profile(username) {
  return get_user_profile(username);
}

// CONTENT SUMMARIZER TOOLS
export function youtube_fetch_transcript(url) {
  return fetch_transcript(url);
}

export function article_summarize(url) {
  return summarize_article(url);
}

export function content_extract_key_points(input, numPoints = 5) {
  return extract_key_points(input, numPoints);
}
