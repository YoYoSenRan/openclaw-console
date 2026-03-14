export interface DiscoverOpenClawResult {
  status: "found" | "not_found";
  reason?: "config_missing" | "docker_env";
  url?: string;
  authMode?: "token" | "password";
  token?: string;
  password?: string;
}
