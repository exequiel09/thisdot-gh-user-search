
export interface GitHubApiQueryParams {
  page: number;
  limit: number;
  per_page?: number;
  q: string;
}

export interface BaseGitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface GitHubUser extends BaseGitHubUser {
  name: string;
  company: string | null;
  blog: string | null;
  location: string;
  email: string | null;
  hireable: boolean;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  stars?: number;
}

export interface GitHubUserSearchResultItem extends BaseGitHubUser {
  score: number;
}

export interface GitHubSearchResults<T = Record<string, string>> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

export type GitHubUserSearchResults = GitHubSearchResults<GitHubUserSearchResultItem>;


